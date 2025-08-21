# app/services/chat_title_generator.py

from typing import Optional
import ollama

async def generate_chat_title(message: str) -> str:
    prompt = f"Generate a concise title for the following user message:\n\n{message}"
    response = ollama.chat(
        model="mistral",
        messages=[{"role": "user", "content": prompt}]
    )
    title = response["message"]["content"].strip()
    return title[:50]  # truncate to avoid long titles
