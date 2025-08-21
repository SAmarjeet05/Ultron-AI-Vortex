from app.models.db_models import Message, Category, Chat
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from uuid import uuid4
from datetime import datetime

chat_tracker = {}

async def save_message_locally(chat_id: str, role: str, message: str):
    db = SessionLocal()
    try:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise Exception(f"Chat with id {chat_id} not found")

        msg = Message(
            id=str(uuid4()),
            category_id=chat.category_id,
            chat_id=chat.id,
            role=role,
            message=message,
            timestamp=datetime.utcnow()
        )
        db.add(msg)
        db.commit()

    finally:
        db.close()




def get_category_id_by_name(db: Session, name: str) -> int:
    category = db.query(Category).filter_by(name=name).first()
    if not category:
        category = Category(name=name)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category.id

