'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Bookmark, 
  Search, 
  Settings, 
  Eye, 
  EyeOff,
  List,
  X
} from 'lucide-react';

interface FloatingNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  onToggleToolbar: () => void;
  onTogglePanel: (panel: string) => void;
  currentPanel: {
    toc: boolean;
    bookmarks: boolean;
    search: boolean;
    settings: boolean;
  };
  hasNext: boolean;
  hasPrev: boolean;
}

export default function FloatingNavigation({
  onNext,
  onPrev,
  onToggleToolbar,
  onTogglePanel,
  currentPanel,
  hasNext,
  hasPrev
}: FloatingNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePanelToggle = (panel: string) => {
    onTogglePanel(panel);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Main Navigation Buttons */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {/* Left Navigation */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 pointer-events-auto ${
            hasPrev
              ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-xl'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          aria-label="صفحه قبل"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Right Navigation */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 pointer-events-auto ${
            hasNext
              ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-xl'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          aria-label="صفحه بعد"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Center Toggle Button */}
        <button
          onClick={toggleExpanded}
          className="absolute left-1/2 top-4 transform -translate-x-1/2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 pointer-events-auto"
          aria-label="نمایش/مخفی کردن ابزارها"
        >
          {isExpanded ? <X className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Expanded Tools Panel */}
      {isExpanded && (
        <div className="absolute left-1/2 top-20 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 pointer-events-auto z-50 min-w-[200px]">
          <div className="space-y-3">
            {/* Table of Contents */}
            <button
              onClick={() => handlePanelToggle('toc')}
              className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-lg transition-colors ${
                currentPanel.toc
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <List className="h-5 w-5" />
              <span className="text-sm font-medium">فهرست مطالب</span>
            </button>

            {/* Bookmarks */}
            <button
              onClick={() => handlePanelToggle('bookmarks')}
              className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-lg transition-colors ${
                currentPanel.bookmarks
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Bookmark className="h-5 w-5" />
              <span className="text-sm font-medium">نشان‌ها</span>
            </button>



            {/* Settings */}
            <button
              onClick={() => handlePanelToggle('settings')}
              className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-lg transition-colors ${
                currentPanel.settings
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">تنظیمات</span>
            </button>

            {/* Toggle Toolbar */}
            <button
              onClick={onToggleToolbar}
              className="w-full flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <EyeOff className="h-5 w-5" />
              <span className="text-sm font-medium">مخفی کردن نوار ابزار</span>
            </button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>صفحه بعد:</span>
                <span className="font-mono">Space / ←</span>
              </div>
              <div className="flex justify-between">
                <span>صفحه قبل:</span>
                <span className="font-mono">→</span>
              </div>
              <div className="flex justify-between">
                <span>نشان:</span>
                <span className="font-mono">B</span>
              </div>
              <div className="flex justify-between">
                <span>فهرست:</span>
                <span className="font-mono">T</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click Outside to Close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
