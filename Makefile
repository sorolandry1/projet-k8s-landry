.PHONY: help install build up down clean test lint deploy

# Couleurs pour les messages
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Affiche l'aide
	@echo "$(BLUE)Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ==============================================================================
# INSTALLATION & SETUP
# ==============================================================================

install: ## Installe les dépendances
	@echo "$(BLUE)Installation des dépendances...$(NC)"
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "$(GREEN)✓ Dépendances installées$(NC)"

init: ## Initialise le fichier .env
	@if [ ! -f .env ]; then \
		echo "DATABASE_URL=postgresql://recette:recette@db:5432/recette" > .env; \
		echo "POSTGRES_USER=recette" >> .env; \
		echo "POSTGRES_PASSWORD=recette" >> .env; \
		echo "POSTGRES_DB=recette" >> .env; \
		echo "SECRET_KEY=your-secret-key-change-in-production" >> .env; \
		echo "JWT_ALGORITHM=HS256" >> .env; \
		echo "CORS_ORIGINS=http://localhost:5173,http://localhost:3000" >> .env; \
		echo "$(GREEN)✓ Fichier .env créé$(NC)"; \
	else \
		echo "$(BLUE)Le fichier .env existe déjà$(NC)"; \
	fi

# ==============================================================================
# DOCKER COMPOSE
# ==============================================================================

build: ## Build les images Docker
	@echo "$(BLUE)Build des images Docker...$(NC)"
	docker build -t recipe-backend:latest ./backend
	docker build -t recipe-frontend:latest ./frontend
	@echo "$(GREEN)✓ Images buildées$(NC)"

docker-up: init ## Lance l'application avec Docker Compose
	@echo "$(BLUE)Démarrage des conteneurs...$(NC)"
	docker compose up -d --build
	@echo "$(GREEN)✓ Application lancée sur http://localhost:5173$(NC)"

docker-down: ## Arrête les conteneurs Docker Compose
	@echo "$(BLUE)Arrêt des conteneurs...$(NC)"
	docker compose down

docker-logs: ## Affiche les logs
	docker compose logs -f --tail=100

docker-clean: ## Nettoie les conteneurs, images et volumes
	@echo "$(RED)Nettoyage complet...$(NC)"
	docker compose down -v
	docker rmi recipe-backend:latest recipe-frontend:latest 2>/dev/null || true
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

alembic-upgrade: ## Applique les migrations Alembic (head)
	@echo "$(BLUE)Application des migrations...$(NC)"
	docker compose exec backend alembic upgrade head
	@echo "$(GREEN)✓ Base de données à jour$(NC)"

alembic-revision: ## Génère une migration Alembic (message="votre message")
	@if [ -z "$(message)" ]; then \
		echo "$(RED)Erreur: indiquez un message avec message=\"Description\"$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Génération d'une nouvelle migration...$(NC)"
	docker compose exec backend alembic revision --autogenerate -m "$(message)"
	@echo "$(GREEN)✓ Migration créée$(NC)"

# ==============================================================================
# KIND CLUSTER
# ==============================================================================

kind-create: ## Crée un cluster Kind
	@echo "$(BLUE)Création du cluster Kind...$(NC)"
	./kind create cluster --config kind-config.yaml
	kubectl cluster-info --context kind-recipe-cluster
	@echo "$(GREEN)✓ Cluster créé avec succès$(NC)"

kind-delete: ## Supprime le cluster Kind
	@echo "$(RED)Suppression du cluster Kind...$(NC)"
	./kind delete cluster --name recipe-cluster
	@echo "$(GREEN)✓ Cluster supprimé$(NC)"

kind-load: build ## Charge les images dans Kind
	@echo "$(BLUE)Chargement des images dans Kind...$(NC)"
	./kind load docker-image recipe-backend:latest --name recipe-cluster
	./kind load docker-image recipe-frontend:latest --name recipe-cluster
	@echo "$(GREEN)✓ Images chargées$(NC)"

# ==============================================================================
# INGRESS CONTROLLER
# ==============================================================================

