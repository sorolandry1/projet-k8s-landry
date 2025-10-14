from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, JSON, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from ..db.session import Base
from typing import Any

class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    prep_time: Mapped[int | None] = mapped_column(Integer, nullable=True)  # minutes
    cook_time: Mapped[int | None] = mapped_column(Integer, nullable=True)  # minutes
    servings: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(20), nullable=True)  # facile, moyen, difficile
    category: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)  # entrée, plat, dessert, boisson
    
    # JSON fields
    ingredients: Mapped[Any] = mapped_column(JSON, nullable=False)  # [{"name": "...", "quantity": "...", "unit": "..."}]
    steps: Mapped[Any] = mapped_column(JSON, nullable=False)  # ["step 1", "step 2", ...]
    images: Mapped[Any | None] = mapped_column(JSON, nullable=True)  # ["image1.jpg", "image2.jpg"]
    tags: Mapped[Any | None] = mapped_column(ARRAY(String), nullable=True)  # ["français", "dessert"]
    
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relations
    owner = relationship("User", back_populates="recipes")
    likes = relationship("Like", back_populates="recipe", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="recipe", cascade="all, delete-orphan")
