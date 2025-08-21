from unittest import result
from fastapi import APIRouter, Body, HTTPException, Depends
from httpx import request
from app.models.chat_model import ChatRequest, ChatResponse, ChatListResponse, ChatCreate, NewChatResponse, RenameChatRequest, RenameChatResponse, MessageCreate, MessageResponse,ChatCreateRequest
from app.services.chat_service import process_chat
from fastapi.responses import StreamingResponse,JSONResponse
import ollama
from app.services.local_chat_storage import save_message_locally
from app.utils.chat_service import create_streaming_response
from app.core.database import SessionLocal
from app.models.db_models import Chat, Message, Category
from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db


router = APIRouter()


@router.post("/chat/mistral", response_model=ChatResponse)
async def chat_mistral(request: ChatRequest):
    result = process_chat(request.message, request.history)
    save_message_locally(request.category, "user", request.message)
    save_message_locally(request.category, "assistant", str(result))
    return ChatResponse(response=result)

@router.post("/chat/llama3", response_model=ChatResponse)
async def chat_llama3(request: ChatRequest):
    result = process_chat(request.message, request.history)
    save_message_locally(request.category, "user", request.message)
    save_message_locally(request.category, "assistant", str(result))
    return ChatResponse(response=result)

@router.post("/chat/deepseek-coder", response_model=ChatResponse)
async def chat_deepseek_coder(request: ChatRequest):
    result = process_chat(request.message, request.history)
    save_message_locally(request.category, "user", request.message)
    save_message_locally(request.category, "assistant", str(result))
    return ChatResponse(response=result)

@router.post("/chat/gemma3", response_model=ChatResponse)
async def chat_gemma3(request: ChatRequest):
    result = process_chat(request.message, request.history)
    save_message_locally(request.category, "user", request.message)
    save_message_locally(request.category, "assistant", str(result))
    return ChatResponse(response=result)

@router.post("/chat/llava", response_model=ChatResponse)
async def chat_llava(request: ChatRequest):
    result = process_chat(request.message, request.history)
    save_message_locally(request.category, "user", request.message)
    save_message_locally(request.category, "assistant", str(result))
    return ChatResponse(response=result)


@router.post("/chat/mistral/stream")
async def chat_mistral_stream(request: ChatRequest):
    system_prompt = (
        "You are Ultron AI, a professional, friendly, and highly knowledgeable assistant. "
        "Respond in a clear, concise, and structured format. Always follow these style rules:\n\n"
        "1. **Use bullet points (📌)** for listing items.\n"
        "2. **Use emojis 🤖** sparingly and purposefully for friendliness.\n"
        "3. **Use bold text** for emphasis.\n"
        "4. **Use markdown formatting** for headings and clarity.\n"
        "5. **Avoid emoji numbers like 1️⃣, 2️⃣ – use 1., 2. instead.\n"
        "6. **Add line breaks between bullet points**.\n\n"
        "Maintain a respectful, intelligent tone."
    )
    return await create_streaming_response("mistral", request, system_prompt)


@router.post("/chat/llama3-chat/stream")
async def chat_llama3_chat_stream(request: ChatRequest):

    if not request.chat_id:
        raise HTTPException(status_code=400, detail="chat_id is required")

    # You can check if chat exists here to give clear errors
    db = SessionLocal()
    chat = db.query(Chat).filter(Chat.id == request.chat_id).first()
    db.close()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    system_prompt = (
    "**You are Ultron Chat 🤖, a helpful, friendly, and professional AI assistant.**\n\n"
    "• Engage in thoughtful and natural conversations.\n"
    "• Answer in a clear, concise, and polite tone.\n"
    "• Add a touch of friendliness with relevant emojis when needed 😊.\n"
    "• Never hallucinate facts – respond honestly if unsure.\n"
    "• Always stay aligned with the context and user intent.\n\n"
    "Provide responses that are intelligent, respectful, and helpful."
)

    print("🔥 Incoming ChatRequest:", request)
    print("📨 Message:", request.message)
    print("🕘 History:", request.history)
    print("📁 Filenames:", request.filenames)
    print("📂 Category ID:", request.category)

    return await create_streaming_response("llama3:8b", request.chat_id,request, system_prompt)



@router.post("/chat/llama3-document/stream")
async def chat_llama3_document_stream(request: ChatRequest):
    system_prompt = (
        "**You are Ultron Docs 📄, a professional document analyst and summarizer.**\n\n"
        "• Analyze the uploaded document carefully.\n"
        "• Provide a structured and bullet-point summary of its key contents.\n"
        "• Identify sections such as title, headers, and major paragraphs.\n"
        "• If it's a formal document (e.g., resume, letter), evaluate tone and grammar.\n"
        "• Always return structured results with markdown formatting.\n\n"
        "Keep your analysis professional and aligned with document type."
    )

    print("🔥 Incoming ChatRequest:", request)
    print("📨 Message:", request.message)
    print("🕘 History:", request.history)
    print("📁 Filenames:", request.filenames)
    print("📂 Category ID:", request.category)

    return await create_streaming_response("llama3:8b", "Document", request, system_prompt)



