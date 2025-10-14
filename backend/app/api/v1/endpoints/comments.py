from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ....schemas.comment import CommentCreate, CommentUpdate, CommentOut, CommentWithUser
from ....models.comment import Comment
from ....models.user import User
from ....models.recipe import Recipe
from ...deps import get_current_user, get_db_dep

router = APIRouter()

@router.post("/recipes/{recipe_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    recipe_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Ajouter un commentaire à une recette"""
    # Vérifier que la recette existe
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Forcer le recipe_id du path
    comment = Comment(
        content=data.content,
        user_id=current_user.id,
        recipe_id=recipe_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/recipes/{recipe_id}/comments", response_model=List[CommentWithUser])
def get_recipe_comments(
    recipe_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db_dep)
):
    """Récupère tous les commentaires d'une recette"""
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    comments = (
        db.query(Comment)
        .filter(Comment.recipe_id == recipe_id)
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return comments

@router.get("/comments/{comment_id}", response_model=CommentOut)
def get_comment(comment_id: int, db: Session = Depends(get_db_dep)):
    """Récupère un commentaire spécifique"""
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.put("/comments/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int,
    data: CommentUpdate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Modifier son propre commentaire"""
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your comment")
    
    comment.content = data.content
    db.commit()
    db.refresh(comment)
    return comment

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user)
):
    """Supprimer son propre commentaire OU commentaire sur sa recette"""
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # L'utilisateur peut supprimer son propre commentaire
    # OU supprimer un commentaire sur sa propre recette
    recipe = db.get(Recipe, comment.recipe_id)
    if comment.user_id != current_user.id and recipe.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own comments or comments on your recipes"
        )
    
    db.delete(comment)
    db.commit()
    return

