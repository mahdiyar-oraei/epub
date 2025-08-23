'use client';

import { useState, useEffect } from 'react';
import { X, Search, BookOpen, ChevronRight, FileText, Hash } from 'lucide-react';

interface SearchResult {
  section: any;
  index: number;
  matches: number;
}

interface SearchPanelProps {
  onSearch: (query: string) => void;
  results: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  onClose: () => void;
}

export default function SearchPanel({
  onSearch,
  results,
  onResultSelect,
  onClose
}: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        onSearch(searchQuery);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, onSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      onSearch(searchQuery);
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Search className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">جستجو</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در متن کتاب..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              dir="rtl"
            />
          </div>
          
          {isSearching && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            </div>
          )}
        </form>

        {/* Search Tips */}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>برای جستجوی دقیق‌تر، از عبارات کامل استفاده کنید</p>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.trim() === '' ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">برای شروع جستجو، متنی را وارد کنید</p>
          </div>
        ) : isSearching ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">در حال جستجو...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">نتیجه‌ای یافت نشد</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              عبارت جستجو شده را تغییر دهید
            </p>
          </div>
        ) : (
          <div className="p-2">
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{results.length}</span> نتیجه یافت شد
            </div>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <button
                  key={`${result.index}-${index}`}
                  onClick={() => onResultSelect(result)}
                  className="w-full text-right p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
                >
                  {/* Section Info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Hash className="h-4 w-4 text-primary-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.section.label || `فصل ${result.index + 1}`}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>

                  {/* Match Count */}
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                      {result.matches} مورد
                    </span>
                  </div>

                  {/* Preview Text */}
                  {result.section.content && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 text-justify">
                      {highlightText(
                        result.section.content.substring(0, 150) + '...',
                        searchQuery
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>کلیدهای میانبر:</p>
          <div className="mt-1 space-y-1">
            <div className="flex justify-center space-x-2 space-x-reverse">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">F</kbd>
              <span>برای جستجو</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
