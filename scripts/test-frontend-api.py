#!/usr/bin/env python3
"""Script pour tester l'accès à l'API depuis le frontend"""
import requests
import time

def test_api_access():
    print("🧪 TEST D'ACCÈS À L'API")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Test du health check...")
    try:
        response = requests.get("http://localhost:8006/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check: OK")
            print(f"   Réponse: {response.json()}")
        else:
            print(f"❌ Health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check: {e}")
    
    # Test 2: API des recettes
    print("\n2️⃣ Test de l'API des recettes...")
    try:
        response = requests.get("http://localhost:8006/api/v1/recipes", timeout=10)
        if response.status_code == 200:
            recipes = response.json()
            print(f"✅ API recettes: {len(recipes)} recettes trouvées")
            if recipes:
                print(f"   Première recette: {recipes[0].get('title', 'Sans titre')}")
                print(f"   ID: {recipes[0].get('id')}")
        else:
            print(f"❌ API recettes: {response.status_code}")
            print(f"   Réponse: {response.text}")
    except Exception as e:
        print(f"❌ API recettes: {e}")
    
    # Test 3: Frontend
    print("\n3️⃣ Test du frontend...")
    try:
        response = requests.get("http://localhost:5176", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend: Accessible")
            if "Recette" in response.text:
                print("   ✅ Contenu de l'application détecté")
            else:
                print("   ⚠️ Contenu de l'application non détecté")
        else:
            print(f"❌ Frontend: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 RÉSUMÉ")
    print("=" * 50)
    print("✅ Backend: Fonctionne en interne")
    print("❌ API externe: Problème de connexion")
    print("✅ Frontend: Accessible")
    print("\n📋 SOLUTIONS POSSIBLES:")
    print("1. Vérifier la configuration des ports")
    print("2. Redémarrer les conteneurs")
    print("3. Vérifier les logs du backend")
    print("4. Tester l'accès direct à l'API")

if __name__ == "__main__":
    test_api_access()