ingress-install: ## Installe NGINX Ingress Controller
	@echo "$(BLUE)Installation de NGINX Ingress...$(NC)"
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
	@echo "Attente de la disponibilité de l'ingress..."
	kubectl wait --namespace ingress-nginx \
		--for=condition=ready pod \
		--selector=app.kubernetes.io/component=controller \
		--timeout=90s
	@echo "$(GREEN)✓ Ingress installé$(NC)"

# ==============================================================================
# DÉPLOIEMENT KUBERNETES
# ==============================================================================

k8s-deploy: ## Déploie sur Kubernetes
	@echo "$(BLUE)Déploiement sur Kubernetes...$(NC)"
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secret.yaml
	kubectl apply -f k8s/storage-pvc.yaml
	kubectl apply -f k8s/postgres-statefulset.yaml
	@echo "Attente de la disponibilité de PostgreSQL..."
	kubectl wait --for=condition=ready pod -l app=postgres -n recipe-app --timeout=120s
	kubectl apply -f k8s/backend-deployment.yaml
	@echo "Attente de la disponibilité du backend..."
	kubectl wait --for=condition=ready pod -l app=backend -n recipe-app --timeout=120s
	kubectl apply -f k8s/frontend-deployment.yaml
	@echo "Attente de la disponibilité du frontend..."
	kubectl wait --for=condition=ready pod -l app=frontend -n recipe-app --timeout=120s
	kubectl apply -f k8s/ingress.yaml
	@echo "$(GREEN)✓ Déploiement terminé$(NC)"
	@echo "$(BLUE)Ajoutez '127.0.0.1 recipe.local' à /etc/hosts$(NC)"
	@echo "$(BLUE)Accédez à l'app sur http://recipe.local$(NC)"

k8s-delete: ## Supprime les ressources Kubernetes
	@echo "$(RED)Suppression des ressources...$(NC)"
	kubectl delete namespace recipe-app
	@echo "$(GREEN)✓ Ressources supprimées$(NC)"

k8s-status: ## Affiche le statut des pods
	@echo "$(BLUE)Statut des pods:$(NC)"
	kubectl get pods -n recipe-app -o wide
	@echo "\n$(BLUE)Services:$(NC)"
	kubectl get svc -n recipe-app
	@echo "\n$(BLUE)Ingress:$(NC)"
	kubectl get ingress -n recipe-app

k8s-logs-backend: ## Affiche les logs du backend
	kubectl logs -f -l app=backend -n recipe-app --tail=100

k8s-logs-frontend: ## Affiche les logs du frontend
	kubectl logs -f -l app=frontend -n recipe-app --tail=100

k8s-logs-postgres: ## Affiche les logs de PostgreSQL
	kubectl logs -f -l app=postgres -n recipe-app --tail=100

# ==============================================================================
# COMMANDE COMPLÈTE POUR SETUP INITIAL
# ==============================================================================

setup: kind-create ingress-install build kind-load k8s-deploy ## Setup complet (Kind + Ingress + Deploy)
	@echo "$(GREEN)✓✓✓ Setup complet terminé !$(NC)"
	@echo "$(BLUE)N'oubliez pas d'ajouter '127.0.0.1 recipe.local' à /etc/hosts$(NC)"

# ==============================================================================
# TESTS
# ==============================================================================

test-backend: ## Lance les tests backend
	@echo "$(BLUE)Tests backend...$(NC)"
	cd backend && pytest -v --cov=app tests/

test-frontend: ## Lance les tests frontend
	@echo "$(BLUE)Tests frontend...$(NC)"
	cd frontend && npm test

test: test-backend test-frontend ## Lance tous les tests

# ==============================================================================
# LINTING & FORMATTING
# ==============================================================================

lint-backend: ## Lint backend
	@echo "$(BLUE)Linting backend...$(NC)"
	cd backend && black . && ruff check --fix .

lint-frontend: ## Lint frontend
	@echo "$(BLUE)Linting frontend...$(NC)"
	cd frontend && npm run lint

lint: lint-backend lint-frontend ## Lint tout le code

