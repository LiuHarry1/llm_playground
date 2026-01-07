import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Image, 
  Mic, 
  Eye, 
  ChevronDown, 
  Check,
  Sparkles,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { ModelInfo, CategorizedModels, ModelCapabilities } from '../types';
import { getModelCapabilities } from '../types';
import { fetchModels } from '../services/api';

interface ModelSelectorProps {
  selectedModel: ModelInfo | null;
  onModelChange: (model: ModelInfo, capabilities: ModelCapabilities) => void;
}

type CategoryKey = 'text' | 'vision' | 'image_generation' | 'audio';

const CATEGORY_INFO: Record<CategoryKey, { 
  label: string; 
  icon: React.ReactNode; 
  color: string;
  bgColor: string;
}> = {
  text: { 
    label: 'Text Chat', 
    icon: <Cpu className="w-4 h-4" />, 
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/10',
  },
  vision: { 
    label: 'Vision', 
    icon: <Eye className="w-4 h-4" />, 
    color: 'text-accent-purple',
    bgColor: 'bg-accent-purple/10',
  },
  image_generation: { 
    label: 'Image Generation', 
    icon: <Image className="w-4 h-4" />, 
    color: 'text-accent-orange',
    bgColor: 'bg-accent-orange/10',
  },
  audio: { 
    label: 'Audio', 
    icon: <Mic className="w-4 h-4" />, 
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
  },
};

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<CategorizedModels | null>(null);
  const [allModels, setAllModels] = useState<ModelInfo[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('text');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchModels();
      setModels(data.categorized);
      setAllModels(data.all);
      
      // 如果没有选中模型，默认选择第一个文本模型
      if (!selectedModel && data.categorized.text.length > 0) {
        const defaultModel = data.categorized.text[0];
        onModelChange(defaultModel, getModelCapabilities(defaultModel));
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setError('Failed to load model list, please refresh the page and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectModel = (model: ModelInfo) => {
    const capabilities = getModelCapabilities(model);
    onModelChange(model, capabilities);
    setIsOpen(false);
    setSearchQuery('');
  };

  // 搜索过滤
  const getFilteredModels = (): ModelInfo[] => {
    if (!searchQuery.trim()) {
      return models?.[activeCategory] || [];
    }
    
    const query = searchQuery.toLowerCase();
    return allModels.filter(model => 
      model.id.toLowerCase().includes(query) ||
      model.name.toLowerCase().includes(query) ||
      (model.description?.toLowerCase().includes(query))
    ).slice(0, 30);
  };

  const filteredModels = getFilteredModels();

  return (
    <div className="relative">
      {/* 选择按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 
                   bg-surface-800/50 border rounded-xl
                   hover:border-accent-blue/50 transition-all duration-300
                   focus:outline-none focus:ring-2 focus:ring-accent-blue/30
                   ${error ? 'border-red-500/50' : 'border-surface-700/50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                          ${error ? 'bg-red-500/20' : 'bg-gradient-to-br from-accent-blue to-accent-purple'}`}>
            <Sparkles className={`w-4 h-4 ${error ? 'text-red-400' : 'text-white'}`} />
          </div>
          <div className="text-left min-w-0">
            <div className={`text-sm font-medium truncate ${error ? 'text-red-400' : 'text-surface-100'}`}>
              {isLoading ? 'Loading...' : error ? 'Load Failed' : (selectedModel?.name || 'Select Model')}
            </div>
            <div className={`text-xs truncate max-w-[180px] ${error ? 'text-red-400/80' : 'text-surface-400'}`}>
              {error || selectedModel?.description?.slice(0, 40) || 'Click to select an AI model'}
              {selectedModel?.description && selectedModel.description.length > 40 ? '...' : ''}
            </div>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-surface-400 transition-transform duration-300 flex-shrink-0
                      ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 
                       bg-surface-900 border border-surface-700/50 rounded-xl 
                       overflow-hidden"
          >
            {/* 搜索框 */}
            <div className="p-2 border-b border-surface-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models..."
                  className="w-full pl-9 pr-3 py-2 input-field
                            rounded-lg text-sm text-surface-100 placeholder-surface-500
                            focus:outline-none focus:border-accent-blue/50"
                />
              </div>
            </div>

            {/* 分类标签 - 搜索时隐藏 */}
            {!searchQuery && (
              <div className="flex border-b border-surface-700/50 p-1 gap-1 bg-surface-800/30">
                {(Object.keys(CATEGORY_INFO) as CategoryKey[]).map((category) => {
                  const info = CATEGORY_INFO[category];
                  const isActive = activeCategory === category;
                  const count = models?.[category]?.length || 0;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 
                                 rounded-lg text-xs font-medium transition-all duration-200
                                 ${isActive 
                                   ? `${info.bgColor} ${info.color}` 
                                   : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
                                 }`}
                      title={info.label}
                    >
                      {info.icon}
                      <span className="text-[10px] opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 模型列表 */}
            <div className="max-h-72 overflow-y-auto p-2">
              {error ? (
                <div className="flex flex-col items-center justify-center py-8 text-red-400">
                  <AlertCircle className="w-8 h-8 mb-2" />
                    <div className="text-sm mb-3">{error}</div>
                  <button
                    onClick={loadModels}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg
                             hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-8 text-surface-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading model list...
                </div>
              ) : filteredModels.length > 0 ? (
                filteredModels.map((model) => {
                  const isSelected = model.id === selectedModel?.id;
                  const capabilities = getModelCapabilities(model);
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      whileHover={{ x: 4 }}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg
                                 transition-colors duration-200 text-left
                                 ${isSelected 
                                   ? 'bg-accent-blue/20 text-accent-blue' 
                                   : 'hover:bg-surface-700/50 text-surface-200'
                                 }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5
                                      ${isSelected 
                                        ? 'bg-accent-blue text-white' 
                                        : 'bg-surface-700 text-surface-400'
                                      }`}>
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : CATEGORY_INFO[activeCategory].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{model.name}</div>
                        <div className="text-xs text-surface-400 truncate">{model.description?.slice(0, 60)}</div>
                        {/* 能力标签 */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {capabilities.inputTypes.map(type => (
                            <span key={`in-${type}`} className="px-1.5 py-0.5 text-[10px] rounded bg-surface-700/50 text-surface-400">
                              ↓{type}
                            </span>
                          ))}
                          {capabilities.outputTypes.map(type => (
                            <span key={`out-${type}`} className="px-1.5 py-0.5 text-[10px] rounded bg-accent-blue/20 text-accent-cyan">
                              ↑{type}
                            </span>
                          ))}
                          {model.context_length && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface-700/50 text-surface-500">
                              {Math.round(model.context_length / 1000)}K ctx
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-surface-400 text-sm">
                  {searchQuery ? 'No matching models found' : 'No available models'}
                </div>
              )}
            </div>

            {/* 底部统计 */}
            {!isLoading && (
              <div className="px-3 py-2 border-t border-surface-700/30 text-xs text-surface-500 text-center">
                {allModels.length} available models
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
}
