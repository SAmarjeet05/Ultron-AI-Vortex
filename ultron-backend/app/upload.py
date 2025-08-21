from fastapi import APIRouter, UploadFile, File, Form
from typing import List

router = APIRouter()

@router.post("/api/upload")
async def upload_file(
    message: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    links: List[str] = Form(default=[])
):
    return {"message": message, "files": [file.filename for file in files], "links": links}
