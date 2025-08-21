# app/models/chat_model.py
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime


class ChatRequest(BaseModel):
    category: str  # UUID
    message: str
    chat_id: Optional[str]
    history: List[Dict[str, str]]
    filenames: Optional[List[str]] = []
    



class ChatResponse(BaseModel):
    id: str
    chat_name: str
    created_at: datetime


class ChatSummary(BaseModel):
    id: str
    chat_name: str
    created_at: datetime
    category: Optional[str]
    last_message: Optional[str] = ""

class ChatListResponse(BaseModel):
    chats: List[ChatSummary]
# class ChatMessage(BaseModel):
#     id: str
#     category_id: str
#     role: str
#     content: str
#     timestamp: str


class ChatCreate(BaseModel):
    slug: str
    chat_name: str




class NewChatResponse(BaseModel):
    id: str
    chat_name: str
    created_at: datetime

class RenameChatResponse(BaseModel):
    id: str
    chat_name: str


class RenameChatRequest(BaseModel):
    new_title: str



class MessageCreate(BaseModel):
    text: str
    attachments: Optional[List[dict]] = []


class ChatMessageCreate(BaseModel):
    sender: str  # "user" or "assistant"
    text: str
    category: Optional[str] = None  # if you want to pass category for processing

class MessageResponse(BaseModel):
    id: str
    chat_id: str
    sender: str
    text: str
    created_at: datetime



class ChatCreateRequest(BaseModel):
    chat_name: str
    category_id: str


