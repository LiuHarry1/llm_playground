import type { 
  ModelsResponse, 
  ChatRequest, 
  UploadResponse,
  StreamChunk,
  ModelInfo
} from '../types';

// 支持环境变量配置 API 地址，用于生产环境部署
// 开发环境使用 vite proxy，生产环境使用环境变量
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 获取模型列表（分类后的）
 */
export async function fetchModels(): Promise<ModelsResponse> {
  const response = await fetch(`${API_BASE}/models/`);
  if (!response.ok) {
    throw new Error('Failed to fetch model list');
  }
  return response.json();
}

/**
 * 搜索模型
 */
export async function searchModels(query: string, category?: string): Promise<{ models: ModelInfo[] }> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  
  const response = await fetch(`${API_BASE}/models/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search models');
  }
  return response.json();
}

/**
 * 获取单个模型信息
 */
export async function fetchModelInfo(modelId: string): Promise<ModelInfo> {
  const response = await fetch(`${API_BASE}/models/${encodeURIComponent(modelId)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch model information');
  }
  return response.json();
}

/**
 * 上传文件
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/chat/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('File upload failed');
  }
  
  return response.json();
}

/**
 * 流式聊天
 */
export async function* chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Chat request failed');
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Unable to read response stream');
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          return;
        }
        try {
          const chunk: StreamChunk = JSON.parse(data);
          yield chunk;
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

/**
 * 非流式聊天（用于图片生成等）
 */
export async function chatComplete(request: ChatRequest): Promise<{
  text: string;
  images: string[];
  audio: string[];
}> {
  const response = await fetch(`${API_BASE}/chat/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Chat request failed');
  }
  
  return response.json();
}
