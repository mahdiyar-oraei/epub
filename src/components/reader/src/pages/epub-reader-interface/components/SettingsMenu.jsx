import React, { forwardRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import FloatingControlPanel from './FloatingControlPanel';
import TableOfContentsPanel from './TableOfContentsPanel';

interface SettingsMenuProps {
  theme: string;
  onThemeChange: (newTheme: string) => void;
  fontFamily: string;
  onFontFamilyChange: (newFontFamily: string) => void;
  fontSize: number;
  onFontSizeChange: (newFontSize: number) => void;
  tableOfContents?: any[];
  currentPage: number;
  onNavigateToPage: (page: number) => void;
  isExpanded: boolean;
  onToggleExpanded: (expanded: boolean) => void;
  isMobile: boolean;
}

const SettingsMenu = forwardRef<any, SettingsMenuProps>(({ 
  theme, 
  onThemeChange, 
  fontFamily, 
  onFontFamilyChange, 
  fontSize, 
  onFontSizeChange,
  tableOfContents,
  currentPage,
  onNavigateToPage,
  isExpanded,
  onToggleExpanded,
  isMobile
}, ref) => {

  const [activePanel, setActivePanel] = useState<string | null>(null); // 'control' or 'toc'

  const handleMainToggle = () => {
    if (isExpanded) {
      // If expanded, close everything
      setActivePanel(null);
      onToggleExpanded(false);
    } else {
      // If collapsed, show main menu
      onToggleExpanded(true);
    }
  };

  const handleOptionSelect = (option: string) => {
    setActivePanel(option);
  };

  const handleBackToMenu = () => {
    setActivePanel(null);
  };

  const handleClose = () => {
    setActivePanel(null);
    onToggleExpanded(false);
  };

  // If a panel is active, render that panel directly
  if (isExpanded && activePanel === 'control') {
    return (
      <FloatingControlPanel
        ref={ref}
        theme={theme}
        onThemeChange={onThemeChange}
        fontFamily={fontFamily}
        onFontFamilyChange={onFontFamilyChange}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        isExpanded={true}
        onToggleExpanded={handleClose}
        isMobile={isMobile}
        showBackButton={true}
        onBack={handleBackToMenu}
      />
    );
  }

  if (isExpanded && activePanel === 'toc') {
    return (
      <TableOfContentsPanel
        ref={ref}
        tableOfContents={tableOfContents}
        currentPage={currentPage}
        onNavigateToPage={onNavigateToPage}
        isExpanded={true}
        onToggleExpanded={handleClose}
        isMobile={isMobile}
        showBackButton={true}
        onBack={handleBackToMenu}
      />
    );
  }

  return (
    <div className={`fixed ${isMobile ? 'top-16 left-4' : 'top-20 left-6'} z-50`} ref={ref}>
      <div className={`backdrop-blur-sm border rounded-lg shadow-lg transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-800/95 border-slate-700/50'
          : theme === 'eye-care' ? 'bg-amber-100/95 border-amber-300/50' : 'bg-white/95 border-gray-200/50'
      } ${
        isExpanded ? (isMobile ? 'w-64 p-3' : 'w-72 p-4') : (isMobile ? 'w-10 h-10 p-0' : 'w-12 h-12 p-0')
      }`}>
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMainToggle}
            className={`w-full h-full ${
              theme === 'dark' ? 'hover:bg-slate-700/50 text-slate-200'
                : theme === 'eye-care' ? 'hover:bg-amber-200/50 text-amber-800' : 'hover:bg-gray-100/50 text-gray-700'
            }`}
          >
            <Icon name="Settings" size={isMobile ? 16 : 20} />
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-200'
                  : theme === 'eye-care' ? 'text-amber-900' : 'text-gray-900'
              }`}>
                تنظیمات
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className={`w-6 h-6 ${
                  theme === 'dark' ? 'hover:bg-slate-700/50 text-slate-400'
                    : theme === 'eye-care' ? 'hover:bg-amber-200/50 text-amber-700' : 'hover:bg-gray-100/50 text-gray-500'
                }`}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            {/* Menu Options */}
            <div className="space-y-2">
              {/* Control Panel Option */}
              <Button
                variant="outline"
                onClick={() => handleOptionSelect('control')}
                className={`w-full h-12 flex items-center justify-start gap-3 px-3 ${
                  theme === 'dark' ? 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                    : theme === 'eye-care' ? 'border-amber-400/50 text-amber-800 hover:bg-amber-200/50 hover:border-amber-400'
                    : 'border-gray-300/50 text-gray-700 hover:bg-gray-100/50 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-slate-700/50'
                    : theme === 'eye-care' ? 'bg-amber-200/50' : 'bg-gray-100/50'
                }`}>
                  <Icon name="Sliders" size={16} />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-medium">پنل کنترل</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-slate-400'
                      : theme === 'eye-care' ? 'text-amber-700' : 'text-gray-600'
                  }`}>
                    تم، فونت و اندازه
                  </div>
                </div>
                <Icon name="ChevronLeft" size={16} className="flex-shrink-0" />
              </Button>

              {/* Table of Contents Option */}
              <Button
                variant="outline"
                onClick={() => handleOptionSelect('toc')}
                className={`w-full h-12 flex items-center justify-start gap-3 px-3 ${
                  theme === 'dark' ? 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                    : theme === 'eye-care' ? 'border-amber-400/50 text-amber-800 hover:bg-amber-200/50 hover:border-amber-400'
                    : 'border-gray-300/50 text-gray-700 hover:bg-gray-100/50 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-slate-700/50'
                    : theme === 'eye-care' ? 'bg-amber-200/50' : 'bg-gray-100/50'
                }`}>
                  <Icon name="List" size={16} />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-medium">فهرست مطالب</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-slate-400'
                      : theme === 'eye-care' ? 'text-amber-700' : 'text-gray-600'
                  }`}>
                    فصل‌ها و صفحات
                  </div>
                </div>
                <Icon name="ChevronLeft" size={16} className="flex-shrink-0" />
              </Button>
            </div>

            {/* Footer Info */}
            <div className={`text-xs text-center pt-2 border-t ${
              theme === 'dark' ? 'border-slate-700/50 text-slate-400'
                : theme === 'eye-care' ? 'border-amber-300/50 text-amber-700' : 'border-gray-200/50 text-gray-600'
            }`}>
              گزینه مورد نظر را انتخاب کنید
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SettingsMenu.displayName = 'SettingsMenu';

export default SettingsMenu;
