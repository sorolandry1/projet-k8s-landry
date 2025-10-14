#!/usr/bin/env python3
"""Script pour initialiser la base de données avec des données de test"""
import sys
import os

# Ajouter le chemin du backend au PYTHONPATH
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Recipe
from app.core.security import get_password_hash

def init_data():
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://recette:recette@localhost:5432/recette"
    )
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Créer des utilisateurs de test
        users_data = [
            {
                "username": "chef_marie",
                "email": "marie@example.com",
                "password": "Password123!",
                "bio": "Passionnée de pâtisserie française"
            },
            {
                "username": "cook_jean",
                "email": "jean@example.com",
                "password": "Password123!",
                "bio": "Amateur de cuisine méditerranéenne"
            },
            {
                "username": "baker_sophie",
                "email": "sophie@example.com",
                "password": "Password123!",
                "bio": "Experte en boulangerie artisanale"
            }
        ]
        
        users = []
        print("📝 Création des utilisateurs...")
        for user_data in users_data:
            existing = session.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    bio=user_data["bio"]
                )
                session.add(user)
                users.append(user)
                print(f"  ✓ {user_data['username']}")
            else:
                users.append(existing)
                print(f"  ⚠ {user_data['username']} existe déjà")
        
        session.commit()
        
        # Créer des recettes de test
        recipes_data = [
            {
                "title": "Tarte aux Pommes Classique",
                "description": "Une délicieuse tarte aux pommes traditionnelle française avec une pâte brisée croustillante et des pommes fondantes.",
                "prep_time": 30,
                "cook_time": 45,
                "servings": 8,
                "difficulty": "moyen",
                "category": "dessert",
                "ingredients": [
                    {"name": "Pâte brisée", "quantity": "1", "unit": "pièce"},
                    {"name": "Pommes", "quantity": "6", "unit": "pièces"},
                    {"name": "Sucre", "quantity": "100", "unit": "g"},
                    {"name": "Beurre", "quantity": "50", "unit": "g"},
                    {"name": "Cannelle", "quantity": "1", "unit": "c.à.c"}
                ],
                "steps": [
                    "Préchauffer le four à 180°C",
                    "Éplucher et couper les pommes en lamelles",
                    "Étaler la pâte dans un moule",
                    "Disposer les pommes sur la pâte",
                    "Saupoudrer de sucre et cannelle",
                    "Ajouter des noisettes de beurre",
                    "Cuire 45 minutes jusqu'à ce que la tarte soit dorée"
                ],
                "tags": ["français", "dessert", "automne", "facile"]
            },
            {
                "title": "Salade Méditerranéenne",
                "description": "Fraîche et colorée, parfaite pour l'été. Une explosion de saveurs méditerranéennes.",
                "prep_time": 15,
                "cook_time": 0,
                "servings": 4,
                "difficulty": "facile",
                "category": "entrée",
                "ingredients": [
                    {"name": "Tomates", "quantity": "4", "unit": "pièces"},
                    {"name": "Concombre", "quantity": "1", "unit": "pièce"},
                    {"name": "Feta", "quantity": "200", "unit": "g"},
                    {"name": "Olives noires", "quantity": "100", "unit": "g"},
                    {"name": "Huile d'olive", "quantity": "3", "unit": "c.à.s"},
                    {"name": "Citron", "quantity": "1", "unit": "pièce"},
                    {"name": "Oignon rouge", "quantity": "1", "unit": "pièce"}
                ],
                "steps": [
                    "Couper les tomates et concombre en dés",
                    "Émincer l'oignon rouge",
                    "Émietter la feta",
                    "Mélanger tous les ingrédients dans un saladier",
                    "Arroser d'huile d'olive et jus de citron",
                    "Assaisonner avec sel et poivre",
                    "Servir frais"
                ],
                "tags": ["été", "végétarien", "rapide", "méditerranéen"]
            },
            {
                "title": "Poulet Rôti aux Herbes",
                "description": "Un poulet rôti parfait avec une peau croustillante et une chair juteuse, parfumé aux herbes de Provence.",
                "prep_time": 20,
                "cook_time": 90,
                "servings": 6,
                "difficulty": "moyen",
                "category": "plat",
                "ingredients": [
                    {"name": "Poulet entier", "quantity": "1.5", "unit": "kg"},
                    {"name": "Beurre", "quantity": "80", "unit": "g"},
                    {"name": "Thym", "quantity": "2", "unit": "branches"},
                    {"name": "Romarin", "quantity": "2", "unit": "branches"},
                    {"name": "Citron", "quantity": "1", "unit": "pièce"},
                    {"name": "Ail", "quantity": "4", "unit": "gousses"}
                ],
                "steps": [
                    "Préchauffer le four à 200°C",
                    "Mélanger le beurre avec les herbes hachées",
                    "Glisser le beurre aux herbes sous la peau du poulet",
                    "Insérer le citron et l'ail dans la cavité",
                    "Badigeonner le poulet d'huile d'olive",
                    "Rôtir 1h30 en arrosant régulièrement",
                    "Laisser reposer 10 minutes avant de découper"
                ],
                "tags": ["français", "plat principal", "festif", "dimanche"]
            },
            {
                "title": "Smoothie Bowl Énergisant",
                "description": "Un petit-déjeuner sain et coloré, plein de vitamines pour bien commencer la journée.",
                "prep_time": 10,
                "cook_time": 0,
                "servings": 2,
                "difficulty": "facile",
                "category": "dessert",
                "ingredients": [
                    {"name": "Bananes congelées", "quantity": "2", "unit": "pièces"},
                    {"name": "Myrtilles", "quantity": "150", "unit": "g"},
                    {"name": "Lait d'amande", "quantity": "200", "unit": "ml"},
                    {"name": "Granola", "quantity": "50", "unit": "g"},
                    {"name": "Graines de chia", "quantity": "2", "unit": "c.à.s"},
                    {"name": "Miel", "quantity": "1", "unit": "c.à.s"}
                ],
                "steps": [
                    "Mixer les bananes congelées avec le lait d'amande",
                    "Ajouter les myrtilles et mixer à nouveau",
                    "Verser dans des bols",
                    "Garnir de granola et graines de chia",
                    "Arroser de miel",
                    "Servir immédiatement"
                ],
                "tags": ["petit-déjeuner", "healthy", "végétarien", "rapide"]
            }
        ]
        
        print("\n🍳 Création des recettes...")
        for i, recipe_data in enumerate(recipes_data):
            existing = session.query(Recipe).filter(Recipe.title == recipe_data["title"]).first()
            if not existing:
                recipe = Recipe(
                    user_id=users[i % len(users)].id,
                    title=recipe_data["title"],
                    description=recipe_data["description"],
                    prep_time=recipe_data["prep_time"],
                    cook_time=recipe_data["cook_time"],
                    servings=recipe_data["servings"],
                    difficulty=recipe_data["difficulty"],
                    category=recipe_data["category"],
                    ingredients=recipe_data["ingredients"],
                    steps=recipe_data["steps"],
                    tags=recipe_data["tags"]
                )
                session.add(recipe)
                print(f"  ✓ {recipe_data['title']}")
            else:
                print(f"  ⚠ {recipe_data['title']} existe déjà")
        
        session.commit()
        
        print("\n✅ Données de test créées avec succès!")
        print(f"  - {len(users)} utilisateurs")
        print(f"  - {len(recipes_data)} recettes")
        print("\n📝 Credentials pour tester:")
        for user_data in users_data:
            print(f"  - Email: {user_data['email']}, Password: {user_data['password']}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        session.rollback()
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    init_data()

