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
    const families: ('serif' | 'sans-serif' | 'monospace')[] = ['serif', 'sans-serif', 'monospace'];
    const currentIndex = families.indexOf(settings.fontFamily);
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
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={onMinimizeToolbar}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="بزرگ کردن نوار ابزار"
            >
              <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {Math.round(progress.fraction * 100)}%
            </div>
            
            <button
              onClick={onToggleToolbar}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="مخفی کردن نوار ابزار"
            >
              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Toolbar */}
      <div className={`flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-50 ${
        position === 'bottom' ? 'border-t border-b-0' : ''
      }`}>
        {/* Top Row: Close, Navigation, and Essential Controls */}
        <div className="flex items-center justify-between w-full sm:w-auto mb-3 sm:mb-0">
          {/* Left: Close and Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="بستن"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="w-px h-5 sm:h-6 bg-gray-300 dark:bg-gray-600"></div>

            <button
              onClick={() => onTogglePanel('toc')}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="فهرست مطالب"
            >
              <List className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={onAddBookmark}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="افزودن نشان"
            >
              <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Right: Essential Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
            <button
              onClick={() => onTogglePanel('settings')}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="تنظیمات"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={onMinimizeToolbar}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="کوچک کردن نوار ابزار"
            >
              <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={onToggleToolbar}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="مخفی کردن نوار ابزار"
            >
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Center: Book Info and Progress */}
        <div className="flex-1 mx-2 sm:mx-6 text-center mb-3 sm:mb-0">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {book.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
            {book.author}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-2 mx-auto max-w-xs sm:max-w-md">
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={progress.fraction}
                onChange={(e) => onProgressChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium min-w-[2.5rem] sm:min-w-[3rem]">
                {Math.round(progress.fraction * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Settings Controls */}
        <div className="flex items-center justify-center w-full sm:w-auto space-x-2 sm:space-x-3 space-x-reverse">
          {/* Quick Settings */}
          <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse flex-wrap justify-center">
            {/* Font Size */}
            <div className="flex items-center space-x-1 space-x-reverse bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => handleFontSizeChange(-2)}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="کاهش اندازه فونت"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium px-1.5 sm:px-2 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                {settings.fontSize}
              </span>
              <button
                onClick={() => handleFontSizeChange(2)}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="افزایش اندازه فونت"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Font Family */}
            <button
              onClick={handleFontFamilyChange}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="تغییر نوع فونت"
              title={`فونت فعلی: ${settings.fontFamily === 'serif' ? 'سریف' : settings.fontFamily === 'sans-serif' ? 'سن‌سریف' : 'مونو'}`}
            >
              <Type className="h-4 w-4" />
            </button>

            {/* Theme */}
            <div className="relative">
              <button
                onClick={() => {
                  const themes: ('light' | 'dark' | 'sepia' | 'night')[] = ['light', 'dark', 'sepia', 'night'];
                  const currentIndex = themes.indexOf(settings.theme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  handleThemeChange(themes[nextIndex]);
                }}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="تغییر تم"
                title={`تم فعلی: ${settings.theme === 'light' ? 'روشن' : settings.theme === 'dark' ? 'تیره' : settings.theme === 'sepia' ? 'سپیا' : 'شب'}`}
              >
                {settings.theme === 'light' && <Sun className="h-4 w-4" />}
                {settings.theme === 'dark' && <Moon className="h-4 w-4" />}
                {settings.theme === 'sepia' && <div className="w-4 h-4 bg-yellow-600 rounded-full" />}
                {settings.theme === 'night' && <div className="w-4 h-4 bg-blue-900 rounded-full" />}
              </button>
            </div>

            {/* Line Height */}
            <div className="flex items-center space-x-1 space-x-reverse bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => handleLineHeightChange(-0.1)}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="کاهش فاصله خطوط"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium px-1.5 sm:px-2 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                {settings.lineHeight.toFixed(1)}
              </span>
              <button
                onClick={() => handleLineHeightChange(0.1)}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="افزایش فاصله خطوط"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Margin */}
            <div className="flex items-center space-x-1 space-x-reverse bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => handleMarginChange(-10)}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="کاهش حاشیه"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium px-1.5 sm:px-2 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                {settings.margin}
              </span>
              <button
                onClick={() => handleMarginChange(10)}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="افزایش حاشیه"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Width */}
            <button
              onClick={handleWidthChange}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="تغییر عرض صفحه"
            >
              <Monitor className="h-4 w-4" />
            </button>

            {/* Toolbar Position */}
            <div className="relative">
              <button
                onClick={() => {
                  const positions: ('top' | 'bottom' | 'floating')[] = ['top', 'bottom', 'floating'];
                  const currentIndex = positions.indexOf(position);
                  const nextIndex = (currentIndex + 1) % positions.length;
                  onToolbarPositionChange(positions[nextIndex]);
                }}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="تغییر موقعیت نوار ابزار"
                title={`موقعیت فعلی: ${position === 'top' ? 'بالا' : position === 'bottom' ? 'پایین' : 'شناور'}`}
              >
                {position === 'top' && <ArrowUp className="h-4 w-4" />}
                {position === 'bottom' && <ArrowDown className="h-4 w-4" />}
                {position === 'floating' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
              </button>
            </div>

            {/* Debug Info - Remove in production */}
            <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 ml-2">
              <span className="font-medium">Debug:</span> {settings.fontSize}px | {settings.theme}
            </div>
          </div>
        </div>
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
