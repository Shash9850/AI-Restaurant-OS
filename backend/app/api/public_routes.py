from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal

from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.models.menu_category import MenuCategory
from app.models.menu_item import MenuItem

router = APIRouter()

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

@router.get("/restaurant/{restaurant_id}")
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:

        return {
            "status": "error",
            "message": "Restaurant not found"
        }

    return {
        "status": "success",
        "data": restaurant
    }

@router.get("/restaurant/{restaurant_id}/menu")
def get_restaurant_menu(
    restaurant_id: int,
    db: Session = Depends(get_db)
):

    categories = db.query(MenuCategory).filter(
        MenuCategory.restaurant_id == restaurant_id
    ).all()

    menu_data = []

    for category in categories:

        items = db.query(MenuItem).filter(
            MenuItem.category_id == category.id,
            MenuItem.is_available == True
        ).all()

        menu_data.append({
            "category_id": category.id,
            "category_name": category.name,
            "items": items
        })

    return {
        "status": "success",
        "restaurant_id": restaurant_id,
        "menu": menu_data
    }

@router.get("/table/{table_id}")
def get_table_details(
    table_id: int,
    db: Session = Depends(get_db)
):

    table = db.query(RestaurantTable).filter(
        RestaurantTable.id == table_id
    ).first()

    if not table:

        return {
            "status": "error",
            "message": "Table not found"
        }

    return {
        "status": "success",
        "data": {
            "table_id": table.id,
            "table_number": table.table_number,
            "restaurant_id": table.restaurant_id
        }
    }