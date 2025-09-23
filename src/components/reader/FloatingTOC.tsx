'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  List, 
  X, 
  Bookmark,
  ChevronRight
} from 'lucide-react';

interface Bookmark {
  id: string;
  cfi: string;
  text: string;
  note?: string;
  createdAt: string;
}

interface Section {
  index: number;
  href: string;
  label: string;
}

interface FloatingTOCProps {
  sections: Section[];
  currentSection: number;
  bookmarks: Bookmark[];
  onSectionSelect: (index: number) => void;
  onGoToBookmark: (bookmark: Bookmark) => void;
  onAddBookmark: () => void;
}

export default function FloatingTOC({
  sections,
  currentSection,
  bookmarks,
  onSectionSelect,
  onGoToBookmark,
  onAddBookmark
}: FloatingTOCProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks'>('toc');
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const handleSectionClick = (index: number) => {
    onSectionSelect(index);
    setIsOpen(false);
  };

  const handleBookmarkClick = (bookmark: Bookmark) => {
    onGoToBookmark(bookmark);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating TOC Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
        aria-label="فهرست مطالب"
      >
        <List className="h-5 w-5" />
      </button>

      {/* TOC Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            ref={dialogRef}
            className="absolute top-32 right-4 w-80 max-w-[90vw] max-h-[80vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                فهرست مطالب
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="بستن"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('toc')}
                className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse p-3 text-sm font-medium transition-colors ${
                  activeTab === 'toc'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List className="h-4 w-4" />
                <span>فهرست</span>
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse p-3 text-sm font-medium transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>نشان‌ها ({bookmarks.length})</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'toc' ? (
                <div className="p-4">
                  <div className="space-y-1">
                    {sections.map((section, index) => (
                      <button
                        key={index}
                        onClick={() => handleSectionClick(index)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-right transition-colors ${
                          index === currentSection
                            ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {section.label}
                          </span>
                        </div>
                        {index === currentSection && (
                          <ChevronRight className="h-4 w-4 text-primary-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8">
                      <Bookmark className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        هیچ نشان‌ای وجود ندارد
                      </p>
                      <button
                        onClick={onAddBookmark}
                        className="mt-3 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        افزودن نشان
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks.map((bookmark) => (
                        <button
                          key={bookmark.id}
                          onClick={() => handleBookmarkClick(bookmark)}
                          className="w-full text-right p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <div className="text-sm font-medium mb-1">
                            {bookmark.text}
                          </div>
                          {bookmark.note && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {bookmark.note}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(bookmark.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {activeTab === 'bookmarks' && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onAddBookmark}
                  className="w-full flex items-center justify-center space-x-2 space-x-reverse p-3 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  <span className="font-medium">افزودن نشان جدید</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
