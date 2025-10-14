from fastapi import APIRouter
from .endpoints import auth, recipes, likes, comments

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(likes.router, tags=["likes"])
api_router.include_router(comments.router, tags=["comments"])
