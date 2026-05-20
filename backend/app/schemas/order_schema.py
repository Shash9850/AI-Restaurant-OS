from pydantic import BaseModel

class OrderItemInput(BaseModel):

    menu_item_id: int

    quantity: int

class CreateOrderSchema(BaseModel):

    table_id: int

    customer_name: str | None = None

    notes: str | None = None

    items: list[OrderItemInput]