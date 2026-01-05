import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, Loader2 } from 'lucide-react';
import type { ChatHistoryItem } from '../types';
import { useState } from 'react';
import MediaPreview, { GeneratedImage } from './MediaPreview';

interface ChatOutputProps {
  history: ChatHistoryItem[];
  isStreaming: boolean;
  streamingContent: string;
  streamingImages: string[];
}

function MessageBubble({ item }: { item: ChatHistoryItem }) {
  const [copied, setCopied] = useState(false);
  const isUser = item.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* 头像 */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                      ${isUser 
                        ? 'bg-gradient-to-br from-accent-orange to-accent-yellow' 
                        : 'bg-gradient-to-br from-accent-blue to-accent-purple'
                      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left rounded-2xl px-4 py-3
                        ${isUser 
                          ? 'bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30' 
                          : 'bg-surface-800/50 border border-surface-700/50'
                        }`}>
          {/* 用户上传的媒体文件 */}
          {item.mediaFiles && item.mediaFiles.length > 0 && (
            <div className="mb-3">
              <MediaPreview files={item.mediaFiles} readonly compact />
            </div>
          )}

          {/* 文本内容 */}
          {item.content && (
            <div className="prose prose-invert prose-sm max-w-none
                           prose-p:my-2 prose-headings:my-3
                           prose-code:bg-surface-700 prose-code:px-1.5 prose-code:py-0.5 
                           prose-code:rounded prose-code:text-accent-cyan
                           prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.content}
              </ReactMarkdown>
            </div>
          )}

          {/* AI生成的图片 */}
          {item.images && item.images.length > 0 && (
            <div className="mt-3 space-y-3">
              {item.images.map((url, idx) => (
                <GeneratedImage key={idx} url={url} index={idx} />
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className={`flex items-center gap-2 mt-2 text-xs text-surface-500
                        ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>
            {item.timestamp.toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {!isUser && item.content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md
                        hover:bg-surface-700/50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-accent-green" />
                  <span className="text-accent-green">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>复制</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StreamingMessage({ content, images }: { content: string; images: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      {/* 头像 */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                     bg-gradient-to-br from-accent-blue to-accent-purple animate-pulse-glow">
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* 消息内容 */}
      <div className="flex-1 max-w-[80%]">
        <div className="inline-block text-left rounded-2xl px-4 py-3
                       bg-surface-800/50 border border-surface-700/50">
          {content ? (
            <div className="prose prose-invert prose-sm max-w-none
                           prose-p:my-2 prose-headings:my-3
                           prose-code:bg-surface-700 prose-code:px-1.5 prose-code:py-0.5 
                           prose-code:rounded prose-code:text-accent-cyan
                           prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {/* 打字光标 */}
              <span className="inline-block w-2 h-4 bg-accent-blue ml-1 animate-typing" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-surface-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">思考中...</span>
            </div>
          )}

          {/* 生成的图片 */}
          {images.length > 0 && (
            <div className="mt-3 space-y-3">
              {images.map((url, idx) => (
                <GeneratedImage key={idx} url={url} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatOutput({ 
  history, 
  isStreaming, 
  streamingContent,
  streamingImages 
}: ChatOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, streamingContent]);

  if (history.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br 
                         from-accent-blue/20 to-accent-purple/20 
                         border border-accent-blue/30
                         flex items-center justify-center">
            <Bot className="w-10 h-10 text-accent-blue" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-surface-100 mb-1">
              开始对话
            </h3>
            <p className="text-sm text-surface-400 max-w-sm">
              选择一个模型，输入文字或上传媒体文件开始与AI对话
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      {history.map((item) => (
        <MessageBubble key={item.id} item={item} />
      ))}
      
      {isStreaming && (
        <StreamingMessage content={streamingContent} images={streamingImages} />
      )}
    </div>
  );
}


