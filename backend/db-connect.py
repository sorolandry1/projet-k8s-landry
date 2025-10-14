#!/usr/bin/env python3
"""Script pour se connecter à la base de données et explorer les données"""
import sys
import os

# Ajouter le chemin du backend au PYTHONPATH
sys.path.insert(0, '/app')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import User, Recipe, Comment, Like

def connect_and_explore():
    # URL pour Docker
    DATABASE_URL = "postgresql+psycopg2://recette:recette@db:5432/recette"
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Test de connexion
        session.execute(text('SELECT 1'))
        print('✅ Connexion à la base de données réussie!')
        
        # Afficher les statistiques
        print("\n📊 STATISTIQUES DE LA BASE DE DONNÉES:")
        print("=" * 50)
        
        user_count = session.query(User).count()
        recipe_count = session.query(Recipe).count()
        comment_count = session.query(Comment).count()
        like_count = session.query(Like).count()
        
        print(f"👥 Utilisateurs: {user_count}")
        print(f"🍳 Recettes: {recipe_count}")
        print(f"💬 Commentaires: {comment_count}")
        print(f"❤️  Likes: {like_count}")
        
        # Afficher les utilisateurs
        print("\n👥 UTILISATEURS:")
        print("-" * 30)
        users = session.query(User).all()
        for user in users:
            print(f"  • {user.username} ({user.email})")
            print(f"    Bio: {user.bio or 'Aucune bio'}")
            print(f"    Créé le: {user.created_at.strftime('%d/%m/%Y %H:%M')}")
            print()
        
        # Afficher les recettes
        print("🍳 RECETTES:")
        print("-" * 30)
        recipes = session.query(Recipe).all()
        for recipe in recipes:
            owner = session.query(User).filter(User.id == recipe.owner_id).first()
            print(f"  • {recipe.title}")
            print(f"    Par: {owner.username if owner else 'Inconnu'}")
            print(f"    Catégorie: {recipe.category}")
            print(f"    Difficulté: {recipe.difficulty}")
            print(f"    Temps: {recipe.prep_time}min prep + {recipe.cook_time}min cuisson")
            print(f"    Portions: {recipe.servings}")
            print(f"    Tags: {', '.join(recipe.tags) if recipe.tags else 'Aucun'}")
            print(f"    Créée le: {recipe.created_at.strftime('%d/%m/%Y %H:%M')}")
            print()
        
        # Menu interactif
        print("\n🔧 OPTIONS DISPONIBLES:")
        print("1. Afficher une recette complète")
        print("2. Rechercher des recettes par catégorie")
        print("3. Rechercher des recettes par difficulté")
        print("4. Afficher les recettes d'un utilisateur")
        print("5. Quitter")
        
        while True:
            try:
                choice = input("\nVotre choix (1-5): ").strip()
                
                if choice == "1":
                    recipe_id = input("ID de la recette: ").strip()
                    try:
                        recipe = session.query(Recipe).filter(Recipe.id == int(recipe_id)).first()
                        if recipe:
                            owner = session.query(User).filter(User.id == recipe.owner_id).first()
                            print(f"\n📖 RECETTE: {recipe.title}")
                            print("=" * 50)
                            print(f"Par: {owner.username if owner else 'Inconnu'}")
                            print(f"Description: {recipe.description}")
                            print(f"Temps: {recipe.prep_time}min prep + {recipe.cook_time}min cuisson")
                            print(f"Portions: {recipe.servings}")
                            print(f"Difficulté: {recipe.difficulty}")
                            print(f"Catégorie: {recipe.category}")
                            
                            print("\n🛒 INGRÉDIENTS:")
                            for i, ingredient in enumerate(recipe.ingredients, 1):
                                print(f"  {i}. {ingredient['quantity']} {ingredient['unit']} {ingredient['name']}")
                            
                            print("\n👨‍🍳 ÉTAPES:")
                            for i, step in enumerate(recipe.steps, 1):
                                print(f"  {i}. {step}")
                            
                            if recipe.tags:
                                print(f"\n🏷️  TAGS: {', '.join(recipe.tags)}")
                        else:
                            print("❌ Recette non trouvée")
                    except ValueError:
                        print("❌ ID invalide")
                
                elif choice == "2":
                    categories = session.query(Recipe.category).distinct().all()
                    print("\n📂 Catégories disponibles:")
                    for i, (cat,) in enumerate(categories, 1):
                        print(f"  {i}. {cat}")
                    
                    cat_choice = input("Numéro de catégorie: ").strip()
                    try:
                        cat_index = int(cat_choice) - 1
                        if 0 <= cat_index < len(categories):
                            category = categories[cat_index][0]
                            recipes = session.query(Recipe).filter(Recipe.category == category).all()
                            print(f"\n🍳 Recettes dans la catégorie '{category}':")
                            for recipe in recipes:
                                print(f"  • {recipe.title} (ID: {recipe.id})")
                        else:
                            print("❌ Numéro invalide")
                    except ValueError:
                        print("❌ Entrée invalide")
                
                elif choice == "3":
                    difficulties = session.query(Recipe.difficulty).distinct().all()
                    print("\n⚡ Difficultés disponibles:")
                    for i, (diff,) in enumerate(difficulties, 1):
                        print(f"  {i}. {diff}")
                    
                    diff_choice = input("Numéro de difficulté: ").strip()
                    try:
                        diff_index = int(diff_choice) - 1
                        if 0 <= diff_index < len(difficulties):
                            difficulty = difficulties[diff_index][0]
                            recipes = session.query(Recipe).filter(Recipe.difficulty == difficulty).all()
                            print(f"\n🍳 Recettes de difficulté '{difficulty}':")
                            for recipe in recipes:
                                print(f"  • {recipe.title} (ID: {recipe.id})")
                        else:
                            print("❌ Numéro invalide")
                    except ValueError:
                        print("❌ Entrée invalide")
                
                elif choice == "4":
                    print("\n👥 Utilisateurs disponibles:")
                    for user in users:
                        print(f"  • {user.username} (ID: {user.id})")
                    
                    user_id = input("ID de l'utilisateur: ").strip()
                    try:
                        user_recipes = session.query(Recipe).filter(Recipe.owner_id == int(user_id)).all()
                        user = session.query(User).filter(User.id == int(user_id)).first()
                        if user:
                            print(f"\n🍳 Recettes de {user.username}:")
                            for recipe in user_recipes:
                                print(f"  • {recipe.title} (ID: {recipe.id})")
                        else:
                            print("❌ Utilisateur non trouvé")
                    except ValueError:
                        print("❌ ID invalide")
                
                elif choice == "5":
                    print("👋 Au revoir!")
                    break
                
                else:
                    print("❌ Choix invalide")
                    
            except KeyboardInterrupt:
                print("\n👋 Au revoir!")
                break
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    connect_and_explore()
