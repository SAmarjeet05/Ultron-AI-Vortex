from fastapi.responses import StreamingResponse
from app.services.chat_service import process_chat
from app.models.chat_model import ChatRequest
from app.services.local_chat_storage import save_message_locally
from app.core.database import SessionLocal

db = SessionLocal()

async def create_streaming_response(
    model: str,
    chat_id: str,
    request: ChatRequest,
    system_prompt: str | None = None
):
    full_response = ""

    # ✅ Save user message first
    await save_message_locally(
        chat_id=chat_id,
        role="user",
        message=request.message
    )

    # Append user message to history if needed
    updated_history = request.history + [{"role": "user", "content": request.message}]

    chat_stream = await process_chat(
        message=request.message,
        history=updated_history,
        model=model,
        system_prompt=system_prompt
    )

    async def chat_generator():
        async for chunk in chat_stream():
            nonlocal full_response
            full_response += chunk
            yield chunk

    async def stream_and_save():
        async for chunk in chat_generator():
            yield chunk

        print("✅ Chat generation complete. Saving assistant message...")
        await save_message_locally(
            chat_id=chat_id,
            role="assistant",
            message=full_response
        )

    return StreamingResponse(stream_and_save(), media_type="text/plain")