# ==============================================================================
# PORT FORWARDING
# ==============================================================================

port-forward-backend: ## Forward le port backend
	@echo "$(BLUE)Port forwarding backend sur localhost:8000$(NC)"
	kubectl port-forward -n recipe-app svc/backend 8000:8000

port-forward-frontend: ## Forward le port frontend
	@echo "$(BLUE)Port forwarding frontend sur localhost:3000$(NC)"
	kubectl port-forward -n recipe-app svc/frontend 3000:80

port-forward-postgres: ## Forward le port PostgreSQL
	@echo "$(BLUE)Port forwarding PostgreSQL sur localhost:5432$(NC)"
	kubectl port-forward -n recipe-app svc/postgres 5432:5432

# ==============================================================================
# SHELL DANS LES PODS
# ==============================================================================

shell-backend: ## Ouvre un shell dans le pod backend
	kubectl exec -it -n recipe-app $$(kubectl get pod -n recipe-app -l app=backend -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

shell-postgres: ## Ouvre un shell dans le pod PostgreSQL
	kubectl exec -it -n recipe-app $$(kubectl get pod -n recipe-app -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- psql -U recipeuser recipedb

# ==============================================================================
# SCALING
# ==============================================================================

scale-backend: ## Scale backend (usage: make scale-backend REPLICAS=3)
	@if [ -z "$(REPLICAS)" ]; then \
		echo "$(RED)Erreur: Spécifiez REPLICAS=N$(NC)"; \
		exit 1; \
	fi
	kubectl scale deployment backend --replicas=$(REPLICAS) -n recipe-app
	@echo "$(GREEN)✓ Backend scalé à $(REPLICAS) réplicas$(NC)"

scale-frontend: ## Scale frontend (usage: make scale-frontend REPLICAS=3)
	@if [ -z "$(REPLICAS)" ]; then \
		echo "$(RED)Erreur: Spécifiez REPLICAS=N$(NC)"; \
		exit 1; \
	fi
	kubectl scale deployment frontend --replicas=$(REPLICAS) -n recipe-app
	@echo "$(GREEN)✓ Frontend scalé à $(REPLICAS) réplicas$(NC)"

# ==============================================================================
# NETTOYAGE
# ==============================================================================

clean-all: docker-clean kind-delete ## Nettoyage complet (Docker + Kind)
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

# ==============================================================================
# DÉVELOPPEMENT LOCAL
# ==============================================================================

dev-backend: ## Lance le backend en mode dev (sans Docker)
	@echo "$(BLUE)Démarrage backend (dev)...$(NC)"
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Lance le frontend en mode dev (sans Docker)
	@echo "$(BLUE)Démarrage frontend (dev)...$(NC)"
	cd frontend && npm run dev

# ==============================================================================
# DEBUG
# ==============================================================================

debug-backend: ## Debug info backend
	@echo "$(BLUE)=== Backend Pods ===$(NC)"
	kubectl describe pods -l app=backend -n recipe-app
	@echo "\n$(BLUE)=== Backend Logs ===$(NC)"
	kubectl logs -l app=backend -n recipe-app --tail=50

debug-ingress: ## Debug info ingress
	@echo "$(BLUE)=== Ingress ===$(NC)"
	kubectl describe ingress -n recipe-app
	@echo "\n$(BLUE)=== Ingress Controller Logs ===$(NC)"
	kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=50

# ==============================================================================
# VERSION
# ==============================================================================

version: ## Affiche les versions
	@echo "$(BLUE)=== Versions ===$(NC)"
	@echo "Docker: $$(docker --version 2>/dev/null || echo 'non installé')"
	@echo "Kind: $$(kind --version 2>/dev/null || echo 'non installé')"
	@echo "Kubectl: $$(kubectl version --client --short 2>/dev/null || echo 'non installé')"
	@echo "Python: $$(python3 --version 2>/dev/null || echo 'non installé')"
	@echo "Node: $$(node --version 2>/dev/null || echo 'non installé')"
	@echo "npm: $$(npm --version 2>/dev/null || echo 'non installé')"
