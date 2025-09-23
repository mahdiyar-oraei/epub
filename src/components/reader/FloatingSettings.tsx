'use client';

import { useState, useRef, useEffect } from 'react';
import { useReaderSettings } from '@/hooks/useReaderSettings';
import { 
  Settings, 
  X, 
  Sun, 
  Moon, 
  Type, 
  Minus, 
  Plus,
  Palette
} from 'lucide-react';

interface FloatingSettingsProps {
  onClose: () => void;
}

export default function FloatingSettings({ onClose }: FloatingSettingsProps) {
  const { settings, updateSettings } = useReaderSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const getFontFamilyName = (family: string) => {
    switch (family) {
      case 'serif': return 'سریف';
      case 'sans-serif': return 'سن‌سریف';
      case 'monospace': return 'مونو';
      case 'far-nazanin': return 'نستعلیق نازنین';
      case 'far-roya': return 'رویا';
      case 'b-zar': return 'بی زر';
      default: return 'سریف';
    }
  };

  const getThemeName = (theme: string) => {
    switch (theme) {
      case 'light': return 'روشن';
      case 'dark': return 'تیره';
      case 'sepia': return 'سپیا';
      case 'night': return 'شب';
      default: return 'روشن';
    }
  };

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
        aria-label="تنظیمات"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Settings Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            ref={dialogRef}
            className="absolute top-32 left-4 w-80 max-w-[90vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تنظیمات خواندن
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="بستن"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Settings Content */}
            <div className="space-y-6">
              
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  اندازه فونت
                </label>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleFontSizeChange(-2)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="کاهش اندازه فونت"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <div className="flex-1 text-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {settings.fontSize}px
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleFontSizeChange(2)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="افزایش اندازه فونت"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  نوع فونت
                </label>
                <button
                  onClick={handleFontFamilyChange}
                  className="w-full flex items-center justify-between p-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Type className="h-4 w-4" />
                    <span>{getFontFamilyName(settings.fontFamily)}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">تغییر</span>
                </button>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  تم
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'light', name: 'روشن', icon: Sun, color: 'bg-yellow-400' },
                    { key: 'dark', name: 'تیره', icon: Moon, color: 'bg-gray-600' },
                    { key: 'sepia', name: 'سپیا', icon: Palette, color: 'bg-yellow-600' },
                    { key: 'night', name: 'شب', icon: Moon, color: 'bg-blue-900' }
                  ].map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => handleThemeChange(theme.key as any)}
                      className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border transition-all duration-200 ${
                        settings.theme === theme.key
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <theme.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Reader Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 space-x-reverse p-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="font-medium">بستن کتاب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
