from pydantic import BaseModel, EmailStr

class SignupSchema(BaseModel):

    full_name: str

    email: EmailStr

    password: str

    restaurant_name: str

class LoginSchema(BaseModel):

    email: EmailStr

    password: str