from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from fastapi import UploadFile, File
import shutil
import uuid

from app.database.database import SessionLocal

from app.models.menu_category import MenuCategory
from app.models.menu_item import MenuItem

from app.schemas.menu_schema import (
    CreateCategorySchema,
    CreateMenuItemSchema
)

from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

@router.post("/categories")
def create_category(
    payload: CreateCategorySchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    category = MenuCategory(
        restaurant_id=current_user.restaurant_id,
        name=payload.name,
        description=payload.description
    )

    db.add(category)

    db.commit()

    db.refresh(category)

    return {
        "status": "success",
        "data": {
            "id": category.id,
            "name": category.name
        }
    }

@router.post("/items")
def create_menu_item(
    payload: CreateMenuItemSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    menu_item = MenuItem(
        restaurant_id=current_user.restaurant_id,
        category_id=payload.category_id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
        is_veg=payload.is_veg,
        spicy_level=payload.spicy_level,
        preparation_time=payload.preparation_time
    )

    db.add(menu_item)

    db.commit()

    db.refresh(menu_item)

    return {
        "status": "success",
        "data": {
            "id": menu_item.id,
            "name": menu_item.name
        }
    }

@router.get("/items")
def get_menu_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    items = db.query(MenuItem).filter(
        MenuItem.restaurant_id == current_user.restaurant_id
    ).all()

    return {
        "status": "success",
        "count": len(items),
        "data": items
    }



@router.post("/upload-image")
def upload_menu_image(
    file: UploadFile = File(...)
):

    unique_filename = (
        f"{uuid.uuid4()}_{file.filename}"
    )

    file_path = (
        f"uploads/{unique_filename}"
    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "status": "success",
        "image_url":
        f"http://127.0.0.1:8000/uploads/{unique_filename}"
    }