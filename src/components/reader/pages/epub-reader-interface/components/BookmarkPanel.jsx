import React, { forwardRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookmarkPanel = forwardRef(({ 
  bookmarks, 
  onNavigateToBookmark, 
  onDeleteBookmark,
  isExpanded,
  onToggleExpanded,
  isMobile
}, ref) => {

  const formatPersianDate = (date) => {
    // Handle null, undefined, or empty values
    if (!date) return 'نامعلوم';
    
    let dateObj;
    
    // If it's already a Date object
    if (date instanceof Date) {
      dateObj = date;
    }
    // If it's a string or number, try to create a Date
    else {
      dateObj = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(dateObj?.getTime())) {
      return 'تاریخ نامعتبر';
    }
    
    try {
      const persianDate = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })?.format(dateObj);
      return persianDate;
    } catch (error) {
      console.warn('Error formatting Persian date:', error);
      return 'خطا در نمایش تاریخ';
    }
  };

  // Get theme from document class (since we don't have direct theme prop)
  const isDark = document.documentElement?.classList?.contains('dark');
  const isEyeCare = document.documentElement?.classList?.contains('eye-care');
  const theme = isDark ? 'dark' : isEyeCare ? 'eye-care' : 'light';

  return (
    <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`} ref={ref}>
      <div className={`backdrop-blur-sm border rounded-lg shadow-lg transition-all duration-300 ${
        theme === 'dark' ?'bg-slate-800/95 border-slate-700/50'
          : theme === 'eye-care' ?'bg-amber-100/95 border-amber-300/50' :'bg-white/95 border-gray-200/50'
      } ${
        isExpanded ? (isMobile ? 'w-72 max-h-80 p-3' : 'w-80 max-h-96 p-4') : (isMobile ? 'w-10 h-10 p-0' : 'w-12 h-12 p-0')
      }`}>
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleExpanded(true)}
            className={`w-full h-full relative ${
              theme === 'dark' ?'hover:bg-slate-700/50 text-slate-200'
                : theme === 'eye-care' ?'hover:bg-amber-200/50 text-amber-800' :'hover:bg-gray-100/50 text-gray-700'
            }`}
          >
            <Icon name="Bookmark" size={isMobile ? 16 : 20} />
            {bookmarks?.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center ${
                theme === 'dark' ?'bg-slate-600 text-slate-100'
                  : theme === 'eye-care' ?'bg-amber-600 text-white' :'bg-gray-600 text-white'
              }`}>
                {bookmarks?.length}
              </span>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${
                theme === 'dark' ?'text-slate-200'
                  : theme === 'eye-care' ?'text-amber-900' :'text-gray-900'
              }`}>
                نشانک‌ها
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

            {/* Bookmarks List */}
            <div className={`space-y-2 overflow-y-auto reading-scrollbar ${isMobile ? 'max-h-48' : 'max-h-64'}`}>
              {bookmarks?.length === 0 ? (
                <div className="text-center py-6">
                  <Icon 
                    name="BookmarkX" 
                    size={isMobile ? 24 : 32} 
                    className={`mx-auto mb-2 ${
                      theme === 'dark' ?'text-slate-500'
                        : theme === 'eye-care' ?'text-amber-600' :'text-gray-400'
                    }`} 
                  />
                  <p className={`text-sm ${
                    theme === 'dark' ?'text-slate-400'
                      : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
                  }`}>
                    هیچ نشانکی وجود ندارد
                  </p>
                </div>
              ) : (
                bookmarks?.map((bookmark) => (
                  <div
                    key={bookmark?.id}
                    className={`rounded-lg p-3 space-y-2 transition-colors cursor-pointer ${
                      theme === 'dark' ?'bg-slate-700/50 hover:bg-slate-700/70'
                        : theme === 'eye-care' ?'bg-amber-200/50 hover:bg-amber-200/70' :'bg-gray-100/50 hover:bg-gray-100/70'
                    }`}
                    onClick={() => onNavigateToBookmark(bookmark)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1 min-w-0">
                        {/* Page Number Badge */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          theme === 'dark' ?'bg-slate-600 text-slate-100'
                            : theme === 'eye-care' ?'bg-amber-600 text-white' :'bg-gray-600 text-white'
                        }`}>
                          {bookmark?.page}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            theme === 'dark' ?'text-slate-200'
                              : theme === 'eye-care' ?'text-amber-900' :'text-gray-900'
                          }`}>
                            صفحه {bookmark?.page}
                          </p>
                          <p className={`text-xs mt-1 ${
                            theme === 'dark' ?'text-slate-400'
                              : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
                          }`}>
                            {formatPersianDate(bookmark?.timestamp)}
                          </p>
                          {bookmark?.preview && (
                            <p className={`text-xs mt-1 line-clamp-2 ${
                              theme === 'dark' ?'text-slate-400'
                                : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
                            }`}>
                              {bookmark?.preview}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e?.stopPropagation();
                            onNavigateToBookmark(bookmark);
                          }}
                          className={`w-6 h-6 ${
                            theme === 'dark' ?'hover:bg-slate-600/50 text-slate-300'
                              : theme === 'eye-care' ?'hover:bg-amber-300/50 text-amber-800' :'hover:bg-white text-gray-600'
                          }`}
                        >
                          <Icon name="ArrowRight" size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e?.stopPropagation();
                            onDeleteBookmark(bookmark?.id);
                          }}
                          className={`w-6 h-6 ${
                            theme === 'dark' ?'hover:bg-red-900/30 hover:text-red-400'
                              : theme === 'eye-care' ?'hover:bg-red-100 hover:text-red-700' :'hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <Icon name="Trash2" size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

BookmarkPanel.displayName = 'BookmarkPanel';

export default BookmarkPanel;