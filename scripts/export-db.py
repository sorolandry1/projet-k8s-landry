#!/usr/bin/env python3
"""Script pour exporter les données de la base de données"""
import sys
import os
import json
from datetime import datetime

# Ajouter le chemin du backend au PYTHONPATH
sys.path.insert(0, '/app')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import User, Recipe, Comment, Like

def export_data():
    # URL pour Docker
    DATABASE_URL = "postgresql+psycopg2://recette:recette@db:5432/recette"
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        print('✅ Connexion à la base de données réussie!')
        
        # Exporter les utilisateurs
        users = session.query(User).all()
        users_data = []
        for user in users:
            users_data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "bio": user.bio,
                "profile_picture": user.profile_picture,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat()
            })
        
        # Exporter les recettes
        recipes = session.query(Recipe).all()
        recipes_data = []
        for recipe in recipes:
            recipes_data.append({
                "id": recipe.id,
                "title": recipe.title,
                "description": recipe.description,
                "prep_time": recipe.prep_time,
                "cook_time": recipe.cook_time,
                "servings": recipe.servings,
                "difficulty": recipe.difficulty,
                "category": recipe.category,
                "ingredients": recipe.ingredients,
                "steps": recipe.steps,
                "images": recipe.images,
                "tags": recipe.tags,
                "owner_id": recipe.owner_id,
                "created_at": recipe.created_at.isoformat(),
                "updated_at": recipe.updated_at.isoformat()
            })
        
        # Exporter les commentaires
        comments = session.query(Comment).all()
        comments_data = []
        for comment in comments:
            comments_data.append({
                "id": comment.id,
                "content": comment.content,
                "user_id": comment.user_id,
                "recipe_id": comment.recipe_id,
                "created_at": comment.created_at.isoformat(),
                "updated_at": comment.updated_at.isoformat()
            })
        
        # Exporter les likes
        likes = session.query(Like).all()
        likes_data = []
        for like in likes:
            likes_data.append({
                "id": like.id,
                "user_id": like.user_id,
                "recipe_id": like.recipe_id,
                "created_at": like.created_at.isoformat()
            })
        
        # Créer le fichier d'export
        export_data = {
            "export_date": datetime.now().isoformat(),
            "users": users_data,
            "recipes": recipes_data,
            "comments": comments_data,
            "likes": likes_data
        }
        
        # Sauvegarder dans un fichier JSON
        export_file = f"/app/db_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 EXPORT TERMINÉ:")
        print(f"  - {len(users_data)} utilisateurs")
        print(f"  - {len(recipes_data)} recettes")
        print(f"  - {len(comments_data)} commentaires")
        print(f"  - {len(likes_data)} likes")
        print(f"\n💾 Fichier d'export: {export_file}")
        
        # Copier le fichier vers l'hôte
        print(f"\n📋 Pour copier le fichier vers votre machine:")
        print(f"docker compose cp backend:{export_file} ./db_export.json")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    export_data()

