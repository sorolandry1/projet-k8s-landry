from pydantic import BaseModel, ConfigDict
from datetime import datetime

class LikeCreate(BaseModel):
    recipe_id: int

class LikeOut(BaseModel):
    id: int
    user_id: int
    recipe_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LikeWithUser(LikeOut):
    user: dict  # UserPublic
    model_config = ConfigDict(from_attributes=True)

