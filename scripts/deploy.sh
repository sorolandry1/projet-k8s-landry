#!/bin/bash
set -e

echo "🚀 Déploiement de l'application Recipe..."
echo ""

# Couleurs
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 1. Build des images
echo -e "${BLUE}1. Build des images Docker...${NC}"
docker build -t recipe-backend:latest ./backend
docker build -t recipe-frontend:latest ./frontend
echo -e "${GREEN}✓ Images buildées${NC}"
echo ""

# 2. Chargement dans Kind
echo -e "${BLUE}2. Chargement des images dans Kind...${NC}"
kind load docker-image recipe-backend:latest --name recipe-cluster
kind load docker-image recipe-frontend:latest --name recipe-cluster
echo -e "${GREEN}✓ Images chargées${NC}"
echo ""

# 3. Déploiement des ressources
echo -e "${BLUE}3. Déploiement des ressources Kubernetes...${NC}"
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/storage-pvc.yaml
echo -e "${GREEN}✓ ConfigMaps et Secrets appliqués${NC}"
echo ""

# 4. Déploiement de PostgreSQL
echo -e "${BLUE}4. Déploiement de PostgreSQL...${NC}"
kubectl apply -f k8s/postgres-statefulset.yaml
echo "Attente de PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n recipe-app --timeout=120s
echo -e "${GREEN}✓ PostgreSQL déployé et prêt${NC}"
echo ""

# 5. Déploiement du Backend
echo -e "${BLUE}5. Déploiement du Backend...${NC}"
kubectl apply -f k8s/backend-deployment.yaml
echo "Attente du backend..."
kubectl wait --for=condition=ready pod -l app=backend -n recipe-app --timeout=120s
echo -e "${GREEN}✓ Backend déployé et prêt${NC}"
echo ""

# 6. Déploiement du Frontend
echo -e "${BLUE}6. Déploiement du Frontend...${NC}"
kubectl apply -f k8s/frontend-deployment.yaml
echo "Attente du frontend..."
kubectl wait --for=condition=ready pod -l app=frontend -n recipe-app --timeout=120s
echo -e "${GREEN}✓ Frontend déployé et prêt${NC}"
echo ""

# 7. Déploiement de l'Ingress
echo -e "${BLUE}7. Déploiement de l'Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml
echo -e "${GREEN}✓ Ingress déployé${NC}"
echo ""

# 8. Vérification finale
echo -e "${BLUE}8. Vérification finale...${NC}"
kubectl get pods -n recipe-app
echo ""

echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
echo ""
echo -e "${BLUE}Pour accéder à l'application:${NC}"
echo "1. Ajoutez '127.0.0.1 recipe.local' à votre fichier /etc/hosts"
echo "2. Visitez http://recipe.local dans votre navigateur"
echo ""
echo -e "${BLUE}Commandes utiles:${NC}"
echo "  - Voir les logs backend: make k8s-logs-backend"
echo "  - Voir les logs frontend: make k8s-logs-frontend"
echo "  - Vérifier le statut: make k8s-status"

