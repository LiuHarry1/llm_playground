import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, Sparkles } from 'lucide-react';

interface SystemPromptProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESET_PROMPTS = [
  {
    name: 'General Assistant',
    prompt: 'You are a helpful AI assistant that can clearly and accurately answer user questions.',
  },
  {
    name: 'Code Expert',
    prompt: 'You are a professional programming assistant proficient in multiple programming languages. Please provide clear and efficient code solutions and explain key concepts.',
  },
  {
    name: 'Creative Writing',
    prompt: 'You are a creative writing assistant skilled at generating engaging stories, poetry, and creative content. Please respond with vivid language and rich imagination.',
  },
  {
    name: 'Image Description',
    prompt: 'You are a professional image analysis assistant. Please carefully observe the images provided by users and provide detailed and accurate descriptions and analysis.',
  },
  {
    name: 'Translation Expert',
    prompt: 'You are a professional multilingual translation assistant. Please accurately translate the content provided by users while maintaining the tone and style of the original text.',
  },
];

export default function SystemPrompt({ value, onChange }: SystemPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="space-y-2">
      {/* 标题栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3
                  bg-surface-800/50 border border-surface-700/50 rounded-xl
                  hover:border-accent-purple/50 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-magenta
                         flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-surface-100">System Prompt</div>
            <div className="text-xs text-surface-400">
              {value ? `${value.slice(0, 30)}...` : 'Define the role and behavior of the AI assistant'}
            </div>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-surface-400 transition-transform duration-300 
                     ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 展开内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-surface-800/30 rounded-xl border border-surface-700/30 space-y-3">
              {/* 预设选择 */}
              <div className="relative">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium
                            text-accent-purple hover:text-accent-purple/80 
                            bg-accent-purple/10 hover:bg-accent-purple/20
                            rounded-lg transition-colors duration-200"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Select Preset
                </button>

                <AnimatePresence>
                  {showPresets && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-64 p-2
                                bg-surface-900 border border-surface-700/50 rounded-xl
                                z-50"
                    >
                      {PRESET_PROMPTS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            onChange(preset.prompt);
                            setShowPresets(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg
                                    text-sm text-surface-200 hover:bg-surface-700/50
                                    transition-colors duration-200"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 文本输入 */}
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter system prompt to define the role, behavior, and constraints of the AI assistant..."
                className="w-full h-32 px-4 py-3 input-field
                          rounded-xl text-sm text-surface-100 placeholder-surface-500
                          focus:outline-none focus:border-accent-purple/50
                          resize-none transition-colors duration-200"
              />

              {/* 字数统计 */}
              <div className="text-right text-xs text-surface-500">
                {value.length} characters
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭预设菜单 */}
      {showPresets && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPresets(false)}
        />
      )}
    </div>
  );
}


