from pydantic import BaseModel

class CreateCategorySchema(BaseModel):

    name: str

    description: str | None = None

class CreateMenuItemSchema(BaseModel):

    category_id: int

    name: str

    description: str | None = None

    price: float

    is_veg: bool = True

    spicy_level: str | None = None

    preparation_time: int | None = None