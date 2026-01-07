import { motion } from 'framer-motion';
import { Settings, Info } from 'lucide-react';
import type { HyperParams as HyperParamsType } from '../types';

interface HyperParamsProps {
  params: HyperParamsType;
  onChange: (params: HyperParamsType) => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  tooltip: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

function Slider({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  tooltip, 
  onChange,
  formatValue = (v) => v.toString()
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-surface-200">{label}</span>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-surface-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                           bg-surface-800 border border-surface-700 rounded-lg text-xs text-surface-300
                           opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                           whitespace-nowrap z-50 shadow-lg">
              {tooltip}
            </div>
          </div>
        </div>
        <span className="text-sm font-mono text-accent-cyan">{formatValue(value)}</span>
      </div>
      <div className="relative h-2 bg-surface-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.1 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* 滑块指示器 */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full 
                    shadow-lg border-2 border-accent-blue pointer-events-none"
          initial={false}
          animate={{ left: `calc(${percentage}% - 8px)` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}

export default function HyperParams({ params, onChange }: HyperParamsProps) {
  const updateParam = <K extends keyof HyperParamsType>(key: K, value: HyperParamsType[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 p-4 bg-surface-800/30 rounded-xl border border-surface-700/30"
    >
      <div className="flex items-center gap-2 text-surface-300 mb-4">
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium">Hyper Parameters</span>
      </div>

      <div className="space-y-5">
        <Slider
          label="Temperature"
          value={params.temperature}
          min={0}
          max={2}
          step={0.1}
          tooltip="Controls the randomness of output, higher values are more random"
          onChange={(v) => updateParam('temperature', v)}
        />

        <Slider
          label="Max Tokens"
          value={params.max_tokens}
          min={256}
          max={16384}
          step={256}
          tooltip="Maximum length of generated content"
          onChange={(v) => updateParam('max_tokens', v)}
          formatValue={(v) => v.toLocaleString()}
        />

        <Slider
          label="Top P"
          value={params.top_p}
          min={0}
          max={1}
          step={0.05}
          tooltip="Nucleus sampling parameter, controls vocabulary selection range"
          onChange={(v) => updateParam('top_p', v)}
        />

        <Slider
          label="Frequency Penalty"
          value={params.frequency_penalty}
          min={0}
          max={2}
          step={0.1}
          tooltip="Reduces the frequency of repeated words"
          onChange={(v) => updateParam('frequency_penalty', v)}
        />

        <Slider
          label="Presence Penalty"
          value={params.presence_penalty}
          min={0}
          max={2}
          step={0.1}
          tooltip="Encourages the model to discuss new topics"
          onChange={(v) => updateParam('presence_penalty', v)}
        />
      </div>
    </motion.div>
  );
}