@router.post("/chat/llama3-writing/stream")
async def chat_llama3_writing_stream(request: ChatRequest):
    system_prompt = (
        "**You are Ultron Writer ✍️, an expert writing assistant.**\n\n"
        "• Help users write blogs, stories, essays, letters, and more.\n"
        "• Use engaging and professional language suited to the request.\n"
        "• Suggest improvements in tone, structure, and clarity.\n"
        "• Ensure grammatical correctness and good flow.\n"
        "• Offer rewrite options or enhancements when applicable.\n\n"
        "Always be creative yet clear in expression."
    )

    print("🔥 Incoming ChatRequest:", request)
    print("📨 Message:", request.message)
    print("🕘 History:", request.history)
    print("📁 Filenames:", request.filenames)
    print("📂 Category ID:", request.category)

    return await create_streaming_response("llama3:8b", "Writing", request, system_prompt)




@router.post("/chat/llama3-knowledge/stream")
async def chat_llama3_knowledge_stream(request: ChatRequest):
    system_prompt = (
        "**You are Ultron Sage 📚, a knowledgeable assistant trained in diverse fields.**\n\n"
        "• Provide accurate and fact-based answers.\n"
        "• Break down complex topics into digestible points.\n"
        "• Use bullet points or numbered lists where needed.\n"
        "• Always verify and be cautious of hallucinating data.\n"
        "• Clarify terms, references, or jargon on request.\n\n"
        "Your tone should be confident, neutral, and informative."
    )

    print("🔥 Incoming ChatRequest:", request)
    print("📨 Message:", request.message)
    print("🕘 History:", request.history)
    print("📁 Filenames:", request.filenames)
    print("📂 Category ID:", request.category)

    return await create_streaming_response("llama3:8b", "Knowledge", request, system_prompt)



@router.post("/chat/llama3-voice/stream")
async def chat_llama3_voice_stream(request: ChatRequest):
    system_prompt = (
        "**You are Ultron Voice 🎙️, a voice conversation and transcription assistant.**\n\n"
        "• Transcribe or understand spoken content accurately.\n"
        "• Convert voice queries into actionable text instructions.\n"
        "• Maintain tone, context, and natural language flow.\n"
        "• Help convert speech into readable and structured outputs.\n"
        "• Use punctuation, formatting, and markdown when needed.\n\n"
        "Be precise and listener-friendly in your responses."
    )


    print("🔥 Incoming ChatRequest:", request)
    print("📨 Message:", request.message)
    print("🕘 History:", request.history)
    print("📁 Filenames:", request.filenames)
    print("📂 Category ID:", request.category)

    return await create_streaming_response("llama3:8b", "Voice", request, system_prompt)


@router.post("/chat/llava/stream")
async def chat_llava_stream(request: ChatRequest):
    system_prompt = (
        "**You are Ultron Vision 👁️, a multimodal assistant that understands and explains images.**\n\n"
        "• Analyze the uploaded image with attention to detail.\n"
        "• Provide a clear and structured interpretation of the contents.\n"
        "• Mention objects, colors, layouts, and any notable patterns or issues.\n"
        "• For diagrams or screenshots, explain any text or UI components.\n"
        "• If user asks questions, answer based strictly on the visual input.\n\n"
        "Use bullet points for clarity and concise breakdown."
    )


    return await create_streaming_response("llava", "Image", request, system_prompt)


@router.post("/chat/gemma3/stream")
async def chat_gemma3_stream(request: ChatRequest):
    system_prompt = (
        "You are Ultron AI, a professional, friendly, and highly knowledgeable assistant. "
        "Respond in a clear, concise, and structured format. Always follow these style rules:\n\n"
        "1. **Use bullet points (📌)** for listing items.\n"
        "2. **Use emojis 🤖** sparingly and purposefully for friendliness.\n"
        "3. **Use bold text** for emphasis.\n"
        "4. **Use markdown formatting** for headings and clarity.\n"
        "5. **Avoid emoji numbers like 1️⃣, 2️⃣ – use 1., 2. instead.\n"
        "6. **Add line breaks between bullet points**.\n\n"
        "Maintain a respectful, intelligent tone."
    )

    return await create_streaming_response("gemma3:12b", "Chat", request, system_prompt)


