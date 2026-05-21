from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.menu_item import MenuItem

from sqlalchemy.orm import joinedload

from app.schemas.order_schema import (
    CreateOrderSchema
)

router = APIRouter()

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

@router.post("/")
def create_order(
    payload: CreateOrderSchema,
    db: Session = Depends(get_db)
):

    total_amount = 0

    order = Order(
        restaurant_id=1,
        table_id=payload.table_id,
        customer_name=payload.customer_name,
        notes=payload.notes
    )

    db.add(order)

    db.commit()

    db.refresh(order)

    for item in payload.items:

        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id
        ).first()

        if not menu_item:
            continue

        item_total = (
            menu_item.price * item.quantity
        )

        total_amount += item_total

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=item.quantity,
            item_price=menu_item.price,
            total_price=item_total
        )

        db.add(order_item)

    order.total_amount = total_amount

    db.commit()

    return {
        "status": "success",
        "order_id": order.id,
        "total_amount": total_amount
    }


@router.get("/all")
def get_all_orders(
    db: Session = Depends(get_db)
):

    orders = db.query(Order).options(
        joinedload(Order.table),
        joinedload(Order.restaurant)
    ).all()

    response_data = []

    for order in orders:

        order_items = db.query(OrderItem).options(
            joinedload(OrderItem.menu_item)
        ).filter(
            OrderItem.order_id == order.id
        ).all()

        response_data.append({
            "id": order.id,
            "customer_name": order.customer_name,
            "order_status": order.order_status,
            "payment_status": order.payment_status,
            "total_amount": order.total_amount,
            "notes": order.notes,
            "created_at": order.created_at,
            "items": order_items
        })

    return {
        "status": "success",
        "data": response_data
    }


@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:

        return {
            "status": "error",
            "message": "Order not found"
        }

    order.order_status = status

    db.commit()

    return {
        "status": "success",
        "message": "Order status updated"
    }



@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:

        return {
            "status": "error",
            "message": "Order not found"
        }

    return {
        "status": "success",
        "data": order
    }