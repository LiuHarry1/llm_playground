"""LLM Playground 后端主入口"""
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import chat, models

# 创建 FastAPI 应用
app = FastAPI(
    title="LLM Playground API",
    description="多模态 LLM Playground 后端 API - 基于 OpenRouter",
    version="1.0.0",
)

# 挂载静态文件目录（用于测试图片等）
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

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
