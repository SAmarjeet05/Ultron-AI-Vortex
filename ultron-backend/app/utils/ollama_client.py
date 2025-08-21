# app/utils/ollama_client.py
import ollama
from typing import AsyncGenerator
from app.models.chat_model import ChatRequest


async def query_ollama_model(message: str, history: list[ChatRequest]) -> AsyncGenerator[str, None]:
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

    # Build complete chat history
    messages = [{"role": "system", "content": system_prompt}]

    for msg in history:
        if "message" not in msg:
            print(f"Missing 'message' key in history item: {msg}")
        messages.append({"role": "user", "content": msg["content"]})

    messages.append({"role": "user", "content": message})

    # Call Ollama in streaming mode
    stream = ollama.chat(
        model="llama3",
        messages=messages,
        stream=True
    )

    for chunk in stream:
        if "message" in chunk and "content" in chunk["message"]:
            yield chunk["message"]["content"]
