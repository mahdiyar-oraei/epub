'use client';

import { useState } from 'react';
import { useReaderSettings } from '@/hooks/useReaderSettings';
import { 
  ArrowLeft, 
  Type, 
  Palette, 
  Sun, 
  Moon, 
  BookOpen, 
  Minus, 
  Plus, 
  Monitor, 
  Check, 
  RotateCcw,
  Download,
  Upload,
  Eye,
  BookOpenCheck
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { 
    settings, 
    updateSettings, 
    applySettings, 
    resetToDefaults, 
    exportSettings, 
importSettings 
  } = useReaderSettings();
  
  const [activeTab, setActiveTab] = useState<'appearance' | 'layout' | 'advanced'>('appearance');
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if local settings differ from global settings
  const checkForChanges = (newLocalSettings: typeof settings) => {
    const changed = Object.keys(newLocalSettings).some(key => 
      newLocalSettings[key as keyof typeof settings] !== settings[key as keyof typeof settings]
    );
    setHasChanges(changed);
  };

  // Handle local setting changes
  const handleLocalSettingChange = (newSettings: Partial<typeof settings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    checkForChanges(updated);
  };

  // Apply all settings at once
  const handleApplyAll = () => {
    updateSettings(localSettings);
    applySettings();
    setHasChanges(false);
  };

  // Reset local changes
  const handleResetLocal = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, localSettings.fontSize + delta));
    handleLocalSettingChange({ fontSize: newSize });
  };

  const handleLineHeightChange = (delta: number) => {
    const newHeight = Math.max(1.2, Math.min(2.5, localSettings.lineHeight + delta));
    handleLocalSettingChange({ lineHeight: newHeight });
  };

  const handleMarginChange = (delta: number) => {
    const newMargin = Math.max(20, Math.min(80, localSettings.margin + delta));
    handleLocalSettingChange({ margin: newMargin });
  };

  const tabs = [
    { id: 'appearance', label: 'ظاهر', icon: Palette },
    { id: 'layout', label: 'چیدمان', icon: Monitor },
    { id: 'advanced', label: 'پیشرفته', icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/"
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-2 space-x-reverse">
                <BookOpenCheck className="h-6 w-6 text-primary-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  تنظیمات خواننده
                </h1>
              </div>
            </div>
            
            {/* Apply All Button */}
            <div className="flex items-center space-x-3 space-x-reverse">
              {hasChanges && (
                <button
                  onClick={handleResetLocal}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="بازنشانی تغییرات"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleApplyAll}
                disabled={!hasChanges}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-medium transition-all ${
                  hasChanges
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>اعمال همه تنظیمات</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse p-4 text-sm font-medium transition-colors ${
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
          <div className="p-6">
            {activeTab === 'appearance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Font Size */}
                <div className="space-y-4">
                  <h3 className="flex items-center space-x-2 space-x-reverse text-lg font-medium text-gray-900 dark:text-white">
                    <Type className="h-5 w-5 text-primary-600" />
                    <span>اندازه فونت</span>
                  </h3>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                      onClick={() => handleFontSizeChange(-2)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-300 w-16 text-center">
                      {localSettings.fontSize}px
                    </span>
                    <button
                      onClick={() => handleFontSizeChange(2)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اندازه فونت برای خواندن متن کتاب
                  </p>
                </div>

                {/* Font Family */}
                <div className="space-y-4">
                  <h3 className="flex items-center space-x-2 space-x-reverse text-lg font-medium text-gray-900 dark:text-white">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                    <span>نوع فونت</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {(['serif', 'sans-serif', 'monospace'] as const).map((family) => (
                      <button
                        key={family}
                        onClick={() => handleLocalSettingChange({ fontFamily: family })}
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          localSettings.fontFamily === family
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {family === 'serif' ? 'سریف' : family === 'sans-serif' ? 'سن‌سریف' : 'مونو'}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نوع فونت برای نمایش متن
                  </p>
                </div>

                {/* Theme */}
                <div className="space-y-4">
                  <h3 className="flex items-center space-x-2 space-x-reverse text-lg font-medium text-gray-900 dark:text-white">
                    <Palette className="h-5 w-5 text-primary-600" />
                    <span>تم رنگی</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['light', 'dark', 'sepia', 'night'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleLocalSettingChange({ theme })}
                        className={`p-3 rounded-lg border transition-colors flex flex-col items-center justify-center space-y-2 ${
                          localSettings.theme === theme
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {theme === 'light' && <Sun className="h-5 w-5" />}
                        {theme === 'dark' && <Moon className="h-5 w-5" />}
                        {theme === 'sepia' && <div className="w-5 h-5 bg-yellow-600 rounded-full" />}
                        {theme === 'night' && <div className="w-5 h-5 bg-blue-900 rounded-full" />}
                        <span className="text-sm">
                          {theme === 'light' ? 'روشن' : 
                           theme === 'dark' ? 'تیره' : 
                           theme === 'sepia' ? 'سپیا' : 'شب'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تم رنگی برای خواندن راحت‌تر
                  </p>
                </div>

                {/* Line Height */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    فاصله خطوط
                  </h3>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                      onClick={() => handleLineHeightChange(-0.1)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-300 w-16 text-center">
                      {localSettings.lineHeight.toFixed(1)}
                    </span>
                    <button
                      onClick={() => handleLineHeightChange(0.1)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    فاصله بین خطوط برای خوانایی بهتر
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Page Width */}
                <div className="space-y-4">
                  <h3 className="flex items-center space-x-2 space-x-reverse text-lg font-medium text-gray-900 dark:text-white">
                    <Monitor className="h-5 w-5 text-primary-600" />
                    <span>عرض صفحه</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {(['narrow', 'standard', 'wide'] as const).map((width) => (
                      <button
                        key={width}
                        onClick={() => handleLocalSettingChange({ width })}
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          localSettings.width === width
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {width === 'narrow' ? 'باریک' : width === 'standard' ? 'استاندارد' : 'عریض'}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    عرض صفحه برای خواندن راحت‌تر
                  </p>
                </div>

                {/* Margins */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    حاشیه صفحه
                  </h3>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                      onClick={() => handleMarginChange(-10)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-300 w-16 text-center">
                      {localSettings.margin}px
                    </span>
                    <button
                      onClick={() => handleMarginChange(10)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    حاشیه اطراف متن برای خوانایی بهتر
                  </p>
                </div>

                {/* Text Alignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    تراز متن
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleLocalSettingChange({ justify: true })}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        localSettings.justify
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      تراز کامل
                    </button>
                    <button
                      onClick={() => handleLocalSettingChange({ justify: false })}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        !localSettings.justify
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      راست
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نحوه تراز متن در صفحه
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hyphenation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    شکستن کلمات
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      فعال‌سازی شکستن خودکار کلمات
                    </span>
                    <button
                      onClick={() => handleLocalSettingChange({ hyphenation: !localSettings.hyphenation })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.hyphenation ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.hyphenation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    شکستن خودکار کلمات برای تراز بهتر
                  </p>
                </div>

                {/* Reset Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    بازنشانی تنظیمات
                  </h3>
                  <button
                    onClick={() => {
                      resetToDefaults();
                      setLocalSettings(settings);
                      setHasChanges(false);
                    }}
                    className="w-full p-3 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    بازنشانی به تنظیمات پیش‌فرض
                  </button>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    بازگردانی همه تنظیمات به حالت اولیه
                  </p>
                </div>

                {/* Export/Import Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    مدیریت تنظیمات
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={exportSettings}
                      className="w-full p-3 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                    >
                      <Download className="h-4 w-4" />
                      <span>دانلود تنظیمات</span>
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
                                const settingsData = e.target?.result as string;
                                importSettings(settingsData);
                                setLocalSettings(settings);
                                setHasChanges(false);
                              } catch (error) {
                                console.error('Error importing settings:', error);
                                alert('خطا در بارگذاری فایل تنظیمات');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                      }}
                      className="w-full p-3 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                    >
                      <Upload className="h-4 w-4" />
                      <span>بارگذاری تنظیمات</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ذخیره و بازیابی تنظیمات شخصی
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>تنظیمات به صورت خودکار ذخیره می‌شوند و در تمام صفحات اعمال می‌شوند</p>
              <p className="mt-1">برای اعمال فوری تنظیمات کلیک کنید</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

