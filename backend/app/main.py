import logging
import time
from datetime import datetime
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError

from .api.v1.router import api_router
from .core.config import settings
from .core.security import get_password_hash
from .db.session import SessionLocal
from .models.user import User

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Recipe API",
    description="API pour l'application de partage de recettes de cuisine",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Créer le dossier uploads s'il n'existe pas
uploads_dir = Path("/app/uploads")
uploads_dir.mkdir(exist_ok=True, parents=True)

# Servir les fichiers statiques (images)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# CORS (dev-friendly)
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    run_database_migrations()
    seed_default_user()


def run_database_migrations() -> None:
    cfg_path = Path(__file__).resolve().parent.parent / "alembic.ini"
    if not cfg_path.exists():
        logger.warning("Alembic configuration not found at %s. Skipping migrations.", cfg_path)
        return

    alembic_cfg = Config(str(cfg_path))
    alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    script_location = Path(__file__).resolve().parent.parent / "alembic"
    alembic_cfg.set_main_option("script_location", str(script_location))

    max_attempts = 5
    for attempt in range(1, max_attempts + 1):
        try:
            command.upgrade(alembic_cfg, "head")
        except Exception as exc:
            if attempt == max_attempts:
                logger.error("Failed to apply database migrations: %s", exc)
                raise
            wait_time = attempt * 2
            logger.warning(
                "Migration attempt %s/%s failed: %s. Retrying in %ss.",
                attempt,
                max_attempts,
                exc,
                wait_time,
            )
            time.sleep(wait_time)
        else:
            logger.info("Database migrations applied successfully.")
            break

def seed_default_user():
    if not settings.SEED_DEFAULT_USER:
        return

    fixtures: dict[str, dict[str, str]] = {
        "marie@example.com": {"username": "chef_marie", "password": "Password123!"},
        "jean@example.com": {"username": "cook_jean", "password": "Password123!"},
        "sophie@example.com": {"username": "baker_sophie", "password": "Password123!"}
    }

    if settings.DEFAULT_USER_EMAIL and settings.DEFAULT_USER_PASSWORD:
        custom_username = settings.DEFAULT_USER_USERNAME or settings.DEFAULT_USER_EMAIL.split("@")[0]
        fixtures[settings.DEFAULT_USER_EMAIL] = {
            "username": custom_username,
            "password": settings.DEFAULT_USER_PASSWORD
        }

    with SessionLocal() as db:
        created = []
        for email, data in fixtures.items():
            password = data.get("password")
            if not password:
                continue

            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                continue

            preferred_username = data.get("username") or email.split("@")[0]
            base_username = "".join(preferred_username.split()) or email.split("@")[0].split("+")[0]
            base_username = base_username or "user"

            username_candidate = base_username
            suffix = 1
            while db.query(User).filter(User.username == username_candidate).first():
                suffix += 1
                username_candidate = f"{base_username}{suffix}"

            user = User(
                username=username_candidate,
                email=email,
                hashed_password=get_password_hash(password),
            )
            db.add(user)
            created.append((email, username_candidate))

        if not created:
            return

        try:
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Unable to seed default users: %s", exc)
        else:
            for email, username in created:
                logger.info("Seeded default user %s with username %s", email, username)

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Recipe API - Bienvenue!",
        "docs": "/api/docs",
        "version": "1.0.0"
    }

app.include_router(api_router, prefix="/api/v1")
