'use client';

import { useState } from 'react';
import { X, Type, Palette, Sun, Moon, BookOpen, Minus, Plus, Monitor, Smartphone, Tablet } from 'lucide-react';

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

interface SettingsPanelProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: Partial<ReaderSettings>) => void;
  onClose: () => void;
}

export default function SettingsPanel({
  settings,
  onSettingsChange,
  onClose
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'layout' | 'advanced'>('appearance');

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, settings.fontSize + delta));
    onSettingsChange({ fontSize: newSize });
  };

  const handleLineHeightChange = (delta: number) => {
    const newHeight = Math.max(1.2, Math.min(2.5, settings.lineHeight + delta));
    onSettingsChange({ lineHeight: newHeight });
  };

  const handleMarginChange = (delta: number) => {
    const newMargin = Math.max(20, Math.min(80, settings.margin + delta));
    onSettingsChange({ margin: newMargin });
  };

  const tabs = [
    { id: 'appearance', label: 'ظاهر', icon: Palette },
    { id: 'layout', label: 'چیدمان', icon: Monitor },
    { id: 'advanced', label: 'پیشرفته', icon: BookOpen },
  ] as const;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Palette className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">تنظیمات</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse p-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'appearance' && (
          <div className="space-y-6">
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
              <div className="grid grid-cols-3 gap-2">
                {(['serif', 'sans-serif', 'monospace'] as const).map((family) => (
                  <button
                    key={family}
                    onClick={() => onSettingsChange({ fontFamily: family })}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      settings.fontFamily === family
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {family === 'serif' ? 'سریف' : family === 'sans-serif' ? 'سن‌سریف' : 'مونو'}
                  </button>
                ))}
              </div>
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
                    onClick={() => onSettingsChange({ theme })}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 space-x-reverse ${
                      settings.theme === theme
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {theme === 'light' && <Sun className="h-4 w-4" />}
                    {theme === 'dark' && <Moon className="h-4 w-4" />}
                    {theme === 'sepia' && <div className="w-4 h-4 bg-yellow-600 rounded-full" />}
                    {theme === 'night' && <div className="w-4 h-4 bg-blue-900 rounded-full" />}
                    <span className="text-sm">
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
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-6">
            {/* Page Width */}
            <div>
              <h3 className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Monitor className="h-4 w-4" />
                <span>عرض صفحه</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['narrow', 'standard', 'wide'] as const).map((width) => (
                  <button
                    key={width}
                    onClick={() => onSettingsChange({ width })}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      settings.width === width
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {width === 'narrow' ? 'باریک' : width === 'standard' ? 'استاندارد' : 'عریض'}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                حاشیه صفحه
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

            {/* Text Alignment */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                تراز متن
              </h3>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => onSettingsChange({ justify: true })}
                  className={`flex-1 p-3 text-sm rounded-lg border transition-colors ${
                    settings.justify
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  تراز کامل
                </button>
                <button
                  onClick={() => onSettingsChange({ justify: false })}
                  className={`flex-1 p-3 text-sm rounded-lg border transition-colors ${
                    !settings.justify
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  راست
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Hyphenation */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                شکستن کلمات
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  فعال‌سازی شکستن خودکار کلمات
                </span>
                <button
                  onClick={() => onSettingsChange({ hyphenation: !settings.hyphenation })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.hyphenation ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.hyphenation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reset Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                بازنشانی تنظیمات
              </h3>
              <button
                onClick={() => {
                  const defaultSettings: ReaderSettings = {
                    fontSize: 18,
                    fontFamily: 'serif',
                    theme: 'light',
                    lineHeight: 1.6,
                    margin: 40,
                    width: 'standard',
                    justify: true,
                    hyphenation: false,
                  };
                  onSettingsChange(defaultSettings);
                }}
                className="w-full p-3 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                بازنشانی به تنظیمات پیش‌فرض
              </button>
            </div>

            {/* Export/Import Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                مدیریت تنظیمات
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const settingsData = JSON.stringify(settings, null, 2);
                    const blob = new Blob([settingsData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'reader-settings.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full p-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  دانلود تنظیمات
                </button>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          try {
                            const settings = JSON.parse(e.target?.result as string);
                            onSettingsChange(settings);
                          } catch (error) {
                            console.error('Error parsing settings file:', error);
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                  className="w-full p-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  بارگذاری تنظیمات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>تنظیمات به صورت خودکار ذخیره می‌شوند</p>
        </div>
      </div>
    </div>
  );
}
