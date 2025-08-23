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
  Plus,
  Bookmark,
  List,
  Search,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  ArrowUp,
  ArrowDown,
  Monitor
} from 'lucide-react';

interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  theme: 'light' | 'dark' | 'sepia' | 'night';
  lineHeight: number;
  margin: number;
  width: 'narrow' | 'standard' | 'wide';
  justify: boolean;
  hyphenation: boolean;
}

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
  settings: ReaderSettings;
  onSettingsChange: (settings: Partial<ReaderSettings>) => void;
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
  settings,
  onSettingsChange,
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
  const [showSettings, setShowSettings] = useState(false);

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, settings.fontSize + delta));
    onSettingsChange({ fontSize: newSize });
  };

  const handleFontFamilyChange = () => {
    const families: ('serif' | 'sans-serif' | 'monospace')[] = ['serif', 'sans-serif', 'monospace'];
    const currentIndex = families.indexOf(settings.fontFamily);
    const nextIndex = (currentIndex + 1) % families.length;
    onSettingsChange({ fontFamily: families[nextIndex] });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'sepia' | 'night') => {
    onSettingsChange({ theme });
  };

  const handleLineHeightChange = (delta: number) => {
    const newHeight = Math.max(1.2, Math.min(2.5, settings.lineHeight + delta));
    onSettingsChange({ lineHeight: newHeight });
  };

  const handleMarginChange = (delta: number) => {
    const newMargin = Math.max(20, Math.min(80, settings.margin + delta));
    onSettingsChange({ margin: newMargin });
  };

  const handleWidthChange = () => {
    const widths: ('narrow' | 'standard' | 'wide')[] = ['narrow', 'standard', 'wide'];
    const currentIndex = widths.indexOf(settings.width);
    const nextIndex = (currentIndex + 1) % widths.length;
    onSettingsChange({ width: widths[nextIndex] });
  };

  if (minimized) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={onMinimizeToolbar}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="بزرگ کردن نوار ابزار"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {Math.round(progress.fraction * 100)}%
            </div>
            
            <button
              onClick={onToggleToolbar}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="مخفی کردن نوار ابزار"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Toolbar */}
      <div className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-50 ${
        position === 'bottom' ? 'border-t border-b-0' : ''
      }`}>
        {/* Left: Close and Navigation */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <button
            onClick={() => onTogglePanel('toc')}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="فهرست مطالب"
          >
            <List className="h-5 w-5" />
          </button>

          <button
            onClick={() => onTogglePanel('search')}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="جستجو"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={onAddBookmark}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="افزودن نشان"
          >
            <Bookmark className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Book Info and Progress */}
        <div className="flex-1 mx-6 text-center">
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
                {Math.round(progress.fraction * 100)}%
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(progress.fraction * 100)}
                  onChange={(e) => onProgressChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">
                {progress.location + 1} / {progress.totalLocations}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2 space-x-reverse">
          {/* Toolbar Position */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['top', 'bottom', 'floating'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => onToolbarPositionChange(pos)}
                className={`p-2 rounded-md text-xs transition-colors ${
                  position === pos
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-label={`نوار ابزار ${pos === 'top' ? 'بالا' : pos === 'bottom' ? 'پایین' : 'شناور'}`}
              >
                {pos === 'top' && <ArrowUp className="h-3 w-3" />}
                {pos === 'bottom' && <ArrowDown className="h-3 w-3" />}
                {pos === 'floating' && <Monitor className="h-3 w-3" />}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Minimize */}
          <button
            onClick={onMinimizeToolbar}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="کوچک کردن نوار ابزار"
          >
            <Minimize2 className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="تنظیمات"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Hide Toolbar */}
          <button
            onClick={onToggleToolbar}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="مخفی کردن نوار ابزار"
          >
            <EyeOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-40 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              
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
                  {settings.fontFamily === 'serif' ? 'سریف' : 
                   settings.fontFamily === 'sans-serif' ? 'سن‌سریف' : 'مونو'}
                </button>
              </div>

              {/* Theme */}
              <div>
                <h3 className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Palette className="h-4 w-4" />
                  <span>تم رنگی</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['light', 'dark', 'sepia', 'night'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`p-2 rounded-lg border transition-colors text-xs ${
                        settings.theme === theme 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {theme === 'light' && <Sun className="h-3 w-3 mx-auto mb-1" />}
                      {theme === 'dark' && <Moon className="h-3 w-3 mx-auto mb-1" />}
                      {theme === 'sepia' && <div className="w-3 h-3 bg-yellow-600 rounded-full mx-auto mb-1" />}
                      {theme === 'night' && <div className="w-3 h-3 bg-blue-900 rounded-full mx-auto mb-1" />}
                      <span>
                        {theme === 'light' ? 'روشن' : 
                         theme === 'dark' ? 'تیره' : 
                         theme === 'sepia' ? 'سپیا' : 'شب'}
                      </span>
                    </button>
                  ))}
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

              {/* Margins */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  حاشیه
                </h3>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleMarginChange(-10)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-center">
                    {settings.margin}px
                  </span>
                  <button
                    onClick={() => handleMarginChange(10)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Page Width */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  عرض صفحه
                </h3>
                <button
                  onClick={handleWidthChange}
                  className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  {settings.width === 'narrow' ? 'باریک' : 
                   settings.width === 'standard' ? 'استاندارد' : 'عریض'}
                </button>
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
