"""聊天路由"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List
import json
import base64

from app.schemas.chat import ChatRequest, Message
from app.services.openrouter import openrouter_service

router = APIRouter()


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    流式聊天接口 - 返回 SSE 格式响应
    
    支持:
    - 文本对话
    - 图片理解 (发送图片让模型分析)
    - 图片生成 (让模型生成图片)
    - 音频处理
    """
    # 提取超参数
    params = request.hyper_params
    temperature = params.temperature if params else 0.7
    max_tokens = params.max_tokens if params else 4096
    top_p = params.top_p if params else 1.0
    frequency_penalty = params.frequency_penalty if params else 0.0
    presence_penalty = params.presence_penalty if params else 0.0
    
    def generate():
        """生成 SSE 流"""
        try:
            for chunk in openrouter_service.chat_stream(
                model=request.model,
                messages=request.messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                frequency_penalty=frequency_penalty,
                presence_penalty=presence_penalty,
                modalities=request.modalities,
            ):
                # SSE 格式
                yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
            
            # 结束信号
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/complete")
async def chat_complete(request: ChatRequest):
    """
    非流式聊天接口 - 适用于图片生成等场景
    """
    params = request.hyper_params
    temperature = params.temperature if params else 0.7
    max_tokens = params.max_tokens if params else 4096
    
    result = openrouter_service.chat_completion(
        model=request.model,
        messages=request.messages,
        temperature=temperature,
        max_tokens=max_tokens,
        modalities=request.modalities,
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    文件上传接口 - 将文件转换为 base64
    
    支持: 图片 (png, jpg, gif, webp), 音频 (wav, mp3, m4a), 视频 (mp4, webm)
    """
    # 读取文件内容
    content = await file.read()
    
    # 获取 MIME 类型
    content_type = file.content_type or "application/octet-stream"
    
    # 转换为 base64
    base64_data = base64.b64encode(content).decode("utf-8")
    
    # 构建 data URL
    data_url = f"data:{content_type};base64,{base64_data}"
    
    # 确定文件类型
    file_type = "unknown"
    if content_type.startswith("image/"):
        file_type = "image"
    elif content_type.startswith("audio/"):
        file_type = "audio"
    elif content_type.startswith("video/"):
        file_type = "video"
    
    return {
        "filename": file.filename,
        "content_type": content_type,
        "file_type": file_type,
        "data_url": data_url,
        "size": len(content),
    }
