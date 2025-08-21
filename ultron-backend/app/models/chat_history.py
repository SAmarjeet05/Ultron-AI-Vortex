# app/models/chat_history.py

from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
from uuid import UUID

class ChatHistory(BaseModel):
    id: UUID
    chat_name: str
    message: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            UUID: lambda u: str(u),
            datetime: lambda dt: dt.isoformat()
        }
