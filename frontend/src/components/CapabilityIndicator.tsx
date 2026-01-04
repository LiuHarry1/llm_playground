import { motion } from 'framer-motion';
import { 
  Type, 
  Image, 
  Mic, 
  Video, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import type { ModelCapabilities, InputType, OutputType } from '../types';

interface CapabilityIndicatorProps {
  capabilities: ModelCapabilities;
  modelName?: string;
}

const INPUT_ICONS: Record<InputType, { icon: React.ReactNode; label: string; color: string }> = {
  text: { 
    icon: <Type className="w-4 h-4" />, 
    label: '文本', 
    color: 'text-accent-blue bg-accent-blue/10 border-accent-blue/30' 
  },
  image: { 
    icon: <Image className="w-4 h-4" />, 
    label: '图片', 
    color: 'text-accent-orange bg-accent-orange/10 border-accent-orange/30' 
  },
  audio: { 
    icon: <Mic className="w-4 h-4" />, 
    label: '音频', 
    color: 'text-accent-green bg-accent-green/10 border-accent-green/30' 
  },
  video: { 
    icon: <Video className="w-4 h-4" />, 
    label: '视频', 
    color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/30' 
  },
};

const OUTPUT_ICONS: Record<OutputType, { icon: React.ReactNode; label: string; color: string }> = {
  text: { 
    icon: <Type className="w-4 h-4" />, 
    label: '文本', 
    color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30' 
  },
  image: { 
    icon: <Image className="w-4 h-4" />, 
    label: '图片', 
    color: 'text-accent-yellow bg-accent-yellow/10 border-accent-yellow/30' 
  },
  audio: { 
    icon: <Mic className="w-4 h-4" />, 
    label: '音频', 
    color: 'text-accent-teal bg-accent-teal/10 border-accent-teal/30' 
  },
};

export default function CapabilityIndicator({ capabilities, modelName }: CapabilityIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-surface-800/30 rounded-xl border border-surface-700/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent-yellow" />
        <span className="text-sm font-medium text-surface-200">
          {modelName ? `${modelName} 能力` : '模型能力'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* 输入能力 */}
        <div className="flex-1">
          <div className="text-xs text-surface-500 mb-2">支持输入</div>
          <div className="flex flex-wrap gap-2">
            {capabilities.inputTypes.map((type) => {
              const info = INPUT_ICONS[type];
              return (
                <motion.div
                  key={type}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
                             border ${info.color} text-xs font-medium`}
                >
                  {info.icon}
                  <span>{info.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 箭头 */}
        <div className="flex-shrink-0">
          <ArrowRight className="w-5 h-5 text-surface-500" />
        </div>

        {/* 输出能力 */}
        <div className="flex-1">
          <div className="text-xs text-surface-500 mb-2">支持输出</div>
          <div className="flex flex-wrap gap-2">
            {capabilities.outputTypes.map((type) => {
              const info = OUTPUT_ICONS[type];
              return (
                <motion.div
                  key={type}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
                             border ${info.color} text-xs font-medium`}
                >
                  {info.icon}
                  <span>{info.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


