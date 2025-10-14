from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from ....schemas.recipe import RecipeCreate, RecipeUpdate, RecipeOut
from ....models.recipe import Recipe
from ....models.user import User
from ....models.like import Like
from ....models.comment import Comment
from ...deps import get_current_user, get_db_dep
from ....services.image_service import image_service

router = APIRouter()

def add_recipe_counts(recipe: Recipe, db: Session) -> RecipeOut:
    """Ajoute les compteurs de likes et comments à une recette"""
    likes_count = db.query(func.count(Like.id)).filter(Like.recipe_id == recipe.id).scalar() or 0
    comments_count = db.query(func.count(Comment.id)).filter(Comment.recipe_id == recipe.id).scalar() or 0
    
    # Convertir les ingrédients si nécessaire
    ingredients = recipe.ingredients if isinstance(recipe.ingredients, list) else []
    
    recipe_dict = {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "servings": recipe.servings,
        "difficulty": recipe.difficulty,
        "category": recipe.category,
        "ingredients": ingredients,
        "steps": recipe.steps if isinstance(recipe.steps, list) else [],
        "tags": recipe.tags,
        "owner_id": recipe.owner_id,
        "images": recipe.images,
        "created_at": recipe.created_at,
        "updated_at": recipe.updated_at,
        "likes_count": likes_count,
        "comments_count": comments_count
    }
    return RecipeOut(**recipe_dict)

@router.get("/", response_model=List[RecipeOut])
def list_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db_dep)
):
    """Liste toutes les recettes avec filtres optionnels"""
    query = db.query(Recipe)
    
    if category:
        query = query.filter(Recipe.category == category)
    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)
    if search:
        query = query.filter(
            or_(
                Recipe.title.ilike(f"%{search}%"),
                Recipe.description.ilike(f"%{search}%")
            )
        )
    
    recipes = query.order_by(Recipe.created_at.desc()).offset(skip).limit(limit).all()
    return [add_recipe_counts(r, db) for r in recipes]

@router.post("/", response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
def create_recipe(
    data: RecipeCreate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Créer une nouvelle recette"""
    # Convertir les ingrédients en dict pour PostgreSQL JSON
    recipe_data = data.model_dump()
    recipe_data['ingredients'] = [ing.model_dump() for ing in data.ingredients]
    
    obj = Recipe(**recipe_data, owner_id=current_user.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return add_recipe_counts(obj, db)

@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: int, db: Session = Depends(get_db_dep)):
    """Récupère une recette spécifique"""
    obj = db.get(Recipe, recipe_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return add_recipe_counts(obj, db)

@router.put("/{recipe_id}", response_model=RecipeOut)
def update_recipe(
    recipe_id: int,
    data: RecipeUpdate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Modifier une recette (propriétaire uniquement)"""
    obj = db.get(Recipe, recipe_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if obj.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your recipe")
    
    update_data = data.model_dump(exclude_unset=True)
    if 'ingredients' in update_data and update_data['ingredients']:
        update_data['ingredients'] = [ing.model_dump() for ing in data.ingredients]
    
    for k, v in update_data.items():
        setattr(obj, k, v)
    
    db.commit()
    db.refresh(obj)
    return add_recipe_counts(obj, db)

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Supprimer une recette (propriétaire uniquement)"""
    obj = db.get(Recipe, recipe_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if obj.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your recipe")
    
    # Supprimer les images associées
    if obj.images:
        for image in obj.images:
            try:
                import asyncio
                asyncio.create_task(image_service.delete_image(image))
            except:
                pass
    
    db.delete(obj)
    db.commit()
    return

@router.post("/{recipe_id}/images")
async def upload_recipe_images(
    recipe_id: int,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Upload des images pour une recette"""
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your recipe")
    
    # Sauvegarder les images
    image_filenames = await image_service.save_multiple_images(images)
    
    # Ajouter aux images existantes ou créer la liste
    existing_images = recipe.images if recipe.images else []
    recipe.images = existing_images + image_filenames
    
    db.commit()
    db.refresh(recipe)
    
    return {
        "message": "Images uploaded successfully",
        "images": recipe.images
    }
