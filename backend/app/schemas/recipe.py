from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import List, Any

class Ingredient(BaseModel):
    name: str
    quantity: str
    unit: str

class RecipeBase(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=20, max_length=2000)
    prep_time: int | None = Field(default=None, gt=0, le=1440)  # max 24h
    cook_time: int | None = Field(default=None, gt=0, le=1440)
    servings: int | None = Field(default=None, gt=0, le=100)
    difficulty: str | None = Field(default=None, pattern="^(facile|moyen|difficile)$")
    category: str | None = None  # entrée, plat, dessert, boisson
    ingredients: List[Ingredient] = Field(min_length=1)
    steps: List[str] = Field(min_length=1)
    tags: List[str] | None = None

class RecipeCreate(RecipeBase):
    pass

class RecipeUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=200)
    description: str | None = Field(default=None, min_length=20, max_length=2000)
    prep_time: int | None = None
    cook_time: int | None = None
    servings: int | None = None
    difficulty: str | None = Field(default=None, pattern="^(facile|moyen|difficile)$")
    category: str | None = None
    ingredients: List[Ingredient] | None = None
    steps: List[str] | None = None
    tags: List[str] | None = None

class RecipeOut(RecipeBase):
    id: int
    owner_id: int
    images: List[str] | None = None
    created_at: datetime
    updated_at: datetime
    likes_count: int = 0
    comments_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class RecipeWithOwner(RecipeOut):
    owner: Any  # UserPublic
    model_config = ConfigDict(from_attributes=True)
