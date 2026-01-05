import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings, Trash2, Zap } from 'lucide-react';
import ModelSelector from './components/ModelSelector';
import SystemPrompt from './components/SystemPrompt';
import HyperParams from './components/HyperParams';
import ChatInput from './components/ChatInput';
import ChatOutput from './components/ChatOutput';
import CapabilityIndicator from './components/CapabilityIndicator';
import { chatStream, chatComplete } from './services/api';
import type { 
  ModelCapabilities, 
  HyperParams as HyperParamsType, 
  ChatHistoryItem,
  MediaFile,
  Message,
  ContentItem,
  ModelInfo
} from './types';

const DEFAULT_HYPER_PARAMS: HyperParamsType = {
  temperature: 0.7,
  max_tokens: 4096,
  top_p: 1.0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
};

export default function App() {
  // 状态管理
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [capabilities, setCapabilities] = useState<ModelCapabilities>({
    inputTypes: ['text'],
    outputTypes: ['text'],
  });
  const [systemPrompt, setSystemPrompt] = useState('你是一个有帮助的AI助手。');
  const [hyperParams, setHyperParams] = useState<HyperParamsType>(DEFAULT_HYPER_PARAMS);
  const [showParams, setShowParams] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingImages, setStreamingImages] = useState<string[]>([]);

  // 处理模型变更
  const handleModelChange = useCallback((model: ModelInfo, caps: ModelCapabilities) => {
    console.log('handleModelChange called with model:', model.id, model.name);
    setSelectedModel(model);
    setCapabilities(caps);
  }, []);

  // 构建消息内容
  const buildMessageContent = (text: string, mediaFiles: MediaFile[]): string | ContentItem[] => {
    if (mediaFiles.length === 0) {
      return text;
    }

    const content: ContentItem[] = [];

    // 添加文本
    if (text) {
      content.push({ type: 'text', text });
    }

    // 添加媒体文件
    for (const file of mediaFiles) {
      if (file.type === 'image') {
        content.push({
          type: 'image_url',
          image_url: { url: file.dataUrl }
        });
      } else if (file.type === 'audio') {
        // 提取 base64 数据
        const base64Match = file.dataUrl.match(/^data:audio\/(\w+);base64,(.+)$/);
        if (base64Match) {
          content.push({
            type: 'input_audio',
            input_audio: { data: base64Match[2], format: base64Match[1] }
          });
        }
      }
      // 视频暂时作为图片处理（某些模型支持视频帧）
      else if (file.type === 'video') {
        content.push({
          type: 'image_url',
          image_url: { url: file.dataUrl }
        });
      }
    }

    return content;
  };

  // 发送消息
  const handleSend = useCallback(async (text: string, mediaFiles: MediaFile[]) => {
    console.log('handleSend called with text:', text, 'selectedModel:', selectedModel?.id);
    if (!selectedModel) {
      console.error('No model selected');
      return;
    }

    // 添加用户消息到历史
    const userMessage: ChatHistoryItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);

    // 构建请求消息
    const messages: Message[] = [];
    
    // 系统提示词
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    // 历史消息（简化版，只取最近几条）
    const recentHistory = chatHistory.slice(-10);
    for (const item of recentHistory) {
      if (item.role === 'user') {
        messages.push({
          role: 'user',
          content: item.mediaFiles 
            ? buildMessageContent(item.content, item.mediaFiles)
            : item.content
        });
      } else {
        messages.push({
          role: 'assistant',
          content: item.content
        });
      }
    }

    // 当前消息
    messages.push({
      role: 'user',
      content: buildMessageContent(text, mediaFiles)
    });

    // 确定输出模态
    const modalities = capabilities.outputTypes;

    // 开始流式响应
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingImages([]);

    try {
      // 判断是否可能生成图片（输出包含image）
      const canGenerateImage = capabilities.outputTypes.includes('image');
      // 纯图片生成模型（不支持文本输出）使用非流式接口
      const isPureImageGenModel = canGenerateImage && !capabilities.outputTypes.includes('text');

      if (isPureImageGenModel) {
        // 使用非流式接口进行纯图片生成
        const result = await chatComplete({
          model: selectedModel.id,
          messages,
          hyper_params: hyperParams,
          modalities,
        });

        const assistantMessage: ChatHistoryItem = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.text || '',
          images: result.images,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        // 使用流式接口
        let fullContent = '';
        const images: string[] = [];

        for await (const chunk of chatStream({
          model: selectedModel.id,
          messages,
          hyper_params: hyperParams,
          modalities,
        })) {
          if (chunk.type === 'text' && chunk.content) {
            fullContent += chunk.content;
            setStreamingContent(fullContent);
          } else if (chunk.type === 'image' && chunk.url) {
            images.push(chunk.url);
            setStreamingImages([...images]);
          } else if (chunk.type === 'error') {
            console.error('Stream error:', chunk.content);
          }
        }

        // 添加助手消息到历史
        const assistantMessage: ChatHistoryItem = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          images: images.length > 0 ? images : undefined,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatHistoryItem = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `错误: ${error instanceof Error ? error.message : '请求失败'}`,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingImages([]);
    }
  }, [selectedModel, systemPrompt, hyperParams, capabilities, chatHistory]);

  // 清空对话
  const handleClear = () => {
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* 左侧边栏 - 设置区 */}
      <aside className="w-80 flex-shrink-0 border-r border-surface-800/50 
                       bg-surface-900/50 backdrop-blur-xl p-6 space-y-6
                       overflow-y-auto relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 pb-4 border-b border-surface-800/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-magenta
                         flex items-center justify-center shadow-lg shadow-accent-purple/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-surface-50">LLM Playground</h1>
            <p className="text-xs text-surface-500">多模态实验平台</p>
          </div>
        </div>

        {/* 模型选择 */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-surface-400 uppercase tracking-wider">
            模型选择
          </label>
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
        </div>

        {/* 能力指示器 */}
        {selectedModel && (
          <CapabilityIndicator 
            capabilities={capabilities}
            modelName={selectedModel.name}
          />
        )}

        {/* 系统提示词 */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-surface-400 uppercase tracking-wider">
            系统提示词
          </label>
          <SystemPrompt 
            value={systemPrompt}
            onChange={setSystemPrompt}
          />
        </div>

        {/* 超参数设置 */}
        <div className="space-y-2">
          <button
            onClick={() => setShowParams(!showParams)}
            className="flex items-center gap-2 text-xs font-medium text-surface-400 
                      uppercase tracking-wider hover:text-surface-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            超参数设置
          </button>
          <AnimatePresence>
            {showParams && (
              <HyperParams 
                params={hyperParams}
                onChange={setHyperParams}
              />
            )}
          </AnimatePresence>
        </div>

        {/* 清空按钮 */}
        <button
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                    bg-red-500/10 border border-red-500/30 rounded-xl
                    text-red-400 hover:bg-red-500/20 transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
          清空对话
        </button>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* 聊天输出区 */}
        <ChatOutput 
          history={chatHistory}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          streamingImages={streamingImages}
        />

        {/* 输入区 */}
        <div className="p-6 border-t border-surface-800/50 bg-surface-900/30 backdrop-blur-xl">
          <ChatInput 
            onSend={handleSend}
            capabilities={capabilities}
            isLoading={isStreaming}
            disabled={!selectedModel}
          />
          <div className="mt-3 text-center text-xs text-surface-500">
            {selectedModel 
              ? '支持拖拽上传文件 • Enter 发送, Shift + Enter 换行'
              : '请先选择一个模型'
            }
          </div>
        </div>
      </main>
    </div>
  );
}
