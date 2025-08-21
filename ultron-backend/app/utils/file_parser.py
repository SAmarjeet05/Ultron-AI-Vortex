# app/utils/file_parser.py

import os
from typing import Optional
from docx import Document
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract

def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    return "\n".join([page.extract_text() or "" for page in reader.pages])

def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_text_from_image(file_path: str) -> str:
    image = Image.open(file_path)
    return pytesseract.image_to_string(image)

def parse_file(file_path: str) -> Optional[str]:
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".pdf":
            return extract_text_from_pdf(file_path)
        elif ext == ".docx":
            return extract_text_from_docx(file_path)
        elif ext == ".txt":
            return extract_text_from_txt(file_path)
        elif ext in [".png", ".jpg", ".jpeg"]:
            return extract_text_from_image(file_path)
        else:
            return None
    except Exception as e:
        print(f"[ERROR] Failed to parse {file_path}: {e}")
        return None
