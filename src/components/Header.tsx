import React from 'react';
import { ArrowLeft, Sun, Moon, Share, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showPublish?: boolean;
  onBack?: () => void;
  onPublish?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showPublish = false,
  onBack,
  onPublish,
}) => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const isOffline = useOfflineStatus();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white shadow-lg">
      <div className="safe-area-inset-top" />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {showBack ? (
            <>
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </>
          ) : (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          )}
        </div>

        <h1 className="flex-1 text-center text-lg font-semibold truncate px-2">
          {title}
        </h1>

        <div className="flex items-center space-x-2">
          {isOffline && (
            <div className="flex items-center space-x-1 text-yellow-300">
              <WifiOff size={16} />
              <span className="text-xs hidden sm:inline">Offline</span>
            </div>
          )}
          
          {showPublish && (
            <button
              onClick={onPublish}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
              aria-label="Publish report"
            >
              <Share size={18} />
            </button>
          )}
          
          {!showBack && !showPublish && <div className="w-10" />}
        </div>
      </div>
    </header>
  );
};