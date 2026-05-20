from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.restaurant import Restaurant
from app.models.user import User

from app.schemas.auth_schema import (
    SignupSchema,
    LoginSchema
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter()

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

@router.post("/signup")
def signup(
    payload: SignupSchema,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if existing_user:

        return {
            "status": "error",
            "message": "Email already registered"
        }

    restaurant = Restaurant(
        name=payload.restaurant_name
    )

    db.add(restaurant)

    db.commit()

    db.refresh(restaurant)

    user = User(
        restaurant_id=restaurant.id,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="owner"
    )

    db.add(user)

    db.commit()

    return {
        "status": "success",
        "message": "Account created successfully"
    }

@router.post("/login")
def login(
    payload: LoginSchema,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if not user:

        return {
            "status": "error",
            "message": "Invalid credentials"
        }

    valid_password = verify_password(
        payload.password,
        user.hashed_password
    )

    if not valid_password:

        return {
            "status": "error",
            "message": "Invalid credentials"
        }

    token = create_access_token({
        "user_id": user.id,
        "email": user.email
    })

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer"
    }