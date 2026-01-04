"""OpenRouter 服务封装 - 使用 OpenAI SDK"""
from openai import OpenAI
from typing import AsyncGenerator, List, Dict, Any, Optional
import json
import base64

from app.config import settings
from app.schemas.chat import Message, ContentItem


class OpenRouterService:
    """OpenRouter API 服务封装，使用 OpenAI SDK"""
    
    def __init__(self):
        self.client = OpenAI(
            base_url=settings.OPENROUTER_BASE_URL,
            api_key=settings.OPENROUTER_API_KEY,
        )
    
    def _convert_message(self, message: Message) -> Dict[str, Any]:
        """转换消息格式"""
        msg = {"role": message.role}
        
        if isinstance(message.content, str):
            msg["content"] = message.content
        elif isinstance(message.content, list):
            content_list = []
            for item in message.content:
                if isinstance(item, dict):
                    content_list.append(item)
                elif hasattr(item, "model_dump"):
                    content_list.append(item.model_dump())
                else:
                    content_list.append({"type": "text", "text": str(item)})
            msg["content"] = content_list
        else:
            msg["content"] = str(message.content)
        
        return msg
    
    def _extract_images_from_content(self, content) -> List[str]:
        """从消息内容中提取图片URL"""
        images = []
        if isinstance(content, list):
            for item in content:
                if isinstance(item, dict):
                    # 检查各种可能的图片格式
                    if item.get("type") == "image_url":
                        url = item.get("image_url", {}).get("url") or item.get("url")
                        if url:
                            images.append(url)
                    elif item.get("type") == "image":
                        url = item.get("url") or item.get("image_url", {}).get("url")
                        if url:
                            images.append(url)
        return images

    def chat_stream(
        self,
        model: str,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0,
        presence_penalty: float = 0.0,
        modalities: Optional[List[str]] = None,
    ):
        """
        流式聊天完成 - 使用 OpenAI SDK
        
        Args:
            model: 模型ID (如 "openai/gpt-4o")
            messages: 消息列表
            temperature: 温度参数
            max_tokens: 最大token数
            top_p: 核采样参数
            frequency_penalty: 频率惩罚
            presence_penalty: 存在惩罚
            modalities: 输出模态 ["text", "image", "audio"]
            
        Yields:
            dict: 流式响应数据
        """
        converted_messages = [self._convert_message(msg) for msg in messages]
        
        # 构建请求参数
        request_params = {
            "model": model,
            "messages": converted_messages,
            "stream": True,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "frequency_penalty": frequency_penalty,
            "presence_penalty": presence_penalty,
        }
        
        # 添加多模态输出配置
        if modalities:
            request_params["extra_body"] = {"modalities": modalities}
        
        try:
            response = self.client.chat.completions.create(**request_params)
            
            for chunk in response:
                # 处理文本内容
                if chunk.choices and len(chunk.choices) > 0:
                    choice = chunk.choices[0]
                    delta = choice.delta
                    
                    # 文本内容
                    if delta and delta.content:
                        # 检查content是否包含图片
                        if isinstance(delta.content, list):
                            for item in delta.content:
                                if isinstance(item, dict):
                                    if item.get("type") == "text":
                                        yield {"type": "text", "content": item.get("text", "")}
                                    elif item.get("type") in ["image_url", "image"]:
                                        url = item.get("url") or item.get("image_url", {}).get("url")
                                        if url:
                                            yield {"type": "image", "url": url}
                                elif isinstance(item, str):
                                    yield {"type": "text", "content": item}
                        else:
                            yield {"type": "text", "content": delta.content}
                    
                    # 检查是否有图片（通过model_extra访问额外字段）
                    if hasattr(chunk, "model_extra") and chunk.model_extra:
                        # 检查图片
                        if "images" in chunk.model_extra:
                            for img in chunk.model_extra["images"]:
                                if isinstance(img, dict):
                                    url = img.get("image_url", {}).get("url") or img.get("url")
                                    if url:
                                        yield {"type": "image", "url": url}
                    
                    # 检查choice级别的额外数据
                    if hasattr(choice, "model_extra") and choice.model_extra:
                        if "images" in choice.model_extra:
                            for img in choice.model_extra["images"]:
                                if isinstance(img, dict):
                                    url = img.get("image_url", {}).get("url") or img.get("url")
                                    if url:
                                        yield {"type": "image", "url": url}
                    
                    # 检查delta级别的额外数据
                    if delta and hasattr(delta, "model_extra") and delta.model_extra:
                        if "images" in delta.model_extra:
                            for img in delta.model_extra["images"]:
                                if isinstance(img, dict):
                                    url = img.get("image_url", {}).get("url") or img.get("url")
                                    if url:
                                        yield {"type": "image", "url": url}
                
                # 检查完整响应中的图片（某些模型返回方式不同）
                if hasattr(chunk, "images") and chunk.images:
                    for img in chunk.images:
                        if isinstance(img, dict):
                            url = img.get("image_url", {}).get("url") or img.get("url")
                            if url:
                                yield {"type": "image", "url": url}
                        elif isinstance(img, str):
                            yield {"type": "image", "url": img}
                            
        except Exception as e:
            yield {"type": "error", "content": str(e)}
    
    def chat_completion(
        self,
        model: str,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        modalities: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        非流式聊天完成 - 用于图片生成等场景
        """
        converted_messages = [self._convert_message(msg) for msg in messages]
        
        request_params = {
            "model": model,
            "messages": converted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        if modalities:
            request_params["extra_body"] = {"modalities": modalities}
        
        try:
            response = self.client.chat.completions.create(**request_params)
            
            result = {
                "text": "",
                "images": [],
                "audio": [],
            }
            
            # 提取文本和图片
            if response.choices and len(response.choices) > 0:
                message = response.choices[0].message
                content = message.content
                
                # 处理不同格式的content
                if isinstance(content, str):
                    result["text"] = content
                elif isinstance(content, list):
                    # 多模态响应
                    text_parts = []
                    for item in content:
                        if isinstance(item, dict):
                            if item.get("type") == "text":
                                text_parts.append(item.get("text", ""))
                            elif item.get("type") in ["image_url", "image"]:
                                url = item.get("url") or item.get("image_url", {}).get("url")
                                if url:
                                    result["images"].append(url)
                        elif isinstance(item, str):
                            text_parts.append(item)
                    result["text"] = "".join(text_parts)
                
                # 检查message级别的额外数据
                if hasattr(message, "model_extra") and message.model_extra:
                    if "images" in message.model_extra:
                        for img in message.model_extra["images"]:
                            if isinstance(img, dict):
                                url = img.get("image_url", {}).get("url") or img.get("url")
                                if url:
                                    result["images"].append(url)
                            elif isinstance(img, str):
                                result["images"].append(img)
                
                # 检查response级别的图片
                if hasattr(response, "images") and response.images:
                    for img in response.images:
                        if isinstance(img, dict):
                            url = img.get("image_url", {}).get("url") or img.get("url")
                            if url:
                                result["images"].append(url)
                        elif isinstance(img, str):
                            result["images"].append(img)
                
                # 检查response级别的额外数据
                if hasattr(response, "model_extra") and response.model_extra:
                    if "images" in response.model_extra:
                        for img in response.model_extra["images"]:
                            if isinstance(img, dict):
                                url = img.get("image_url", {}).get("url") or img.get("url")
                                if url:
                                    result["images"].append(url)
                            elif isinstance(img, str):
                                result["images"].append(img)
            
            return result
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_models(self) -> List[Dict[str, Any]]:
        """获取可用模型列表"""
        try:
            response = self.client.models.list()
            models = []
            for model in response.data:
                model_info = {
                    "id": model.id,
                    "name": model.id.split("/")[-1] if "/" in model.id else model.id,
                    "owned_by": model.owned_by if hasattr(model, "owned_by") else None,
                }
                # 添加额外信息
                if hasattr(model, "model_extra") and model.model_extra:
                    model_info.update(model.model_extra)
                models.append(model_info)
            return models
        except Exception as e:
            return []


# 全局服务实例
openrouter_service = OpenRouterService()
