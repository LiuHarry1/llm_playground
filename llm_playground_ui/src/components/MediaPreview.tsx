import { motion } from 'framer-motion';
import { X, Image, Music, Video, Download } from 'lucide-react';
import type { MediaFile } from '../types';

interface MediaPreviewProps {
  files: MediaFile[];
  onRemove?: (id: string) => void;
  readonly?: boolean;
  compact?: boolean;
}

export default function MediaPreview({ 
  files, 
  onRemove, 
  readonly = false,
  compact = false 
}: MediaPreviewProps) {
  if (files.length === 0) return null;

  const getIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.filename;
    link.click();
  };

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-3'}`}>
      {files.map((file) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`relative group rounded-lg overflow-hidden border border-surface-700/50
                      bg-surface-800/50 ${compact ? 'w-16 h-16' : 'w-24 h-24'}`}
        >
          {/* 预览内容 */}
          {file.type === 'image' && (
            <img 
              src={file.dataUrl} 
              alt={file.filename}
              className="w-full h-full object-cover"
            />
          )}
          
          {file.type === 'audio' && (
            <div className="w-full h-full flex flex-col items-center justify-center 
                           bg-gradient-to-br from-accent-green/20 to-accent-teal/20 p-2">
              <Music className="w-6 h-6 text-accent-green mb-1" />
              <span className="text-[10px] text-surface-300 text-center truncate w-full">
                {file.filename}
              </span>
            </div>
          )}
          
          {file.type === 'video' && (
            <video 
              src={file.dataUrl}
              className="w-full h-full object-cover"
              muted
            />
          )}

          {/* 悬浮信息 */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                         transition-opacity duration-200 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-white mb-1">
              {getIcon(file.type)}
            </div>
            <span className="text-[10px] text-surface-300">
              {formatSize(file.size)}
            </span>
            
            {/* 操作按钮 */}
            <div className="flex gap-1 mt-2">
              {readonly && (
                <button
                  onClick={() => handleDownload(file)}
                  className="p-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Download className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* 删除按钮 */}
          {!readonly && onRemove && (
            <button
              onClick={() => onRemove(file.id)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full 
                        bg-red-500 text-white flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity
                        hover:bg-red-600 z-10"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// 用于输出区域显示生成的图片
interface GeneratedImageProps {
  url: string;
  index?: number;
}

export function GeneratedImage({ url, index = 0 }: GeneratedImageProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-image-${index + 1}.png`;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group rounded-xl overflow-hidden border border-surface-700/50
                 bg-surface-800/50 max-w-md"
    >
      <img 
        src={url} 
        alt={`Generated image ${index + 1}`}
        className="w-full h-auto"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200 flex items-center justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-white/20 hover:bg-white/30 text-white font-medium
                    transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          下载图片
        </button>
      </div>
    </motion.div>
  );
}

// 音频播放器
interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-r from-accent-green/10 to-accent-teal/10
                border border-accent-green/20"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-accent-green/20 
                       flex items-center justify-center">
          <Music className="w-5 h-5 text-accent-green" />
        </div>
        <span className="text-sm font-medium text-surface-200">生成的音频</span>
      </div>
      <audio 
        controls 
        src={url}
        className="w-full h-10 rounded-lg"
      />
    </motion.div>
  );
}


