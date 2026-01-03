"""LLM Playground 后端主入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import chat, models

# 创建 FastAPI 应用
app = FastAPI(
    title="LLM Playground API",
    description="多模态 LLM Playground 后端 API - 基于 OpenRouter",
    version="1.0.0",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(models.router, prefix="/api/models", tags=["Models"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "LLM Playground API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "ok"}
