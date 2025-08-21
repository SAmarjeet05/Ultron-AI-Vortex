# app/services/chat_service.py

from typing import AsyncGenerator, List, Optional
from app.utils.ollama_client import query_ollama_model
from app.utils.file_parser import parse_file
from app.models.chat_model import ChatRequest
import os, ollama

async def process_chat(message: str, history: list, model: str = "mistral", system_prompt: str | None = None):
    # Set default system prompt if not provided
    prompt = system_prompt or (
        "You are Ultron AI 🤖, a helpful assistant. Always respond clearly, with bullet points where needed."
    )

    async def stream():
        response = ollama.chat(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": message}
            ],
            stream=True
        )

        for chunk in response:
            content = chunk["message"]["content"]
            yield content

    return stream
