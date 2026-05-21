

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.menu_item import MenuItem


NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5
}

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

class ChatRequest(BaseModel):

    restaurant_id: int
    message: str
    history: list = []


@router.post("/chat")
def ai_chat(request: ChatRequest):

    db: Session = SessionLocal()

    menu_items = db.query(MenuItem).filter(
        MenuItem.restaurant_id ==
        request.restaurant_id
    ).all()

    menu_text = "\n".join([
        f"- {item.name}: {item.description}"
        for item in menu_items
    ])

    user_message = (
        request.message.lower()
    )

    conversation_context = " ".join([
        str(message.get("content", ""))
        for message in request.history
    ])

    # HANDLE:
    # "add that"
    # "add it"

    if (
        "add that" in user_message
        or "add it" in user_message
    ):

        for item in menu_items:

            if (
                item.name.lower()
                in conversation_context.lower()
            ):

                response = (
                    f"Added {item.name} to your cart"
                )

                action = {
                    "type": "add_to_cart",
                    "item_id": item.id,
                    "quantity": 1
                }

                return {
                    "status": "success",
                    "reply": response,
                    "action": action
                }

    # HANDLE DIRECT ADD

    # HANDLE REMOVE ITEM

    if "remove" in user_message:

        for item in menu_items:

            if (
                item.name.lower()
                in user_message
            ):

                return {
                    "status": "success",
                    "reply": (
                        f"Removed {item.name} from your cart."
                    ),
                    "actions": [
                        {
                            "type": "remove_from_cart",
                            "item_id": item.id
                        }
                    ]
                }
            
    # HANDLE CLEAR CART

    if (
        "clear cart" in user_message
        or "empty cart" in user_message
    ):

        return {
            "status": "success",
            "reply": "Your cart has been cleared.",
            "actions": [
                {
                 "type": "clear_cart"
                }
        ]
        }

    matched_items = []

    for item in menu_items:

        item_name = item.name.lower()

        if (
            "add" in user_message
            and item_name in user_message
        ):


            quantity = 1

            words = user_message.split()


            for word in words:

                if word.isdigit():

                    quantity = int(word)

                elif word in NUMBER_WORDS:

                    quantity = NUMBER_WORDS[word]


            matched_items.append({
        "item": item,
        "quantity": quantity
        })

    if matched_items:

        item_names = [
            f"{entry['quantity']} x {entry['item'].name}"
            for entry in matched_items
        ]

        upsell_text = ""


        if any(
            "paneer" in entry["item"].name.lower()
            for entry in matched_items
        ):

            upsell_text = (
                " Would you also like butter naan or sweet lassi?"
            )

            
        elif any(
            "pizza" in entry["item"].name.lower()
            for entry in matched_items
        ):

            upsell_text = (
                " Garlic bread pairs well with pizza."
            )

        response = (
            "Added "
            + ", ".join(item_names)
            + " to your cart."
            + upsell_text
        )



        actions = [
            {
                "type": "add_to_cart",
                "item_id": entry["item"].id,
                "quantity": entry["quantity"]
            }
            for entry in matched_items
        ]

        return {
            "status": "success",
            "reply": response,
            "actions": actions
        }

    response = (
        "I can help you with menu recommendations."
    )

    action = None

    # SPICY RECOMMENDATIONS

    if "spicy" in user_message:

        spicy_items = [
            item.name
            for item in menu_items
            if item.spicy_level
            and item.spicy_level.lower()
            in ["medium", "high"]
        ]

        if spicy_items:

            response = (
                "You may enjoy: "
                + ", ".join(spicy_items)
            )

    # DESSERTS

    elif (
        "sweet" in user_message
        or "dessert" in user_message
    ):

        dessert_items = [
            item.name
            for item in menu_items
            if (
                "brownie"
                in item.name.lower()
                or "ice cream"
                in item.name.lower()
            )
        ]

        if dessert_items:

            response = (
                "Our desserts include: "
                + ", ".join(dessert_items)
            )

    # VEG ITEMS

    elif "veg" in user_message:

        veg_items = [
            item.name
            for item in menu_items
            if item.is_veg
        ]

        if veg_items:

            response = (
                "Popular veg dishes: "
                + ", ".join(veg_items[:5])
            )



    return {
        "status": "success",
        "reply": response,
        "actions": [],
        "menu_context": menu_text
    }