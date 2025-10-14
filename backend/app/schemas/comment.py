from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class CommentBase(BaseModel):
    content: str = Field(min_length=1, max_length=1000)

class CommentCreate(CommentBase):
    recipe_id: int

class CommentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)

class CommentOut(CommentBase):
    id: int
    user_id: int
    recipe_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CommentWithUser(CommentOut):
    user: dict  # UserPublic
    model_config = ConfigDict(from_attributes=True)

