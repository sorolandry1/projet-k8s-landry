# 🍳 Recipe App - Application de Partage de Recettes

Application web moderne de partage de recettes de cuisine, développée avec **FastAPI** (backend) et **React** (frontend), containerisée avec **Docker** et orchestrée par **Kubernetes (Kind)**.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)

## ✨ Fonctionnalités

### 👥 Gestion des Utilisateurs
- ✅ Inscription et connexion sécurisées (JWT)
- ✅ Profils utilisateurs personnalisables (bio, photo de profil)
- ✅ Validation robuste des mots de passe

### 📝 Gestion des Recettes (CRUD)
- ✅ Création de recettes avec :
  - Titre, description détaillée
  - Temps de préparation et cuisson
  - Nombre de portions
  - Niveau de difficulté (facile, moyen, difficile)
  - Liste d'ingrédients avec quantités
  - Étapes de préparation numérotées
  - Upload de photos (jusqu'à 5 images)
  - Catégories et tags
- ✅ Lecture avec filtres et recherche
- ✅ Modification (propriétaire uniquement)
- ✅ Suppression (propriétaire uniquement)
- ✅ Recherche par titre, ingrédients, catégorie

### 💬 Interactions Sociales
- ✅ **Likes** : Liker/unliker les recettes
- ✅ **Commentaires** : 
  - Ajouter des commentaires
  - Modifier/supprimer ses propres commentaires
  - Modération par l'auteur de la recette
- ✅ Compteurs de likes et commentaires en temps réel

### 📸 Gestion des Images
- ✅ Upload multiple d'images (max 5MB par image)
- ✅ Formats supportés : JPG, PNG, WebP
- ✅ Génération automatique de miniatures
- ✅ Compression et optimisation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Kind Cluster                      │
│  ┌──────────────────────────────────────────────┐  │
│  │              Ingress Controller               │  │
│  └──────────────────┬───────────────────────────┘  │
│                     │                                │
│  ┌──────────────────┴───────────────┐              │
│  │                                    │              │
│  ▼                                    ▼              │
│  ┌──────────────┐         ┌──────────────┐         │
│  │   Frontend   │         │   Backend    │         │
│  │   (React)    │         │  (FastAPI)   │         │
│  │  Deployment  │         │  Deployment  │         │
│  │  + Service   │         │  + Service   │         │
│  └──────────────┘         └──────┬───────┘         │
│                                   │                  │
│                    ┌──────────────┴──────────┐     │
│                    │                         │     │
│                    ▼                         │     │
│         ┌──────────────┐         │          │     │
│         │  PostgreSQL  │         │          │     │
│         │ StatefulSet  │         │          │     │
│         │  + PVC       │         │          │     │
│         └──────────────┘         │          │     │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Stack Technique

### Backend
- **FastAPI** - Framework web Python moderne et performant
- **SQLAlchemy 2.0** - ORM
- **PostgreSQL 15** - Base de données
- **Pydantic V2** - Validation des données
- **JWT** - Authentification
- **Pillow** - Traitement d'images
- **Pytest** - Tests

### Frontend
- **React 18** - Framework JavaScript
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - Requêtes HTTP
- **Tailwind CSS** - Styling

### DevOps
- **Docker** - Containerisation
- **Kubernetes (Kind)** - Orchestration
- **NGINX Ingress** - Reverse proxy
- **GitHub Actions** - CI/CD

## 🚀 Démarrage Rapide

### ⚡ Lancer l'application en 3 commandes

```bash
# 1. Aller dans le projet
cd /home/soro-penatiby-landy/Downloads/recette-app

# 2. Installer les dépendances frontend (une seule fois)
cd frontend && npm ci && cd ..

# 3. Lancer l'application
docker compose up -d
```

**✅ C'est prêt !** Ouvrez http://localhost:5173

### Comptes de test
- Email: `marie@example.com` | Password: `Password123!`
- Email: `jean@example.com` | Password: `Password123!`
- Email: `sophie@example.com` | Password: `Password123!`

### Migrations Alembic
- Les migrations sont appliquées automatiquement quand le backend démarre.
- Pour lancer la mise à jour manuellement : `make alembic-upgrade` ou `docker compose exec backend alembic upgrade head`.
- Pour générer une nouvelle migration après avoir modifié les modèles : `make alembic-revision message="ajout table"`.

---

### Prérequis

- Docker & Docker Compose *(requis)*
- Node.js 18+ *(requis pour le développement frontend)*
- Kind (Kubernetes in Docker) *(optionnel - pour déploiement K8s)*
- kubectl *(optionnel - pour déploiement K8s)*
- Make *(optionnel - pour les commandes automatisées)*
- Python 3.11+ *(optionnel - pour développement backend)*

### Installation des outils

```bash
# Docker (suivez les instructions officielles)
# https://docs.docker.com/get-docker/

# Kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### Méthode 1 : Docker Compose (Développement)

```bash
# 1. Cloner le repository
git clone <votre-repo>
cd recette-app

# 2. Initialiser l'environnement
make init

# 3. Lancer l'application
make docker-up

# 4. Accéder à l'application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Documentation API: http://localhost:8000/api/docs
```

### Méthode 2 : Kubernetes avec Kind (Production)

```bash
# Setup complet en une commande
make setup

# Ou étape par étape :

# 1. Créer le cluster Kind
make kind-create

# 2. Installer l'Ingress Controller
make ingress-install

# 3. Build et charger les images
make build
make kind-load

# 4. Déployer l'application
make k8s-deploy

# 5. Configurer /etc/hosts
echo "127.0.0.1 recipe.local" | sudo tee -a /etc/hosts

# 6. Accéder à l'application
# http://recipe.local
```

## 📋 Commandes Make Disponibles

### Développement
```bash
make install          # Installer les dépendances
make init            # Initialiser .env
make dev-backend     # Lancer backend en dev
make dev-frontend    # Lancer frontend en dev
```

### Docker Compose
```bash
make docker-up       # Démarrer les conteneurs
make docker-down     # Arrêter les conteneurs
make docker-logs     # Voir les logs
make docker-clean    # Nettoyer tout
```

### Kubernetes
```bash
make kind-create     # Créer cluster Kind
make kind-delete     # Supprimer cluster Kind
make k8s-deploy      # Déployer sur K8s
make k8s-delete      # Supprimer les ressources
make k8s-status      # Voir le statut
make k8s-logs-backend   # Logs du backend
make k8s-logs-frontend  # Logs du frontend
```

### Tests & Quality
```bash
make test            # Tous les tests
make test-backend    # Tests backend
make test-frontend   # Tests frontend
make lint            # Linting
```

### Utilitaires
```bash
make shell-backend   # Shell dans le pod backend
make shell-postgres  # Shell PostgreSQL
make port-forward-backend  # Port forwarding backend
make scale-backend REPLICAS=3  # Scaler le backend
make version         # Afficher les versions
```

## 📁 Structure du Projet

```
recette-app/
├── backend/                 # Backend FastAPI
│   ├── app/
│   │   ├── api/            # Routes API
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py
│   │   │       │   ├── recipes.py
│   │   │       │   ├── likes.py
│   │   │       │   └── comments.py
│   │   │       └── router.py
│   │   ├── core/           # Configuration
│   │   ├── db/             # Base de données
│   │   ├── models/         # Modèles SQLAlchemy
│   │   ├── schemas/        # Schémas Pydantic
│   │   ├── services/       # Services métier
│   │   └── main.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── k8s/                    # Manifests Kubernetes
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── postgres-statefulset.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── storage-pvc.yaml
│   └── ingress.yaml
│
├── scripts/                # Scripts d'administration
│   ├── health-check.sh
│   ├── init-data.py
│   ├── deploy.sh
│   └── cleanup.sh
│
├── .github/
│   └── workflows/         # CI/CD
│       ├── ci-cd.yml
│       └── lint.yml
│
├── docker-compose.yml
├── kind-config.yaml
├── Makefile
└── README.md
```

## 🔌 API Endpoints

### Authentification
```http
POST   /api/v1/auth/register      # Inscription
POST   /api/v1/auth/login          # Connexion
GET    /api/v1/auth/me             # Profil actuel
PUT    /api/v1/auth/me             # Modifier profil
GET    /api/v1/auth/users/{id}     # Profil public
```

### Recettes
```http
GET    /api/v1/recipes                    # Liste des recettes
POST   /api/v1/recipes                    # Créer une recette
GET    /api/v1/recipes/{id}               # Détail d'une recette
PUT    /api/v1/recipes/{id}               # Modifier une recette
DELETE /api/v1/recipes/{id}               # Supprimer une recette
POST   /api/v1/recipes/{id}/images        # Upload d'images
```

### Likes
```http
POST   /api/v1/recipes/{id}/like          # Liker/unliker
GET    /api/v1/recipes/{id}/likes         # Liste des likes
GET    /api/v1/recipes/{id}/likes/count   # Nombre de likes
GET    /api/v1/recipes/{id}/likes/me      # Statut du like utilisateur
```

### Commentaires
```http
GET    /api/v1/recipes/{id}/comments      # Liste des commentaires
POST   /api/v1/recipes/{id}/comments      # Ajouter un commentaire
GET    /api/v1/comments/{id}              # Détail d'un commentaire
PUT    /api/v1/comments/{id}              # Modifier un commentaire
DELETE /api/v1/comments/{id}              # Supprimer un commentaire
```

## 🧪 Tests

### Backend
```bash
# Lancer tous les tests
cd backend
pytest -v

# Avec coverage
pytest --cov=app tests/

# Tests spécifiques
pytest tests/test_auth.py -v
```

### Frontend
```bash
cd frontend
npm test
```

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Hachage des mots de passe avec bcrypt
- ✅ Validation stricte des entrées (Pydantic)
- ✅ Protection CORS configurée
- ✅ Sanitisation des données
- ✅ Secrets Kubernetes pour les données sensibles
- ✅ HTTPS ready (avec Ingress TLS)

## 📊 Monitoring & Logs

### Voir les logs
```bash
# Kubernetes
make k8s-logs-backend
make k8s-logs-frontend
make k8s-logs-postgres

# Docker Compose
make docker-logs
```

### Health Check
```bash
# Script de vérification
./scripts/health-check.sh

# Endpoints
curl http://recipe.local/health
curl http://localhost:8000/health
```

## 🗄️ Base de Données

### Modèle de données

**Users**
- id, username, email, password_hash
- profile_picture, bio
- created_at, updated_at

**Recipes**
- id, title, description
- prep_time, cook_time, servings, difficulty, category
- ingredients (JSON), steps (JSON), images (JSON), tags (ARRAY)
- owner_id (FK)
- created_at, updated_at

**Likes**
- id, user_id (FK), recipe_id (FK)
- created_at
- UNIQUE(user_id, recipe_id)

**Comments**
- id, user_id (FK), recipe_id (FK)
- content, created_at, updated_at

### Accéder à PostgreSQL
```bash
# Via Kubernetes
make shell-postgres

# Via Docker Compose
docker compose exec db psql -U recette -d recette
```

### Initialiser avec des données de test
```bash
# Via port-forward
make port-forward-postgres &
python scripts/init-data.py

# Credentials de test :
# - marie@example.com / Password123!
# - jean@example.com / Password123!
# - sophie@example.com / Password123!
```

## 🚢 Déploiement

### CI/CD avec GitHub Actions

Le pipeline CI/CD s'exécute automatiquement sur :
- Push sur `main` ou `develop`
- Pull requests vers `main` ou `develop`

**Étapes :**
1. Tests backend + frontend
2. Linting
3. Build des images Docker
4. Push vers GitHub Container Registry
5. Déploiement sur Kind (staging)
6. Smoke tests

### Déploiement manuel

```bash
# 1. Build et push des images
make build
docker tag recipe-backend:latest ghcr.io/username/recipe-backend:latest
docker push ghcr.io/username/recipe-backend:latest

# 2. Déployer
./scripts/deploy.sh

# 3. Vérifier
make k8s-status
```

## 🔧 Configuration

### Variables d'environnement

**.env (Docker Compose)**
```env
DATABASE_URL=postgresql://recette:recette@db:5432/recette
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
CORS_ORIGINS=http://localhost:5173
```

**Kubernetes ConfigMap/Secret**
- Voir `k8s/configmap.yaml`
- Voir `k8s/secret.yaml` (à modifier en production!)

## 🐛 Dépannage

### Problème : Pods ne démarrent pas
```bash
# Vérifier les événements
kubectl describe pod <pod-name> -n recipe-app

# Vérifier les logs
kubectl logs <pod-name> -n recipe-app

# Vérifier les ressources
kubectl top nodes
kubectl top pods -n recipe-app
```

### Problème : Impossible d'accéder à l'application
```bash
# Vérifier l'ingress
kubectl get ingress -n recipe-app
kubectl describe ingress recipe-ingress -n recipe-app

# Vérifier /etc/hosts
grep recipe.local /etc/hosts

# Port-forward comme solution temporaire
make port-forward-frontend
```

### Problème : Base de données non accessible
```bash
# Vérifier le statefulset
kubectl get statefulset -n recipe-app
kubectl logs postgres-0 -n recipe-app

# Tester la connexion
kubectl exec -it postgres-0 -n recipe-app -- psql -U recipeuser -d recipedb
```

## 📝 Licence

MIT License - voir le fichier LICENSE

## 👥 Contributeurs

Contributions bienvenues ! Veuillez :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@recipe-app.com
- 🐛 Issues : [GitHub Issues](https://github.com/username/recette-app/issues)
- 📚 Documentation API : http://recipe.local/api/docs

---

