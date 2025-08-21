from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from app import upload
from app.core.database import Base, engine

app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_all_tables():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully.")
    
create_all_tables()

# Include routes
app.include_router(chat_router)
app.include_router(upload.router)
