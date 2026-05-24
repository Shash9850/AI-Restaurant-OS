

from urllib import request

from app.models import customer
from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.menu_item import MenuItem
from app.models.customer import Customer

import os

from dotenv import load_dotenv

from openai import OpenAI


load_dotenv()

client = OpenAI(
    api_key=os.getenv(
        "OPENAI_API_KEY"
    )
)


NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5
}

MULTILINGUAL_KEYWORDS = {

    "spicy": [
        "spicy",
        "masaledar",
        "तिखट",
        "tikhat"
    ],

    "veg": [
        "veg",
        "vegetarian",
        "शाकाहारी",
        "veg pahije",
        "veg chahiye"
    ],

    "dessert": [
        "sweet",
        "dessert",
        "mithai",
        "गोड",
        "sweet pahije"
    ],

    "add": [
        "add",
        "include",
        "add karo",
        "डालो",
        "घाला"
    ],

    "remove": [
        "remove",
        "delete",
        "हटाओ",
        "काढा"
    ]
}


def contains_keyword(
    user_message,
    keyword_group
):

    return any(
        keyword in user_message
        for keyword in
        MULTILINGUAL_KEYWORDS[
            keyword_group
        ]
    )

def detect_language(
    text
):

    text = text.lower()

    # MARATHI

    marathi_words = [
        "मला",
        "पाहिजे",
        "तिखट",
        "काय",
        "आहे"
    ]

    # HINDI

    hindi_words = [
        "mujhe",
        "chahiye",
        "kuch",
        "hai",
        "aur"
    ]

    if any(
        word in text
        for word in marathi_words
    ):

        return "Marathi"

    if any(
        word in text
        for word in hindi_words
    ):

        return "Hindi"

    return "English"

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

class ChatRequest(BaseModel):

    restaurant_id: int

    customer_name: str | None = None

    phone: str | None = None

    message: str

    history: list = []



@router.post("/chat")
def ai_chat(request: ChatRequest):

    db: Session = SessionLocal()

    customer = None

    if request.phone:

        customer = db.query(
            Customer
        ).filter(
            Customer.phone ==
            request.phone
        ).first()

    # CREATE CUSTOMER
    # IF NOT EXISTS

    if not customer:

        customer = Customer(
            name=request.customer_name,
            phone=request.phone
        )

        db.add(customer)

        db.commit()

        db.refresh(customer)

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

    detected_language = (
    detect_language(
        user_message
    )
)

    if customer:

        customer.preferred_language = (
            detected_language
        )

        db.commit()
    conversation_context = " ".join([
        str(message.get("content", ""))
        for message in request.history
    ])

    customer_context = ""

    if customer:

        customer_context = f"""
        Customer name:
        {customer.name}

        Preferred language:
        {customer.preferred_language}

        Spice preference:
        {customer.spice_preference}

        Dietary preference:
        {customer.dietary_preference}

        Favorite items:
        {customer.favorite_items}
        """

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

    if contains_keyword(
        user_message,
        "remove"
    ):

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
            contains_keyword(
            user_message,
            "add"
        )
            
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

        if customer:

            favorites = [
            entry["item"].name
            for entry in matched_items
        ]

            customer.favorite_items = (
            ", ".join(favorites)
        )

            db.commit()

        return {
            "status": "success",
            "reply": response,
            "actions": actions
        }

    system_prompt = f"""
    You are a smart multilingual AI restaurant waiter.

    Restaurant Menu:
    {menu_text}

    Customer Profile:
    {customer_context}

    You can speak:
    - English
    - Hindi
    - Marathi

    Be friendly, concise, warm, and helpful.

    Recommend dishes intelligently based on customer preferences.
    """
    recommendation_keywords = [
    "recommend",
    "suggest",
    "what should i eat",
    "best dish",
    "special",
    "kya khau",
    "kay khau",
    "suggest karo"
    ]


    response = (
    "I can help you with menu recommendations."
)



    if any(
        keyword in user_message
        for keyword in recommendation_keywords
    ):

        recommended_items = []

        # PRIORITIZE CUSTOMER FAVORITES

        if (
            customer
            and customer.favorite_items
        ):

            recommended_items.append(
                customer.favorite_items
            )

        # SPICY PREFERENCE

        elif (
            customer
            and customer.spice_preference
            == "Spicy"
        ):

            spicy_menu = [
                item.name
                for item in menu_items
                if item.spicy_level
                and item.spicy_level.lower()
                in ["medium", "high"]
            ]

            recommended_items.extend(
                spicy_menu[:3]
            )

        # VEG PREFERENCE

        elif (
            customer
            and customer.dietary_preference
            == "Veg"
        ):

            veg_menu = [
                item.name
                for item in menu_items
                if item.is_veg
            ]

            recommended_items.extend(
                veg_menu[:3]
            )

        else:

            recommended_items = [
                item.name
                for item in menu_items[:3]
            ]

        # LANGUAGE RESPONSE
        prompt = f"""
        Customer message:
        {request.message}

        Recommended items:
        {", ".join(recommended_items)}

        Reply naturally in the customer's language.
        Keep response short, warm, and conversational.
        """

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7
        )

        response = (
            completion
            .choices[0]
            .message
            .content
        )

        return {
            "status": "success",
            "reply": response,
            "actions": [],
            "menu_context": menu_text
        }






    
    if customer:

        response = (
            f"Welcome back {customer.name or 'Guest'}! "
        )

        if customer.favorite_items:

            response += (
                f"I remember you enjoy "
                f"{customer.favorite_items}. "
            )

        if customer.spice_preference:

            response += (
                f"You seem to like "
                f"{customer.spice_preference.lower()} food. "
            )

        response += (
            "What would you like today?"
        )

    action = None

    # SPICY RECOMMENDATIONS



    if contains_keyword(
        user_message,
        "spicy"
    ):
        
        if customer:

            customer.spice_preference = (
                "Spicy"
        )

            db.commit()

        spicy_items = [
            item.name
            for item in menu_items
            if item.spicy_level
            and item.spicy_level.lower()
            in ["medium", "high"]
        ]

        if spicy_items:

            if detected_language == "Marathi":

                response = (
                    "आपल्यासाठी उत्तम पर्याय: "
                    + ", ".join(spicy_items)
            )
            elif detected_language == "Hindi":

                response = (
                    "Aap try kar sakte hain: "
                    + ", ".join(spicy_items)
                )

            else:

                response = (
                    "You may enjoy: "
                    + ", ".join(spicy_items)
            )

    # DESSERTS
    elif contains_keyword(
        user_message,
        "dessert"
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

    elif contains_keyword(
    user_message,
    "veg"
):

        if customer:

            customer.dietary_preference = (
                "Veg"
            )

            db.commit()

        veg_items = [
            item.name
            for item in menu_items
            if item.is_veg
        ]

        if veg_items:

            if detected_language == "Marathi":

                response = (
                    "लोकप्रिय शाकाहारी पदार्थ: "
                    + ", ".join(veg_items[:5])
                )

            elif detected_language == "Hindi":

                response = (
                    "Popular veg dishes: "
                    + ", ".join(veg_items[:5])
                )

            else:

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