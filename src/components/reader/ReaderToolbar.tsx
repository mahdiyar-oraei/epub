'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/types/api';
import { useReaderSettings, useSettingsListener } from '@/hooks/useReaderSettings';
import { 
  X, 
  Settings, 
  Type, 
  Palette, 
  Sun, 
  Moon, 
  BookOpen,
  Minus,
  Plus,
  Bookmark,
  List,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  ArrowUp,
  ArrowDown,
  Monitor
} from 'lucide-react';

interface BookProgress {
  fraction: number;
  location: number;
  totalLocations: number;
  section: {
    index: number;
    href: string;
    label: string;
  };
  cfi: string;
}

interface ReaderToolbarProps {
  book: Book;
  progress: BookProgress;
  onClose: () => void;
  onProgressChange: (progress: number) => void;
  onTogglePanel: (panel: string) => void;
  onAddBookmark: () => void;
  onToggleToolbar: () => void;
  onMinimizeToolbar: () => void;
  onToolbarPositionChange: (position: 'top' | 'bottom' | 'floating') => void;
  minimized: boolean;
  position: 'top' | 'bottom' | 'floating';
}

export default function ReaderToolbar({
  book,
  progress,
  onClose,
  onProgressChange,
  onTogglePanel,
  onAddBookmark,
  onToggleToolbar,
  onMinimizeToolbar,
  onToolbarPositionChange,
  minimized,
  position
}: ReaderToolbarProps) {
  const { settings, updateSettings, applySettings } = useReaderSettings();
  const [showSettings, setShowSettings] = useState(false);

  // Listen for settings changes from other components
  useSettingsListener((newSettings) => {
    console.log('ReaderToolbar: Settings changed, re-rendering');
    // Force re-render when settings change
  });

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, settings.fontSize + delta));
    updateSettings({ fontSize: newSize });
  };

  const handleFontFamilyChange = () => {
    const families: ('serif' | 'sans-serif' | 'monospace' | 'far-nazanin' | 'far-roya' | 'b-zar')[] = [
      'serif',
      'sans-serif',
      'monospace',
      'far-nazanin',
      'far-roya',
      'b-zar',
    ];
    const currentIndex = families.indexOf(settings.fontFamily as typeof families[number]);
    const nextIndex = (currentIndex + 1) % families.length;
    updateSettings({ fontFamily: families[nextIndex] });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'sepia' | 'night') => {
    updateSettings({ theme });
  };

  const handleLineHeightChange = (delta: number) => {
    const newHeight = Math.max(1.2, Math.min(2.5, settings.lineHeight + delta));
    updateSettings({ lineHeight: newHeight });
  };

  const handleMarginChange = (delta: number) => {
    const newMargin = Math.max(20, Math.min(80, settings.margin + delta));
    updateSettings({ margin: newMargin });
  };

  const handleWidthChange = () => {
    const widths: ('narrow' | 'standard' | 'wide')[] = ['narrow', 'standard', 'wide'];
    const currentIndex = widths.indexOf(settings.width);
    const nextIndex = (currentIndex + 1) % widths.length;
    updateSettings({ width: widths[nextIndex] });
  };

  if (minimized) {
    return (
      <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 px-3 py-2">
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={onMinimizeToolbar}
              className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="بزرگ کردن نوار ابزار"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2">
              {Math.round(progress.fraction * 100)}%
            </div>
            
            <button
              onClick={onToggleToolbar}
              className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="مخفی کردن نوار ابزار"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  return (
    <>
      {/* Minimal Main Toolbar */}
      <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 relative z-50 ${
        position === 'bottom' ? 'border-t border-b-0' : ''
      }`}>
        
        {/* Mobile-First Design: Single Row with Essential Controls */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          
          {/* Left: Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Center: Book Title and Progress */}
          <div className="flex-1 mx-4 text-center">
            <h1 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate mb-1">
              {book.title}
            </h1>
            
            {/* Minimal Progress Bar */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={progress.fraction}
                onChange={(e) => onProgressChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[2rem]">
                {Math.round(progress.fraction * 100)}%
              </span>
            </div>
          </div>

          {/* Right: Menu Button */}
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
            aria-label="منو"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Advanced Settings Panel (Collapsible) */}
        {showAdvancedSettings && (
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="px-3 py-3 sm:px-4">
              
              {/* Quick Actions Row */}
              <div className="flex items-center justify-center space-x-3 space-x-reverse mb-3">
                <button
                  onClick={() => onTogglePanel('toc')}
                  className="flex items-center space-x-2 space-x-reverse px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="فهرست مطالب"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">فهرست</span>
                </button>

                <button
                  onClick={onAddBookmark}
                  className="flex items-center space-x-2 space-x-reverse px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="افزودن نشان"
                >
                  <Bookmark className="h-4 w-4" />
                  <span className="hidden sm:inline">نشان</span>
                </button>

                <button
                  onClick={() => onTogglePanel('settings')}
                  className="flex items-center space-x-2 space-x-reverse px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="تنظیمات کامل"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">تنظیمات</span>
                </button>
              </div>

              {/* Essential Settings Row */}
              <div className="flex items-center justify-center space-x-2 space-x-reverse flex-wrap gap-2">
                {/* Font Size */}
                <div className="flex items-center space-x-1 space-x-reverse bg-white/50 dark:bg-gray-700/50 rounded-lg p-1">
                  <button
                    onClick={() => handleFontSizeChange(-2)}
                    className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    aria-label="کاهش اندازه فونت"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium px-2 min-w-[1.5rem] text-center">
                    {settings.fontSize}
                  </span>
                  <button
                    onClick={() => handleFontSizeChange(2)}
                    className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    aria-label="افزایش اندازه فونت"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    const themes: ('light' | 'dark' | 'sepia' | 'night')[] = ['light', 'dark', 'sepia', 'night'];
                    const currentIndex = themes.indexOf(settings.theme);
                    const nextIndex = (currentIndex + 1) % themes.length;
                    handleThemeChange(themes[nextIndex]);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="تغییر تم"
                >
                  {settings.theme === 'light' && <Sun className="h-4 w-4" />}
                  {settings.theme === 'dark' && <Moon className="h-4 w-4" />}
                  {settings.theme === 'sepia' && <div className="w-4 h-4 bg-yellow-600 rounded-full" />}
                  {settings.theme === 'night' && <div className="w-4 h-4 bg-blue-900 rounded-full" />}
                </button>

                {/* Hide/Minimize Buttons */}
                <button
                  onClick={onMinimizeToolbar}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="کوچک کردن نوار ابزار"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>

                <button
                  onClick={onToggleToolbar}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="مخفی کردن نوار ابزار"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}
