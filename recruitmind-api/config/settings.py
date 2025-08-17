# recruitmind-api/config/settings.py
from pydantic import BaseModel

class Settings:
    cors_origins: list[str] = ["http://localhost:3000"]  # Update for production
    model_name: str = "Shunian/mbti-classification-roberta-base"  # Use HuggingFace model

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