@router.post("/chat/deepseek-coder/stream")
async def chat_deepseek_coder_stream(request: ChatRequest):
    system_prompt = (
    "**You are Ultron Coder 👨‍💻, an expert AI software engineer and code assistant.**\n\n"
    "• Help users with writing, debugging, and explaining code in multiple languages.\n"
    "• Prioritize clean, efficient, and well-commented code.\n"
    "• Avoid unnecessary explanations unless asked.\n"
    "• Provide step-by-step logic for complex problems.\n"
    "• Stick to best practices and modern standards (e.g., PEP8, modularity).\n\n"
    "Reply strictly in code blocks where applicable."
)



    return await create_streaming_response("deepseek-coder:6.7b", "Code", request, system_prompt)


#fetching all chats for a category(done)

@router.get("/chats/{category_slug}", response_model=ChatListResponse)
def get_chats_by_category_slug(category_slug: str):
    db = SessionLocal()
    try:
        category_slug = category_slug.capitalize()
        category = db.query(Category).filter(Category.name == category_slug).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        chats = (
            db.query(Chat)
            .filter(Chat.category_id == category.id)
            .order_by(Chat.created_at.desc())
            .all()
        )

        return {
            "chats": [
                {
                    "id": chat.id,
                    "chat_name": chat.chat_name,
                    "created_at": chat.created_at,
                    "category": category.name if category else "unknown",
                }
                for chat in chats
            ]
        }
    finally:
        db.close()


    

# creating a new chat (done)

@router.post("/chats/", response_model=NewChatResponse)
def create_chat(chat: ChatCreate = Body(...)):
    db = SessionLocal()
    try:
        
        chat.slug = chat.slug.capitalize()
        # Step 1: Find the category by slug
        category = db.query(Category).filter(Category.name == chat.slug).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        # Step 2: Generate the chat
        now = datetime.utcnow()
        new_chat = Chat(
            id=str(uuid4()),
            chat_name=now.strftime(f"{chat.chat_name} %b %d, %Y %H:%M"),
            category_id=category.id,  # UUID of matched category
            created_at=now,
        )

        # Step 3: Save to DB
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)

        return {
            "id": new_chat.id,
            "chat_name": new_chat.chat_name,
            "created_at": new_chat.created_at.isoformat()
        }

    finally:
        db.close()





#renaming a chat (done)

@router.put("/chats/{chat_id}/rename")
def rename_chat(chat_id: str, payload: RenameChatRequest):
    db = SessionLocal()
    try:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        chat.chat_name = payload.new_title
        db.commit()
        return {"message": "Chat renamed successfully"}
    finally:
        db.close()




#deleting a chat (done)

@router.delete("/chats/{chat_id}", response_model=dict)
def delete_chat(chat_id: str):
    db = SessionLocal()
    try:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        db.delete(chat)
        db.commit()
        return {"message": "Chat deleted successfully"}
    finally:
        db.close()



# Fetching recent chats

@router.get("/recent-chats", response_model=ChatListResponse)
def get_recent_chats():
    db = SessionLocal()
    recent_chats = (
        db.query(Chat)
        .options(joinedload(Chat.category), joinedload(Chat.messages))  # load category and messages
        .order_by(Chat.created_at.desc())
        .limit(10)
        .all()
    )

    result = []
    for chat in recent_chats:
        last_message = None
        if chat.messages:
            # Sort messages by created_at descending, take first as last message
            sorted_msgs = sorted(chat.messages, key=lambda m: m.timestamp, reverse=True)
            last_message = sorted_msgs[0].message  # or .text

        result.append({
            "id": str(chat.id),
            "chat_name": chat.chat_name,
            "created_at": chat.created_at.isoformat(),
            "category": chat.category.name if chat.category else "unknown",
            "last_message": last_message or ""
        })

    return {"chats": result}






@router.get("/chats/{chat_id}/messages")
def get_chat_messages(chat_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.timestamp.asc())
        .all()
    )

    if not messages:
        raise HTTPException(status_code=404, detail="No messages found for this chat")

    return [
        {
            "id": m.id,
            "chat_id": m.chat_id,
            "content": m.message,
            "role": m.role,
            "created_at": m.timestamp.isoformat() if m.timestamp else None,
        }
        for m in messages
    ]


chats_db = {}

@router.post("/chats/{chat_id}/messages", response_model=MessageResponse)
async def add_message_to_chat(chat_id: str, msg: MessageCreate):
    # Ensure the chat exists
    if str(chat_id) not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Create message object
    new_msg = {
        "id": str(uuid4()),
        "chat_id": str(chat_id),
        "sender": msg.sender,
        "text": msg.text,
        "created_at": datetime.utcnow(),
    }

    chats_db[str(chat_id)]["messages"].append(new_msg)

    return new_msg




@router.post("/chats/")
async def create_chat(req: ChatCreateRequest):
    db = SessionLocal()
    try:
        chat = Chat(
            id=str(uuid4()),
            chat_name=req.chat_name,
            category_id=req.category_id
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat
    finally:
        db.close()