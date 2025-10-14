#!/bin/bash

echo "🧹 Nettoyage de l'environnement Recipe App..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 1. Suppression du namespace Kubernetes
if kubectl get namespace recipe-app &> /dev/null; then
    echo -e "${RED}1. Suppression du namespace Kubernetes...${NC}"
    kubectl delete namespace recipe-app
    echo -e "${GREEN}✓ Namespace supprimé${NC}"
else
    echo "⚠ Namespace recipe-app n'existe pas"
fi
echo ""

# 2. Suppression du cluster Kind
if kind get clusters | grep -q "recipe-cluster"; then
    echo -e "${RED}2. Suppression du cluster Kind...${NC}"
    kind delete cluster --name recipe-cluster
    echo -e "${GREEN}✓ Cluster Kind supprimé${NC}"
else
    echo "⚠ Cluster recipe-cluster n'existe pas"
fi
echo ""

# 3. Nettoyage des images Docker
echo -e "${RED}3. Nettoyage des images Docker...${NC}"
docker rmi recipe-backend:latest 2>/dev/null && echo "  ✓ recipe-backend:latest supprimée" || echo "  ⚠ recipe-backend:latest n'existe pas"
docker rmi recipe-frontend:latest 2>/dev/null && echo "  ✓ recipe-frontend:latest supprimée" || echo "  ⚠ recipe-frontend:latest n'existe pas"
echo ""

# 4. Nettoyage Docker Compose (optionnel)
if [ -f docker-compose.yml ]; then
    echo -e "${RED}4. Arrêt de Docker Compose...${NC}"
    docker compose down -v 2>/dev/null || true
    echo -e "${GREEN}✓ Docker Compose arrêté${NC}"
fi
echo ""

echo -e "${GREEN}✅ Nettoyage terminé!${NC}"
echo ""
echo "Pour redéployer l'application, utilisez:"
echo "  make setup"

