// 输入输出类型
export type InputType = 'text' | 'image' | 'audio' | 'video';
export type OutputType = 'text' | 'image' | 'audio';

// 模型能力定义
export interface ModelCapabilities {
  inputTypes: InputType[];
  outputTypes: OutputType[];
}

// 模型信息 - 从 API 获取
export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  max_completion_tokens?: number;
  // 能力信息 - 从 API 动态获取
  input_modalities: string[];
  output_modalities: string[];
  modality?: string;
  // 价格信息
  pricing?: {
    prompt: string;
    completion: string;
  };
  // 支持的参数
  supported_parameters?: string[];
}

// 分类后的模型列表
export interface CategorizedModels {
  text: ModelInfo[];
  vision: ModelInfo[];
  image_generation: ModelInfo[];
  audio: ModelInfo[];
}

// 模型列表响应
export interface ModelsResponse {
  categorized: CategorizedModels;
  all: ModelInfo[];
}

// 超参数
export interface HyperParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

// 内容类型
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageUrlContent {
  type: 'image_url';
  image_url: { url: string };
}

export interface AudioContent {
  type: 'input_audio';
  input_audio: { data: string; format: string };
}

export type ContentItem = TextContent | ImageUrlContent | AudioContent;

// 消息
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentItem[];
}

// 聊天请求
export interface ChatRequest {
  model: string;
  messages: Message[];
  hyper_params?: HyperParams;
  modalities?: string[];
}

// 上传文件响应
export interface UploadResponse {
  filename: string;
  content_type: string;
  file_type: 'image' | 'audio' | 'video' | 'unknown';
  data_url: string;
  size: number;
}

// 流式响应数据
export interface StreamChunk {
  type: 'text' | 'image' | 'audio' | 'error';
  content?: string;
  url?: string;
}

// 媒体文件
export interface MediaFile {
  id: string;
  type: 'image' | 'audio' | 'video';
  dataUrl: string;
  filename: string;
  size: number;
}

// 聊天历史记录项
export interface ChatHistoryItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mediaFiles?: MediaFile[];
  images?: string[];
  timestamp: Date;
}

// 从模型信息中提取能力
export function getModelCapabilities(model: ModelInfo): ModelCapabilities {
  const inputTypes: InputType[] = [];
  const outputTypes: OutputType[] = [];
  
  // 转换输入模态
  for (const modality of model.input_modalities || ['text']) {
    if (modality === 'text') inputTypes.push('text');
    else if (modality === 'image') inputTypes.push('image');
    else if (modality === 'audio') inputTypes.push('audio');
    else if (modality === 'video') inputTypes.push('video');
  }
  
  // 转换输出模态
  for (const modality of model.output_modalities || ['text']) {
    if (modality === 'text') outputTypes.push('text');
    else if (modality === 'image') outputTypes.push('image');
    else if (modality === 'audio') outputTypes.push('audio');
  }
  
  // 确保至少有 text
  if (inputTypes.length === 0) inputTypes.push('text');
  if (outputTypes.length === 0) outputTypes.push('text');
  
  return { inputTypes, outputTypes };
}

// 检查模型是否支持特定输入类型
export function supportsInput(model: ModelInfo, inputType: InputType): boolean {
  return (model.input_modalities || ['text']).includes(inputType);
}

// 检查模型是否支持特定输出类型
export function supportsOutput(model: ModelInfo, outputType: OutputType): boolean {
  return (model.output_modalities || ['text']).includes(outputType);
}
