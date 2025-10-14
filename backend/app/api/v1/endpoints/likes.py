from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from ....schemas.like import LikeOut, LikeWithUser
from ....models.like import Like
from ....models.user import User
from ....models.recipe import Recipe
from ...deps import get_current_user, get_db_dep

router = APIRouter()

@router.post("/recipes/{recipe_id}/like", response_model=LikeOut, status_code=status.HTTP_201_CREATED)
def toggle_like(
    recipe_id: int,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Like ou unlike une recette"""
    # Vérifier que la recette existe
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Vérifier si l'utilisateur a déjà liké
    existing_like = db.query(Like).filter(
        and_(Like.user_id == current_user.id, Like.recipe_id == recipe_id)
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        db.commit()
        raise HTTPException(status_code=204, detail="Like removed")
    
    # Like
    like = Like(user_id=current_user.id, recipe_id=recipe_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like

@router.get("/recipes/{recipe_id}/likes", response_model=List[LikeWithUser])
def get_recipe_likes(recipe_id: int, db: Session = Depends(get_db_dep)):
    """Récupère tous les likes d'une recette"""
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    likes = db.query(Like).filter(Like.recipe_id == recipe_id).all()
    return likes

@router.get("/recipes/{recipe_id}/likes/count")
def get_recipe_likes_count(recipe_id: int, db: Session = Depends(get_db_dep)):
    """Récupère le nombre de likes d'une recette"""
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    count = db.query(Like).filter(Like.recipe_id == recipe_id).count()
    return {"recipe_id": recipe_id, "likes_count": count}

@router.get("/recipes/{recipe_id}/likes/me")
def check_user_liked(
    recipe_id: int,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Vérifie si l'utilisateur actuel a liké la recette"""
    like = db.query(Like).filter(
        and_(Like.user_id == current_user.id, Like.recipe_id == recipe_id)
    ).first()
    return {"liked": like is not None}

