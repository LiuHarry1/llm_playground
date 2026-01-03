"""模型路由"""
from fastapi import APIRouter
from typing import List, Dict, Any

from app.services.openrouter import openrouter_service

router = APIRouter()

# 推荐模型列表 - 按类型分类
RECOMMENDED_MODELS = {
    "text": [
        {"id": "openai/gpt-4o", "name": "GPT-4o", "description": "OpenAI 最新多模态模型"},
        {"id": "openai/gpt-4o-mini", "name": "GPT-4o Mini", "description": "轻量级多模态模型"},
        {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet", "description": "Anthropic 最新模型"},
        {"id": "anthropic/claude-3-opus", "name": "Claude 3 Opus", "description": "Anthropic 最强模型"},
        {"id": "google/gemini-pro-1.5", "name": "Gemini Pro 1.5", "description": "Google 最新模型"},
        {"id": "meta-llama/llama-3.1-405b-instruct", "name": "Llama 3.1 405B", "description": "Meta 开源大模型"},
        {"id": "deepseek/deepseek-chat", "name": "DeepSeek Chat", "description": "DeepSeek 对话模型"},
    ],
    "vision": [
        {"id": "openai/gpt-4o", "name": "GPT-4o", "description": "图片理解"},
        {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet", "description": "图片分析"},
        {"id": "google/gemini-pro-1.5", "name": "Gemini Pro 1.5", "description": "多模态理解"},
    ],
    "image_generation": [
        {"id": "black-forest-labs/flux-1.1-pro", "name": "FLUX 1.1 Pro", "description": "高质量图片生成"},
        {"id": "black-forest-labs/flux-schnell", "name": "FLUX Schnell", "description": "快速图片生成"},
        {"id": "stabilityai/stable-diffusion-xl", "name": "SDXL", "description": "Stable Diffusion XL"},
    ],
    "audio": [
        {"id": "openai/gpt-4o-audio-preview", "name": "GPT-4o Audio", "description": "音频理解和生成"},
    ],
}


@router.get("/")
async def list_models() -> Dict[str, Any]:
    """获取模型列表"""
    # 获取 OpenRouter 所有可用模型
    all_models = openrouter_service.get_models()
    
    return {
        "recommended": RECOMMENDED_MODELS,
        "all": all_models[:100],  # 限制返回数量
    }


@router.get("/recommended")
async def get_recommended_models() -> Dict[str, List[Dict[str, Any]]]:
    """获取推荐模型列表"""
    return RECOMMENDED_MODELS
