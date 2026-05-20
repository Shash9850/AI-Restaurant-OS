from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database.database import Base
from app.models.base import TimestampMixin

class OrderItem(Base, TimestampMixin):

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id")
    )

    menu_item_id = Column(
        Integer,
        ForeignKey("menu_items.id")
    )

    quantity = Column(Integer, default=1)

    item_price = Column(Float)

    total_price = Column(Float)

    order = relationship("Order")

    menu_item = relationship("MenuItem")