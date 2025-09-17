import React, { forwardRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FloatingControlPanel = forwardRef(({ 
  theme, 
  onThemeChange, 
  fontFamily, 
  onFontFamilyChange, 
  fontSize, 
  onFontSizeChange,
  isExpanded,
  onToggleExpanded,
  isMobile
}, ref) => {

  const fontOptions = [
    { value: 'vazirmatn', label: 'وزیرمتن', family: 'Vazirmatn' },
    { value: 'tahoma', label: 'تاهوما', family: 'Tahoma' },
    { value: 'serif', label: 'سریف', family: 'serif' },
    { value: 'far_roya', label: 'فر رویا', family: 'B Roya' },
    { value: 'far_nazanin', label: 'فر نازنین', family: 'B Nazanin' },
    { value: 'b_zar', label: 'ب زر', family: 'B Zar' }
  ];

  const themeOptions = [
    { value: 'light', label: 'روشن', icon: 'Sun' },
    { value: 'dark', label: 'تاریک', icon: 'Moon' },
    { value: 'eye-care', label: 'محافظت چشم', icon: 'Eye' }
  ];

  const handleThemeSelect = (newTheme) => {
    onThemeChange(newTheme);
  };

  return (
    <div className={`fixed ${isMobile ? 'top-4 left-4' : 'top-6 left-6'} z-50`} ref={ref}>
      <div className={`backdrop-blur-sm border rounded-lg shadow-lg transition-all duration-300 ${
        theme === 'dark' ?'bg-slate-800/95 border-slate-700/50'
          : theme === 'eye-care' ?'bg-amber-100/95 border-amber-300/50' :'bg-white/95 border-gray-200/50'
      } ${
        isExpanded ? (isMobile ? 'w-72 p-3' : 'w-80 p-4') : (isMobile ? 'w-10 h-10 p-0' : 'w-12 h-12 p-0')
      }`}>
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleExpanded(true)}
            className={`w-full h-full ${
              theme === 'dark' ?'hover:bg-slate-700/50 text-slate-200'
                : theme === 'eye-care' ?'hover:bg-amber-200/50 text-amber-800' :'hover:bg-gray-100/50 text-gray-700'
            }`}
          >
            <Icon name="Settings" size={isMobile ? 16 : 20} />
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${
                theme === 'dark' ?'text-slate-200'
                  : theme === 'eye-care' ?'text-amber-900' :'text-gray-900'
              }`}>
                تنظیمات
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleExpanded(false)}
                className={`w-6 h-6 ${
                  theme === 'dark' ?'hover:bg-slate-700/50 text-slate-400'
                    : theme === 'eye-care' ?'hover:bg-amber-200/50 text-amber-700' :'hover:bg-gray-100/50 text-gray-500'
                }`}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            {/* Theme Selection */}
            <div className="space-y-2">
              <label className={`text-sm ${
                theme === 'dark' ?'text-slate-400'
                  : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
              }`}>
                تم رنگی
              </label>
              <div className="grid grid-cols-3 gap-1">
                {themeOptions?.map((option) => (
                  <Button
                    key={option?.value}
                    variant={theme === option?.value ? "default" : "outline"}
                    size="xs"
                    onClick={() => handleThemeSelect(option?.value)}
                    className={`text-xs h-8 flex items-center justify-center gap-1 ${
                      theme === option?.value
                        ? theme === 'dark' ?'bg-slate-600 text-slate-100 border-slate-600'
                          : theme === 'eye-care' ?'bg-amber-600 text-white border-amber-600' :'bg-gray-600 text-white border-gray-600'
                        : theme === 'dark' ?'border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                        : theme === 'eye-care' ?'border-amber-400/50 text-amber-800 hover:bg-amber-200/50' :'border-gray-300/50 text-gray-700 hover:bg-gray-100/50'
                    }`}
                  >
                    <Icon name={option?.icon} size={12} />
                    <span className="hidden sm:inline">{option?.label?.split(' ')?.[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className={`text-sm ${
                theme === 'dark' ?'text-slate-400'
                  : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
              }`}>
                فونت
              </label>
              <div className="grid grid-cols-2 gap-1">
                {fontOptions?.map((option) => (
                  <Button
                    key={option?.value}
                    variant={fontFamily === option?.value ? "default" : "outline"}
                    size="xs"
                    onClick={() => onFontFamilyChange(option?.value)}
                    className={`text-xs h-8 ${
                      fontFamily === option?.value
                        ? theme === 'dark' ?'bg-slate-600 text-slate-100 border-slate-600'
                          : theme === 'eye-care' ?'bg-amber-600 text-white border-amber-600' :'bg-gray-600 text-white border-gray-600'
                        : theme === 'dark' ?'border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                        : theme === 'eye-care' ?'border-amber-400/50 text-amber-800 hover:bg-amber-200/50' :'border-gray-300/50 text-gray-700 hover:bg-gray-100/50'
                    }`}
                    style={{ fontFamily: option?.family }}
                  >
                    {option?.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm ${
                  theme === 'dark' ?'text-slate-400'
                    : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
                }`}>
                  اندازه فونت
                </label>
                <span className={`text-xs ${
                  theme === 'dark' ?'text-slate-400'
                    : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
                }`}>
                  {fontSize}px
                </span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
                  disabled={fontSize <= 14}
                  className={`w-6 h-6 ${
                    theme === 'dark' ?'border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                      : theme === 'eye-care' ?'border-amber-400/50 text-amber-800 hover:bg-amber-200/50' :'border-gray-300/50 text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <Icon name="Minus" size={12} />
                </Button>
                <input
                  type="range"
                  min="14"
                  max="28"
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(parseInt(e?.target?.value))}
                  className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer slider ${
                    theme === 'dark' ?'bg-slate-700'
                      : theme === 'eye-care' ?'bg-amber-200' :'bg-gray-200'
                  }`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
                  disabled={fontSize >= 28}
                  className={`w-6 h-6 ${
                    theme === 'dark' ?'border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                      : theme === 'eye-care' ?'border-amber-400/50 text-amber-800 hover:bg-amber-200/50' :'border-gray-300/50 text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <Icon name="Plus" size={12} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

FloatingControlPanel.displayName = 'FloatingControlPanel';

export default FloatingControlPanel;