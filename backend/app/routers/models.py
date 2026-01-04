"""模型路由"""
from fastapi import APIRouter
from typing import List, Dict, Any

from app.services.openrouter import openrouter_service

router = APIRouter()


def categorize_model(model: Dict[str, Any]) -> str:
    """根据模型能力分类"""
    arch = model.get("architecture", {})
    input_modalities = arch.get("input_modalities", ["text"])
    output_modalities = arch.get("output_modalities", ["text"])
    
    # 图片生成模型
    if "image" in output_modalities:
        return "image_generation"
    
    # 音频模型
    if "audio" in input_modalities or "audio" in output_modalities:
        return "audio"
    
    # 视觉理解模型
    if "image" in input_modalities or "video" in input_modalities:
        return "vision"
    
    # 默认文本模型
    return "text"


def format_model_info(model: Dict[str, Any]) -> Dict[str, Any]:
    """格式化模型信息，包含能力信息"""
    arch = model.get("architecture", {})
    pricing = model.get("pricing", {})
    top_provider = model.get("top_provider", {})
    
    return {
        "id": model.get("id"),
        "name": model.get("name", model.get("id", "").split("/")[-1]),
        "description": model.get("description", ""),
        "context_length": model.get("context_length"),
        "max_completion_tokens": top_provider.get("max_completion_tokens"),
        # 能力信息
        "input_modalities": arch.get("input_modalities", ["text"]),
        "output_modalities": arch.get("output_modalities", ["text"]),
        "modality": arch.get("modality", "text->text"),
        # 价格信息
        "pricing": {
            "prompt": pricing.get("prompt", "0"),
            "completion": pricing.get("completion", "0"),
        },
        # 支持的参数
        "supported_parameters": model.get("supported_parameters", []),
    }


@router.get("/")
async def list_models() -> Dict[str, Any]:
    """获取模型列表，按能力分类"""
    # 获取 OpenRouter 所有可用模型
    all_models = openrouter_service.get_models()
    
    # 按能力分类
    categorized = {
        "text": [],
        "vision": [],
        "image_generation": [],
        "audio": [],
    }
    
    formatted_models = []
    
    for model in all_models:
        formatted = format_model_info(model)
        formatted_models.append(formatted)
        
        category = categorize_model(model)
        # 限制每个分类的数量
        if len(categorized[category]) < 50:
            categorized[category].append(formatted)
    
    return {
        "categorized": categorized,
        "all": formatted_models[:200],  # 限制返回数量
    }


@router.get("/search")
async def search_models(q: str = "", category: str = "") -> Dict[str, Any]:
    """搜索模型"""
    all_models = openrouter_service.get_models()
    
    results = []
    for model in all_models:
        # 搜索过滤
        if q:
            model_id = model.get("id", "").lower()
            model_name = model.get("name", "").lower()
            model_desc = model.get("description", "").lower()
            if q.lower() not in model_id and q.lower() not in model_name and q.lower() not in model_desc:
                continue
        
        # 分类过滤
        if category and categorize_model(model) != category:
            continue
        
        results.append(format_model_info(model))
        
        if len(results) >= 50:
            break
    
    return {"models": results}


@router.get("/{model_id:path}")
async def get_model_info(model_id: str) -> Dict[str, Any]:
    """获取单个模型的详细信息"""
    all_models = openrouter_service.get_models()
    
    for model in all_models:
        if model.get("id") == model_id:
            return format_model_info(model)
    
    return {"error": "Model not found"}
