import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full p-1 transition-colors duration-300
                 dark:bg-surface-700/50 dark:border-accent-blue/30 dark:hover:border-accent-blue/50
                 light:bg-gray-300 light:border-gray-600 light:hover:border-sky-600
                 border-2 shadow-lg"
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* 滑动按钮 */}
      <motion.div
        className="w-5 h-5 rounded-full flex items-center justify-center
                   bg-gradient-to-br shadow-lg
                   dark:from-accent-purple dark:to-accent-blue dark:shadow-accent-purple/30
                   light:from-amber-400 light:to-orange-400 light:shadow-amber-300/50"
        animate={{
          x: isDark ? 0 : 26,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-blue-700" style={{ color: 'rgba(11, 8, 217, 1)' }} />
        )}
      </motion.div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        {/* 深色模式星星 */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-1.5 right-3 w-0.5 h-0.5 bg-white/60 rounded-full" />
          <div className="absolute top-3 right-4 w-1 h-1 bg-white/40 rounded-full" />
          <div className="absolute bottom-2 right-2.5 w-0.5 h-0.5 bg-white/50 rounded-full" />
        </motion.div>

        {/* 浅色模式云朵装饰 */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-1.5 left-2 w-2 h-1 bg-white/70 rounded-full" />
          <div className="absolute bottom-2 left-3 w-1.5 h-0.5 bg-white/50 rounded-full" />
        </motion.div>
      </div>
    </motion.button>
  );
}

