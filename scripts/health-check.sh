#!/bin/bash

echo "=== Recipe App Health Check ==="
echo ""

# Vérifier Kind
echo "📦 Kind Cluster:"
if kind get clusters | grep -q "recipe-cluster"; then
    echo "  ✓ Cluster 'recipe-cluster' existe"
else
    echo "  ✗ Cluster 'recipe-cluster' n'existe pas"
    exit 1
fi

# Vérifier les nodes
echo ""
echo "🖥️  Nodes:"
kubectl get nodes --no-headers 2>/dev/null | while read line; do
    name=$(echo $line | awk '{print $1}')
    status=$(echo $line | awk '{print $2}')
    if [ "$status" == "Ready" ]; then
        echo "  ✓ $name: $status"
    else
        echo "  ✗ $name: $status"
    fi
done

# Vérifier le namespace
echo ""
echo "📁 Namespace:"
if kubectl get namespace recipe-app &> /dev/null; then
    echo "  ✓ Namespace 'recipe-app' existe"
else
    echo "  ✗ Namespace 'recipe-app' n'existe pas"
    exit 1
fi

# Vérifier les pods
echo ""
echo "🐳 Pods Status:"
kubectl get pods -n recipe-app --no-headers 2>/dev/null | while read line; do
    name=$(echo $line | awk '{print $1}')
    ready=$(echo $line | awk '{print $2}')
    status=$(echo $line | awk '{print $3}')
    
    if [ "$status" == "Running" ] && [[ "$ready" == *"/"* ]]; then
        ready_count=$(echo $ready | cut -d'/' -f1)
        total_count=$(echo $ready | cut -d'/' -f2)
        if [ "$ready_count" == "$total_count" ]; then
            echo "  ✓ $name: $status ($ready)"
        else
            echo "  ⚠ $name: $status ($ready)"
        fi
    else
        echo "  ✗ $name: $status ($ready)"
    fi
done

# Vérifier les services
echo ""
echo "🌐 Services:"
kubectl get svc -n recipe-app --no-headers 2>/dev/null | while read line; do
    name=$(echo $line | awk '{print $1}')
    type=$(echo $line | awk '{print $2}')
    cluster_ip=$(echo $line | awk '{print $3}')
    echo "  ✓ $name ($type): $cluster_ip"
done

# Vérifier l'ingress
echo ""
echo "🚪 Ingress:"
if kubectl get ingress -n recipe-app recipe-ingress &> /dev/null; then
    host=$(kubectl get ingress -n recipe-app recipe-ingress -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)
    echo "  ✓ Ingress configuré pour: $host"
    
    # Vérifier /etc/hosts
    if grep -q "$host" /etc/hosts 2>/dev/null; then
        echo "  ✓ Entrée /etc/hosts trouvée"
    else
        echo "  ⚠ Ajoutez '127.0.0.1 $host' à /etc/hosts"
    fi
else
    echo "  ✗ Ingress non trouvé"
fi

# Test de connectivité
echo ""
echo "🔌 Connectivity Tests:"

# Test Backend
echo -n "  Backend API: "
if kubectl exec -n recipe-app deploy/backend -- curl -sf http://localhost:8000/health &> /dev/null; then
    echo "✓"
else
    echo "✗"
fi

# Test PostgreSQL
echo -n "  PostgreSQL: "
if kubectl exec -n recipe-app statefulset/postgres -- pg_isready -U recipeuser &> /dev/null; then
    echo "✓"
else
    echo "✗"
fi

echo ""
echo "=== Health Check Complete ==="

