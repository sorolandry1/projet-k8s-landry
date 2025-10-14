# Guide de Déploiement

Ce guide décrit comment déployer Recipe App en production.

## Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration de l'Environnement](#configuration-de-lenvironnement)
3. [Déploiement avec Kubernetes](#déploiement-avec-kubernetes)
4. [Configuration SSL/TLS](#configuration-ssltls)
5. [Monitoring et Logs](#monitoring-et-logs)
6. [Backup et Restauration](#backup-et-restauration)
7. [Mise à l'Échelle](#mise-à-léchelle)

## Prérequis

### Infrastructure

- Cluster Kubernetes (v1.25+)
  - GKE, EKS, AKS, ou on-premise
- Ingress Controller (NGINX recommandé)
- Storage class pour PersistentVolumes
- Registry Docker (GitHub Container Registry, Docker Hub, etc.)

### Outils Locaux

```bash
# kubectl
kubectl version --client

# helm (optionnel)
helm version

# Docker
docker version
```

## Configuration de l'Environnement

### 1. Variables de Production

Créer les secrets Kubernetes :

```bash
# Créer le namespace
kubectl create namespace recipe-app-prod

# Créer le secret pour PostgreSQL
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  -n recipe-app-prod

# Créer le secret pour JWT
kubectl create secret generic app-secret \
  --from-literal=SECRET_KEY=$(openssl rand -base64 64) \
  -n recipe-app-prod
```

### 2. ConfigMap de Production

```yaml
# k8s/prod/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: recipe-config
  namespace: recipe-app-prod
data:
  POSTGRES_DB: recipedb_prod
  POSTGRES_USER: recipeuser
  CORS_ORIGINS: "https://recipe.example.com"
  ENVIRONMENT: "production"
```

Appliquer :
```bash
kubectl apply -f k8s/prod/configmap.yaml
```

## Déploiement avec Kubernetes

### 1. Build et Push des Images

```bash
# Build
docker build -t ghcr.io/username/recipe-backend:v1.0.0 ./backend
docker build -t ghcr.io/username/recipe-frontend:v1.0.0 ./frontend

# Push
docker push ghcr.io/username/recipe-backend:v1.0.0
docker push ghcr.io/username/recipe-frontend:v1.0.0
```

### 2. Déploiement PostgreSQL avec Haute Disponibilité

```yaml
# k8s/prod/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: recipe-app-prod
spec:
  replicas: 1  # Pour HA, utiliser un opérateur comme Patroni
  serviceName: postgres
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          resources:
            requests:
              memory: "1Gi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: fast-ssd  # Utiliser un storage rapide en prod
        resources:
          requests:
            storage: 50Gi
```

### 3. Déploiement Backend

```yaml
# k8s/prod/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: recipe-app-prod
spec:
  replicas: 3  # Multiple réplicas pour HA
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: backend
          image: ghcr.io/username/recipe-backend:v1.0.0
          imagePullPolicy: Always
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
```

### 4. HorizontalPodAutoscaler

```yaml
# k8s/prod/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: recipe-app-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 5. Déployer Tout

```bash
# Script de déploiement production
./scripts/deploy-prod.sh

# Ou manuellement
kubectl apply -f k8s/prod/
kubectl rollout status deployment/backend -n recipe-app-prod
kubectl rollout status deployment/frontend -n recipe-app-prod
```

## Configuration SSL/TLS

### 1. Installer cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### 2. Créer un ClusterIssuer (Let's Encrypt)

```yaml
# k8s/prod/cert-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

### 3. Ingress avec TLS

```yaml
# k8s/prod/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: recipe-ingress
  namespace: recipe-app-prod
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - recipe.example.com
      secretName: recipe-tls
  rules:
    - host: recipe.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

## Monitoring et Logs

### 1. Prometheus & Grafana

```bash
# Installer Prometheus Stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

### 2. Logging avec EFK Stack

```bash
# Elasticsearch, Fluent Bit, Kibana
kubectl apply -f k8s/monitoring/efk/
```

### 3. Métriques Custom

Ajouter au backend :
```python
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)
```

## Backup et Restauration

### 1. Backup Automatique PostgreSQL

```yaml
# k8s/prod/cronjob-backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: recipe-app-prod
spec:
  schedule: "0 2 * * *"  # 2h du matin chaque jour
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: postgres:15-alpine
              command:
                - /bin/sh
                - -c
                - |
                  pg_dump -h postgres -U $POSTGRES_USER $POSTGRES_DB | \
                  gzip > /backup/backup-$(date +%Y%m%d-%H%M%S).sql.gz
                  # Upload vers S3/GCS
              volumeMounts:
                - name: backup
                  mountPath: /backup
          volumes:
            - name: backup
              persistentVolumeClaim:
                claimName: backup-pvc
          restartPolicy: OnFailure
```

### 2. Script de Restauration

```bash
#!/bin/bash
# scripts/restore-db.sh

BACKUP_FILE=$1
kubectl exec -it postgres-0 -n recipe-app-prod -- \
  psql -U recipeuser recipedb < $BACKUP_FILE
```

## Mise à l'Échelle

### 1. Scaler Manuellement

```bash
# Backend
kubectl scale deployment backend --replicas=5 -n recipe-app-prod

# Frontend
kubectl scale deployment frontend --replicas=3 -n recipe-app-prod
```

### 2. Cluster Autoscaler

```bash
# GKE
gcloud container clusters update recipe-cluster \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10

# EKS
aws eks update-nodegroup-config \
  --cluster-name recipe-cluster \
  --nodegroup-name recipe-nodes \
  --scaling-config minSize=3,maxSize=10,desiredSize=5
```

## Rollback

En cas de problème :

```bash
# Rollback du backend
kubectl rollout undo deployment/backend -n recipe-app-prod

# Rollback vers une version spécifique
kubectl rollout undo deployment/backend --to-revision=2 -n recipe-app-prod

# Vérifier l'historique
kubectl rollout history deployment/backend -n recipe-app-prod
```

## Checklist de Production

- [ ] Secrets sécurisés générés
- [ ] SSL/TLS configuré
- [ ] Backup automatique configuré
- [ ] Monitoring actif
- [ ] Logs centralisés
- [ ] Autoscaling configuré
- [ ] Resource limits définis
- [ ] Health checks configurés
- [ ] Network policies appliquées
- [ ] RBAC configuré
- [ ] Disaster recovery plan documenté

## Support

Pour aide en production :
- 📧 ops@example.com
- 🚨 PagerDuty: https://example.pagerduty.com
- 📊 Grafana: https://grafana.example.com

