from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ....schemas.user import UserCreate, UserLogin, UserOut, UserUpdate, UserPublic
from ....models.user import User
from ....core.security import get_password_hash, verify_password, create_access_token
from ....db.session import get_db
from ...deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Inscription d'un nouvel utilisateur"""
    # Vérifier email et username
    if db.query(User).filter(
        or_(User.email == payload.email, User.username == payload.username)
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Connexion utilisateur"""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Récupère les informations de l'utilisateur connecté"""
    return current_user

@router.put("/me", response_model=UserOut)
def update_current_user(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Modifier le profil de l'utilisateur connecté"""
    update_data = data.model_dump(exclude_unset=True)
    
    # Vérifier que le username n'est pas déjà pris
    if 'username' in update_data:
        existing = db.query(User).filter(
            User.username == update_data['username'],
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    for k, v in update_data.items():
        setattr(current_user, k, v)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/users/{user_id}", response_model=UserPublic)
def get_user_public_profile(user_id: int, db: Session = Depends(get_db)):
    """Récupère le profil public d'un utilisateur"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
