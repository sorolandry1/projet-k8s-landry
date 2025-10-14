from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+psycopg2://recette:recette@localhost:5432/recette")
    JWT_SECRET: str = Field(default="change-me-in-prod")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)
    CORS_ORIGINS: str = Field(default="http://localhost:5173,http://localhost:5176")
    SEED_DEFAULT_USER: bool = Field(default=True)
    DEFAULT_USER_EMAIL: str | None = Field(default=None)
    DEFAULT_USER_PASSWORD: str | None = Field(default=None)
    DEFAULT_USER_USERNAME: str | None = Field(default=None)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
