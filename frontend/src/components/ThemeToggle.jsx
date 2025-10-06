import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-full transition-all duration-300 ease-in-out
        bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border
        hover:bg-gray-50 dark:hover:bg-dark-surface-hover
        shadow-sm hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-primary/50
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <FiSun 
          className={`
            absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        
        {/* Moon Icon */}
        <FiMoon 
          className={`
            absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        />
      </div>
    </button>
  );
}
