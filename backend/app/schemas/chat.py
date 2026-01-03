from pydantic import BaseModel
from typing import List, Optional, Union


class TextContent(BaseModel):
    """文本内容"""
    type: str = "text"
    text: str


class ImageUrlContent(BaseModel):
    """图片URL内容"""
    type: str = "image_url"
    image_url: dict  # {"url": "data:image/...;base64,..."}


class AudioContent(BaseModel):
    """音频内容"""
    type: str = "input_audio"
    input_audio: dict  # {"data": "base64...", "format": "wav"}


# 消息内容可以是字符串或多模态内容列表
ContentItem = Union[TextContent, ImageUrlContent, AudioContent, dict]


class Message(BaseModel):
    """聊天消息"""
    role: str  # "user" | "assistant" | "system"
    content: Union[str, List[ContentItem]]


class HyperParams(BaseModel):
    """超参数配置"""
    temperature: float = 0.7
    max_tokens: int = 4096
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0


class ChatRequest(BaseModel):
    """聊天请求"""
    model: str
    messages: List[Message]
    hyper_params: Optional[HyperParams] = None
    modalities: Optional[List[str]] = None  # ["text", "image", "audio"]


class ModelInfo(BaseModel):
    """模型信息"""
    id: str
    name: str
    description: Optional[str] = None
    context_length: Optional[int] = None
    pricing: Optional[dict] = None
    modality: Optional[str] = None  # text, image, audio, multimodal
