import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NavigationControls = ({ 
  onPrevPage, 
  onNextPage, 
  onAddBookmark, 
  canGoPrev, 
  canGoNext,
  isMobile,
  theme = 'light'
}) => {
  if (!isMobile) return null;

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-slate-800/20',
          border: 'border-slate-700/20',
          hover: 'hover:bg-slate-800/40',
          text: 'text-slate-200'
        };
      case 'eye-care':
        return {
          background: 'bg-amber-100/20',
          border: 'border-amber-400/20',
          hover: 'hover:bg-amber-100/40',
          text: 'text-amber-800'
        };
      default:
        return {
          background: 'bg-white/20',
          border: 'border-gray-200/20',
          hover: 'hover:bg-white/40',
          text: 'text-gray-700'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <>
      {/* Previous Page Button */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className={`w-10 h-10 ${themeClasses?.background} backdrop-blur-sm border ${themeClasses?.border} ${themeClasses?.hover} ${themeClasses?.text} disabled:opacity-30`}
        >
          <Icon name="ChevronLeft" size={18} />
        </Button>
      </div>
      {/* Next Page Button */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextPage}
          disabled={!canGoNext}
          className={`w-10 h-10 ${themeClasses?.background} backdrop-blur-sm border ${themeClasses?.border} ${themeClasses?.hover} ${themeClasses?.text} disabled:opacity-30`}
        >
          <Icon name="ChevronRight" size={18} />
        </Button>
      </div>
      {/* Add Bookmark Button */}
      <div className="fixed top-16 right-3 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddBookmark}
          className={`w-8 h-8 ${themeClasses?.background} backdrop-blur-sm border ${themeClasses?.border} ${themeClasses?.hover} ${themeClasses?.text}`}
        >
          <Icon name="BookmarkPlus" size={14} />
        </Button>
      </div>
    </>
  );
};

export default NavigationControls;