from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    bio: str | None = None

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not any(char.isupper() for char in v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=50)
    bio: str | None = None
    profile_picture: str | None = None

class UserOut(UserBase):
    id: int
    profile_picture: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserPublic(BaseModel):
    """Profil public d'un utilisateur (sans email)"""
    id: int
    username: str
    bio: str | None = None
    profile_picture: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
