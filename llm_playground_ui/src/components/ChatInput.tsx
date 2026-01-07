import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image, 
  Mic, 
  Video, 
  Paperclip, 
  X,
  Loader2,
  AlertCircle 
} from 'lucide-react';
import type { MediaFile, ModelCapabilities, InputType } from '../types';
import { uploadFile } from '../services/api';
import MediaPreview from './MediaPreview';

interface ChatInputProps {
  onSend: (text: string, mediaFiles: MediaFile[]) => void;
  capabilities: ModelCapabilities;
  isLoading: boolean;
  disabled?: boolean;
}

// 文件大小限制 (MB)
const FILE_SIZE_LIMITS: Record<string, number> = {
  image: 10,
  audio: 20,
  video: 50,
};

// 支持的文件类型
const ACCEPTED_TYPES: Record<InputType, string> = {
  text: '',
  image: 'image/png,image/jpeg,image/gif,image/webp',
  audio: 'audio/wav,audio/mp3,audio/mpeg,audio/m4a',
  video: 'video/mp4,video/webm',
};

export default function ChatInput({ 
  onSend, 
  capabilities, 
  isLoading,
  disabled = false 
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取可用的输入类型
  const availableInputTypes = capabilities.inputTypes.filter(t => t !== 'text');

  // 处理文件选择
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadError(null);
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // 检查文件类型
        const fileType = file.type.split('/')[0] as 'image' | 'audio' | 'video';
        if (!capabilities.inputTypes.includes(fileType)) {
          setUploadError(`Current model does not support ${fileType} input`);
          continue;
        }

        // 检查文件大小
        const sizeMB = file.size / (1024 * 1024);
        const limit = FILE_SIZE_LIMITS[fileType] || 10;
        if (sizeMB > limit) {
          setUploadError(`${file.name} exceeds size limit (${limit}MB)`);
          continue;
        }

        // 上传文件
        const result = await uploadFile(file);
        
        const mediaFile: MediaFile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: result.file_type as 'image' | 'audio' | 'video',
          dataUrl: result.data_url,
          filename: result.filename,
          size: result.size,
        };

        setMediaFiles(prev => [...prev, mediaFile]);
      }
    } catch (error) {
      setUploadError('File upload failed, please try again');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [capabilities.inputTypes]);

  // 处理拖放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // 处理发送
  const handleSend = () => {
    if ((!text.trim() && mediaFiles.length === 0) || isLoading || disabled) return;
    onSend(text.trim(), mediaFiles);
    setText('');
    setMediaFiles([]);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Shift + Enter: 换行
      if (e.shiftKey) {
        return; // 允许默认行为（换行）
      }
      // Ctrl/Cmd + Enter 或单独 Enter: 发送消息
      e.preventDefault();
      handleSend();
    }
  };

  // 移除媒体文件
  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => prev.filter(f => f.id !== id));
  };

  // 获取接受的文件类型
  const getAcceptedTypes = (): string => {
    return availableInputTypes
      .map(type => ACCEPTED_TYPES[type])
      .filter(Boolean)
      .join(',');
  };

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  return (
    <div 
      className="relative"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* 错误提示 */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-0 right-0 flex items-center gap-2 
                      px-4 py-2 bg-red-500/20 border border-red-500/30 
                      rounded-lg text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
            <button 
              onClick={() => setUploadError(null)}
              className="ml-auto hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主输入区域 */}
      <div className="input-field rounded-2xl
                     border border-transparent
                     focus-within:border-transparent transition-all duration-300
                     shadow-lg shadow-black/20">
        {/* 媒体预览 */}
        {mediaFiles.length > 0 && (
          <div className="p-3 border-b border-surface-700/10 dark:border-surface-700/10">
            <MediaPreview 
              files={mediaFiles} 
              onRemove={removeMediaFile}
              compact
            />
          </div>
        )}

        {/* 文本输入 */}
        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter message... (Enter to send, Shift + Enter for new line)"
            disabled={disabled || isLoading}
            className="flex-1 bg-transparent text-surface-100 placeholder-surface-500
                      resize-none outline-none min-h-[44px] max-h-[200px]
                      text-sm leading-relaxed"
            rows={1}
          />

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            {/* 上传按钮 */}
            {availableInputTypes.length > 0 && (
              <div className="relative group">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || disabled}
                  className="p-2 rounded-lg text-surface-400 hover:text-surface-200
                            hover:bg-surface-700/50 transition-colors duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </button>
                
                {/* 支持的类型提示 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                               px-3 py-2 bg-surface-800 border border-surface-700 
                               rounded-lg text-xs text-surface-300 whitespace-nowrap
                               opacity-0 group-hover:opacity-100 transition-opacity
                               pointer-events-none z-50">
                  Supports: {availableInputTypes.map(t => {
                    switch(t) {
                      case 'image': return 'Image';
                      case 'audio': return 'Audio';
                      case 'video': return 'Video';
                      default: return t;
                    }
                  }).join(', ')}
                </div>
              </div>
            )}

            {/* 快捷上传按钮 */}
            {capabilities.inputTypes.includes('image') && (
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = ACCEPTED_TYPES.image;
                    fileInputRef.current.click();
                  }
                }}
                disabled={isUploading || disabled}
                className="p-2 rounded-lg text-surface-400 hover:text-accent-orange
                          hover:bg-accent-orange/10 transition-colors duration-200
                          disabled:opacity-50"
              >
                <Image className="w-5 h-5" />
              </button>
            )}

            {capabilities.inputTypes.includes('audio') && (
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = ACCEPTED_TYPES.audio;
                    fileInputRef.current.click();
                  }
                }}
                disabled={isUploading || disabled}
                className="p-2 rounded-lg text-surface-400 hover:text-accent-green
                          hover:bg-accent-green/10 transition-colors duration-200
                          disabled:opacity-50"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            {capabilities.inputTypes.includes('video') && (
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = ACCEPTED_TYPES.video;
                    fileInputRef.current.click();
                  }
                }}
                disabled={isUploading || disabled}
                className="p-2 rounded-lg text-surface-400 hover:text-accent-purple
                          hover:bg-accent-purple/10 transition-colors duration-200
                          disabled:opacity-50"
              >
                <Video className="w-5 h-5" />
              </button>
            )}

            {/* 发送按钮 */}
            <button
              onClick={handleSend}
              disabled={(!text.trim() && mediaFiles.length === 0) || isLoading || disabled}
              className="p-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple
                        text-white hover:opacity-90 transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-lg shadow-accent-blue/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
}


