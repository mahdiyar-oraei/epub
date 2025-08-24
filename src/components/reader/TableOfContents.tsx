'use client';

import { useState } from 'react';
import { X, BookOpen, ChevronRight, Bookmark, Clock, MapPin } from 'lucide-react';
import { EpubSection } from '@/lib/epub-parser';

interface Bookmark {
  id: string;
  cfi: string;
  text: string;
  note?: string;
  createdAt: string;
}

interface TableOfContentsProps {
  sections: EpubSection[];
  currentSection: number;
  onSectionSelect: (sectionIndex: number) => void;
  onClose: () => void;
  bookmarks?: Bookmark[];
  onGoToBookmark?: (bookmark: Bookmark) => void;
}

export default function TableOfContents({
  sections,
  currentSection,
  onSectionSelect,
  onClose,
  bookmarks = [],
  onGoToBookmark
}: TableOfContentsProps) {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks'>('toc');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <BookOpen className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">فهرست مطالب</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('toc')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${
            activeTab === 'toc'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          فهرست مطالب ({sections.length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${
            activeTab === 'bookmarks'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          نشان‌ها ({bookmarks.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'toc' ? (
          // Table of Contents
          sections.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">فهرست مطالب در دسترس نیست</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id || index}
                  onClick={() => onSectionSelect(index)}
                  className={`w-full text-right p-3 rounded-lg transition-all duration-200 group ${
                    index === currentSection
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-[2rem]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {section.label || `فصل ${index + 1}`}
                      </span>
                    </div>
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform ${
                        index === currentSection 
                          ? 'text-primary-500 rotate-90' 
                          : 'text-gray-400 group-hover:text-gray-600'
                      }`} 
                    />
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          index === currentSection 
                            ? 'bg-primary-500' 
                            : index < currentSection 
                              ? 'bg-green-500' 
                              : 'bg-transparent'
                        }`}
                        style={{ 
                          width: index === currentSection ? '100%' : 
                                 index < currentSection ? '100%' : '0%' 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(((index + 1) / sections.length) * 100)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          // Bookmarks
          bookmarks.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">هیچ نشان‌گذاری وجود ندارد</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                برای اضافه کردن نشان، از دکمه نشان‌گذاری استفاده کنید
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
                <button
                  key={bookmark.id}
                  onClick={() => onGoToBookmark?.(bookmark)}
                  className="w-full text-right p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-400">
                      <Bookmark className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {bookmark.text}
                      </div>
                      {bookmark.note && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-right">
                          {bookmark.note}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(bookmark.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <MapPin className="h-3 w-3" />
                          <span>رفتن</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {activeTab === 'toc' ? (
            <>
              <p>کل فصول: {sections.length}</p>
              <p className="mt-1">فصل فعلی: {currentSection + 1}</p>
            </>
          ) : (
            <>
              <p>کل نشان‌ها: {bookmarks.length}</p>
              <p className="mt-1">برای رفتن به نشان کلیک کنید</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
