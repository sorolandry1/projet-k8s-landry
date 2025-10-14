#!/usr/bin/env python3
"""Script pour importer les données dans la base de données"""
import sys
import os
import json
from datetime import datetime

# Ajouter le chemin du backend au PYTHONPATH
sys.path.insert(0, '/app')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import User, Recipe, Comment, Like

def import_data(export_file):
    # URL pour Docker
    DATABASE_URL = "postgresql+psycopg2://recette:recette@db:5432/recette"
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        print('✅ Connexion à la base de données réussie!')
        
        # Charger les données d'export
        with open(export_file, 'r', encoding='utf-8') as f:
            export_data = json.load(f)
        
        print(f"📂 Fichier d'import: {export_file}")
        print(f"📅 Date d'export: {export_data.get('export_date', 'Inconnue')}")
        
        # Vider les tables existantes (attention!)
        print("\n⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes!")
        confirm = input("Continuer? (oui/non): ").strip().lower()
        
        if confirm != 'oui':
            print("❌ Import annulé")
            return
        
        # Supprimer les données existantes
        print("\n🗑️  Suppression des données existantes...")
        session.query(Like).delete()
        session.query(Comment).delete()
        session.query(Recipe).delete()
        session.query(User).delete()
        session.commit()
        
        # Importer les utilisateurs
        print("\n👥 Import des utilisateurs...")
        user_id_mapping = {}
        for user_data in export_data.get('users', []):
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                hashed_password=user_data.get('hashed_password', 'default_password'),
                bio=user_data.get('bio'),
                profile_picture=user_data.get('profile_picture'),
                created_at=datetime.fromisoformat(user_data['created_at']),
                updated_at=datetime.fromisoformat(user_data['updated_at'])
            )
            session.add(user)
            session.flush()  # Pour obtenir l'ID
            user_id_mapping[user_data['id']] = user.id
            print(f"  ✓ {user.username}")
        
        # Importer les recettes
        print("\n🍳 Import des recettes...")
        recipe_id_mapping = {}
        for recipe_data in export_data.get('recipes', []):
            recipe = Recipe(
                title=recipe_data['title'],
                description=recipe_data['description'],
                prep_time=recipe_data.get('prep_time'),
                cook_time=recipe_data.get('cook_time'),
                servings=recipe_data.get('servings'),
                difficulty=recipe_data.get('difficulty'),
                category=recipe_data.get('category'),
                ingredients=recipe_data['ingredients'],
                steps=recipe_data['steps'],
                images=recipe_data.get('images'),
                tags=recipe_data.get('tags'),
                owner_id=user_id_mapping.get(recipe_data['owner_id']),
                created_at=datetime.fromisoformat(recipe_data['created_at']),
                updated_at=datetime.fromisoformat(recipe_data['updated_at'])
            )
            session.add(recipe)
            session.flush()  # Pour obtenir l'ID
            recipe_id_mapping[recipe_data['id']] = recipe.id
            print(f"  ✓ {recipe.title}")
        
        # Importer les commentaires
        print("\n💬 Import des commentaires...")
        for comment_data in export_data.get('comments', []):
            comment = Comment(
                content=comment_data['content'],
                user_id=user_id_mapping.get(comment_data['user_id']),
                recipe_id=recipe_id_mapping.get(comment_data['recipe_id']),
                created_at=datetime.fromisoformat(comment_data['created_at']),
                updated_at=datetime.fromisoformat(comment_data['updated_at'])
            )
            session.add(comment)
            print(f"  ✓ Commentaire {comment_data['id']}")
        
        # Importer les likes
        print("\n❤️  Import des likes...")
        for like_data in export_data.get('likes', []):
            like = Like(
                user_id=user_id_mapping.get(like_data['user_id']),
                recipe_id=recipe_id_mapping.get(like_data['recipe_id']),
                created_at=datetime.fromisoformat(like_data['created_at'])
            )
            session.add(like)
            print(f"  ✓ Like {like_data['id']}")
        
        session.commit()
        
        print(f"\n✅ IMPORT TERMINÉ:")
        print(f"  - {len(export_data.get('users', []))} utilisateurs")
        print(f"  - {len(export_data.get('recipes', []))} recettes")
        print(f"  - {len(export_data.get('comments', []))} commentaires")
        print(f"  - {len(export_data.get('likes', []))} likes")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python import-db.py <fichier_export.json>")
        sys.exit(1)
    
    export_file = sys.argv[1]
    if not os.path.exists(export_file):
        print(f"❌ Fichier non trouvé: {export_file}")
        sys.exit(1)
    
    import_data(export_file)
