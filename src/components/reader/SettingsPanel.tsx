'use client';

import { useState, useEffect } from 'react';
import { X, Type, Palette, Sun, Moon, Minus, Plus, Monitor, Check, RotateCcw } from 'lucide-react';
import { useReaderSettings, ReaderSettings, useSettingsListener } from '@/hooks/useReaderSettings';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, applySettings, resetToDefaults, exportSettings, importSettings } = useReaderSettings();
  const [activeTab, setActiveTab] = useState<'appearance' | 'layout'>('appearance');
  const [localSettings, setLocalSettings] = useState<ReaderSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local settings with global settings when they change
  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  // Listen for settings changes from other components
  useSettingsListener((newSettings) => {
    console.log('SettingsPanel: Settings changed, updating local state');
    setLocalSettings(newSettings);
    setHasChanges(false);
  });

  // Check if local settings differ from global settings
  const checkForChanges = (newLocalSettings: ReaderSettings) => {
    const changed = Object.keys(newLocalSettings).some(key => 
      newLocalSettings[key as keyof ReaderSettings] !== settings[key as keyof ReaderSettings]
    );
    setHasChanges(changed);
  };

  // Handle local setting changes
  const handleLocalSettingChange = (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    checkForChanges(updated);
    
    // Auto-apply settings immediately for better user experience
    updateSettings(newSettings);
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

      {/* Reset to Defaults Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            بازنشانی تنظیمات
          </span>
          <button
            onClick={resetToDefaults}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="بازنشانی به تنظیمات پیش‌فرض"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
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
                  {localSettings.fontSize}px
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
                <Type className="h-4 w-4" />
                <span>نوع فونت</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['serif', 'sans-serif', 'monospace'] as const).map((family) => (
                  <button
                    key={family}
                    onClick={() => handleLocalSettingChange({ fontFamily: family })}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      localSettings.fontFamily === family
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
                    onClick={() => handleLocalSettingChange({ theme })}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 space-x-reverse ${
                      localSettings.theme === theme
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
                  {localSettings.lineHeight.toFixed(1)}
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
                  {localSettings.margin}px
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
                  onClick={() => handleLocalSettingChange({ justify: true })}
                  className={`flex-1 p-3 text-sm rounded-lg border transition-colors ${
                    localSettings.justify
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  تراز کامل
                </button>
                <button
                  onClick={() => handleLocalSettingChange({ justify: false })}
                  className={`flex-1 p-3 text-sm rounded-lg border transition-colors ${
                    !localSettings.justify
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
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>تنظیمات به صورت خودکار ذخیره می‌شوند</p>
          <p className="mt-1">برای اعمال فوری کلیک کنید</p>
        </div>
        
        {/* Debug Info - Remove in production */}
        <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          <p className="font-medium mb-1">Debug Info:</p>
          <p>Font Size: {settings.fontSize}px</p>
          <p>Theme: {settings.theme}</p>
          <p>Has Changes: {hasChanges ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}
