from fastapi import FastAPI
from sqlalchemy import text
from app.api.menu_routes import router as menu_router

from app.database.database import engine

from app.api.auth_routes import router as auth_router

from app.api.order_routes import router as order_router

from app.api.public_routes import router as public_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    
    title="AI Restaurant OS API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    menu_router,
    prefix="/menu",
    tags=["Menu"]
)



app.include_router(
    order_router,
    prefix="/orders",
    tags=["Orders"]
)


app.include_router(
    public_router,
    prefix="/public",
    tags=["Public APIs"]
)

@app.get("/")
def root():

    return {
        "message": "AI Restaurant OS Backend Running Successfully"
    }

@app.get("/test-db")
def test_database():

    try:

        with engine.connect() as connection:

            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "Database connected successfully"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }