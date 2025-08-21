from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env from the current file’s parent directory (`app/.env`)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

if not SUPABASE_URL or not SUPABASE_API_KEY:
    raise EnvironmentError("SUPABASE_URL and SUPABASE_API_KEY must be set in .env or environment variables")
