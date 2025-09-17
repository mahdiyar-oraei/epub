import React, { forwardRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TableOfContentsPanel = forwardRef(({ 
  tableOfContents = [],
  currentPage,
  onNavigateToPage,
  isExpanded,
  onToggleExpanded,
  isMobile
}, ref) => {

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'

  // Mock table of contents data if none provided
  const mockTOC = [
    { id: 1, title: 'مقدمه', page: 1, level: 1, description: 'بررسی مقدماتی موضوعات کتاب' },
    { id: 2, title: 'فصل اول: آشنایی با موضوع', page: 5, level: 1, description: 'معرفی اصول و مبانی اولیه موضوع مورد بحث' },
    { id: 3, title: 'بخش اول: تعاریف', page: 8, level: 2, description: 'تعاریف و اصطلاحات مهم' },
    { id: 4, title: 'بخش دوم: مفاهیم پایه', page: 12, level: 2, description: 'بررسی مفاهیم بنیادی و اصولی' },
    { id: 5, title: 'فصل دوم: بررسی عمیق‌تر', page: 18, level: 1, description: 'تحلیل جامع و دقیق موضوعات مطرح شده' },
    { id: 6, title: 'مباحث پیشرفته', page: 22, level: 2, description: 'بحث در مورد موضوعات پیچیده و پیشرفته' },
    { id: 7, title: 'فصل سوم: کاربردهای عملی', page: 28, level: 1, description: 'نحوه استفاده عملی از مطالب آموخته شده' },
    { id: 8, title: 'مثال‌های کاربردی', page: 32, level: 2, description: 'نمونه‌هایی از کاربرد در دنیای واقعی' },
    { id: 9, title: 'تمرین‌ها و سوالات', page: 36, level: 2, description: 'تمرین‌های تقویتی و سوالات متنوع' },
    { id: 10, title: 'نتیجه‌گیری', page: 42, level: 1, description: 'جمع‌بندی و خلاصه نهایی مطالب' },
    { id: 11, title: 'منابع و مراجع', page: 46, level: 1, description: 'فهرست کامل منابع و مراجع استفاده شده' },
    { id: 12, title: 'پیوست‌ها', page: 48, level: 1, description: 'اطلاعات تکمیلی و جداول مرجع' }
  ];

  const toc = tableOfContents?.length > 0 ? tableOfContents : mockTOC;

  // Get theme from document class (since we don't have direct theme prop)
  const isDark = document.documentElement?.classList?.contains('dark');
  const isEyeCare = document.documentElement?.classList?.contains('eye-care');
  const theme = isDark ? 'dark' : isEyeCare ? 'eye-care' : 'light';

  const handleItemClick = (item) => {
    onNavigateToPage?.(item?.page);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'details' : 'list');
  };

  const getItemIndentClass = (level) => {
    return level > 1 ? 'mr-4' : '';
  };

  return (
    <div className={`fixed ${isMobile ? 'top-16 left-4' : 'top-20 left-6'} z-50`} ref={ref}>
      <div className={`backdrop-blur-sm border rounded-lg shadow-lg transition-all duration-300 ${
        theme === 'dark' ?'bg-slate-800/95 border-slate-700/50'
          : theme === 'eye-care' ?'bg-amber-100/95 border-amber-300/50' :'bg-white/95 border-gray-200/50'
      } ${
        isExpanded ? (isMobile ? 'w-80 max-h-80 p-3' : 'w-96 max-h-96 p-4') : (isMobile ? 'w-10 h-10 p-0' : 'w-12 h-12 p-0')
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
            <Icon name="List" size={isMobile ? 16 : 20} />
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${
                theme === 'dark' ?'text-slate-200'
                  : theme === 'eye-care' ?'text-amber-900' :'text-gray-900'
              }`}>
                فهرست مطالب
              </h3>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                {/* View Mode Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleViewMode}
                  className={`w-6 h-6 ${
                    theme === 'dark' ?'hover:bg-slate-700/50 text-slate-400'
                      : theme === 'eye-care' ?'hover:bg-amber-200/50 text-amber-700' :'hover:bg-gray-100/50 text-gray-500'
                  }`}
                  title={viewMode === 'list' ? 'نمایش جزئیات' : 'نمایش فهرست'}
                >
                  <Icon name={viewMode === 'list' ? 'FileText' : 'List'} size={14} />
                </Button>
                {/* Close Button */}
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
            </div>

            {/* Table of Contents List */}
            <div className={`space-y-1 overflow-y-auto reading-scrollbar ${isMobile ? 'max-h-48' : 'max-h-64'}`}>
              {toc?.length === 0 ? (
                <div className="text-center py-6">
                  <Icon 
                    name="FileX" 
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
                    فهرست مطالب در دسترس نیست
                  </p>
                </div>
              ) : (
                toc?.map((item) => (
                  <div
                    key={item?.id}
                    className={`rounded-lg transition-colors cursor-pointer ${getItemIndentClass(item?.level)} ${
                      currentPage === item?.page 
                        ? theme === 'dark' ?'bg-slate-600/70 border border-slate-500'
                          : theme === 'eye-care' ?'bg-amber-300/70 border border-amber-400' :'bg-gray-200/70 border border-gray-300'
                        : theme === 'dark' ?'bg-slate-700/30 hover:bg-slate-700/50'
                        : theme === 'eye-care' ?'bg-amber-200/30 hover:bg-amber-200/50' :'bg-gray-100/30 hover:bg-gray-100/50'
                    } ${viewMode === 'details' ? 'p-3 space-y-2' : 'p-2'}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse flex-1 min-w-0">
                        {/* Level Indicator */}
                        {item?.level > 1 && (
                          <div className={`w-1 h-4 rounded-full ${
                            theme === 'dark' ?'bg-slate-500'
                              : theme === 'eye-care' ?'bg-amber-500' :'bg-gray-400'
                          }`} />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${
                            viewMode === 'details' ? 'text-sm' : 'text-xs'
                          } ${
                            theme === 'dark' ?'text-slate-200'
                              : theme === 'eye-care' ?'text-amber-900' :'text-gray-900'
                          }`}>
                            {item?.title}
                          </p>
                          
                          {viewMode === 'details' && item?.description && (
                            <p className={`text-xs mt-1 line-clamp-2 ${
                              theme === 'dark' ?'text-slate-400'
                                : theme === 'eye-care' ?'text-amber-700' :'text-gray-600'
                            }`}>
                              {item?.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Page Number */}
                      <div className="flex items-center space-x-1 rtl:space-x-reverse ml-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          currentPage === item?.page
                            ? theme === 'dark' ?'bg-slate-200 text-slate-800'
                              : theme === 'eye-care' ?'bg-amber-700 text-white' :'bg-gray-700 text-white'
                            : theme === 'dark' ?'bg-slate-600 text-slate-200'
                            : theme === 'eye-care' ?'bg-amber-600/80 text-white' :'bg-gray-500 text-white'
                        }`}>
                          {item?.page}
                        </span>
                        
                        {currentPage === item?.page && (
                          <Icon 
                            name="Eye" 
                            size={12} 
                            className={`${
                              theme === 'dark' ?'text-slate-300'
                                : theme === 'eye-care' ?'text-amber-800' :'text-gray-700'
                            }`} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* View Mode Info */}
            <div className={`flex items-center justify-between text-xs pt-2 border-t ${
              theme === 'dark' ?'border-slate-700/50 text-slate-400'
                : theme === 'eye-care' ?'border-amber-300/50 text-amber-700' :'border-gray-200/50 text-gray-600'
            }`}>
              <span>حالت نمایش: {viewMode === 'list' ? 'فهرست' : 'جزئیات'}</span>
              <span>{toc?.length} آیتم</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TableOfContentsPanel.displayName = 'TableOfContentsPanel';

export default TableOfContentsPanel;