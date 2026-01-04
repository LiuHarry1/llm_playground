import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """应用配置"""
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    HTTP_REFERER: str = os.getenv("HTTP_REFERER", "http://localhost:5173")
    X_TITLE: str = os.getenv("X_TITLE", "LLM Playground")
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
