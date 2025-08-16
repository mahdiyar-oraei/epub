'use client';

import { useState } from 'react';
import { Book } from '@/types/api';
import { 
  X, 
  Settings, 
  Type, 
  Palette, 
  Sun, 
  Moon, 
  BookOpen,
  Minus,
  Plus
} from 'lucide-react';

interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif';
  theme: 'light' | 'dark' | 'sepia';
  lineHeight: number;
}

interface ReaderToolbarProps {
  book: Book;
  progress: number;
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
  onClose: () => void;
  onProgressChange: (progress: number) => void;
}

export default function ReaderToolbar({
  book,
  progress,
  settings,
  onSettingsChange,
  onClose,
  onProgressChange,
}: ReaderToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(28, settings.fontSize + delta));
    onSettingsChange({ ...settings, fontSize: newSize });
  };

  const handleFontFamilyChange = () => {
    const newFamily = settings.fontFamily === 'serif' ? 'sans-serif' : 'serif';
    onSettingsChange({ ...settings, fontFamily: newFamily });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'sepia') => {
    onSettingsChange({ ...settings, theme });
  };

  const handleLineHeightChange = (delta: number) => {
    const newHeight = Math.max(1.2, Math.min(2.5, settings.lineHeight + delta));
    onSettingsChange({ ...settings, lineHeight: newHeight });
  };

  return (
    <>
      {/* Main Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-50">
        {/* Left: Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Center: Book Info and Progress */}
        <div className="flex-1 mx-4 text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {book.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {book.author}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-2 mx-auto max-w-md">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                {progress}%
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => onProgressChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="تنظیمات"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-40 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Font Size */}
              <div>
                <h3 className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Type className="h-4 w-4" />
                  <span>اندازه فونت</span>
                </h3>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleFontSizeChange(-2)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-center">
                    {settings.fontSize}px
                  </span>
                  <button
                    onClick={() => handleFontSizeChange(2)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <h3 className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <BookOpen className="h-4 w-4" />
                  <span>نوع فونت</span>
                </h3>
                <button
                  onClick={handleFontFamilyChange}
                  className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  {settings.fontFamily === 'serif' ? 'سریف' : 'سن‌سریف'}
                </button>
              </div>

              {/* Theme */}
              <div>
                <h3 className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Palette className="h-4 w-4" />
                  <span>تم رنگی</span>
                </h3>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 p-2 rounded-lg border transition-colors ${
                      settings.theme === 'light' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Sun className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 p-2 rounded-lg border transition-colors ${
                      settings.theme === 'dark' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Moon className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleThemeChange('sepia')}
                    className={`flex-1 p-2 rounded-lg border transition-colors ${
                      settings.theme === 'sepia' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-4 h-4 mx-auto bg-yellow-600 rounded-full"></div>
                  </button>
                </div>
              </div>

              {/* Line Height */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  فاصله خطوط
                </h3>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleLineHeightChange(-0.1)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-center">
                    {settings.lineHeight.toFixed(1)}
                  </span>
                  <button
                    onClick={() => handleLineHeightChange(0.1)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: rgb(37, 99, 235);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: rgb(37, 99, 235);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
}
