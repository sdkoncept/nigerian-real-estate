import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="Light theme"
        aria-label="Light theme"
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="Dark theme"
        aria-label="Dark theme"
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="System theme"
        aria-label="System theme"
      >
        💻
      </button>
    </div>
  );
}

