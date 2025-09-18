'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import SettingsMenu from './src/pages/epub-reader-interface/components/SettingsMenu';
import BookmarkPanel from './src/pages/epub-reader-interface/components/BookmarkPanel';
import NavigationControls from './src/pages/epub-reader-interface/components/NavigationControls';
import EpubViewer from './src/pages/epub-reader-interface/components/EpubViewer';
import Icon from './src/components/AppIcon';

const ReaderInterface = () => {
  // Theme state - now includes eye care mode
  const [theme, setTheme] = useState('light');
  
  // Reading preferences
  const [fontFamily, setFontFamily] = useState('vazirmatn');
  const [fontSize, setFontSize] = useState(18);
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(50); // Mock total pages
  
  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  
  // Device detection
  const [isMobile, setIsMobile] = useState(false);
  
  // Panel control states for click-outside functionality
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isBookmarksExpanded, setIsBookmarksExpanded] = useState(false);
  
  // Refs for click outside detection
  const settingsRef = useRef(null);
  const bookmarksRef = useRef(null);
  const epubViewerRef = useRef(null);

  // Initialize theme and preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('epub-theme') || 'light';
    const savedFontFamily = localStorage.getItem('epub-font-family') || 'vazirmatn';
    const savedFontSize = parseInt(localStorage.getItem('epub-font-size') || '18');
    const savedBookmarks = JSON.parse(localStorage.getItem('epub-bookmarks') || '[]');

    setTheme(savedTheme);
    setFontFamily(savedFontFamily);
    setFontSize(savedFontSize);
    setBookmarks(savedBookmarks);

    // Apply theme to document
    document.documentElement?.classList?.remove('dark', 'eye-care');
    if (savedTheme === 'dark') {
      document.documentElement?.classList?.add('dark');
    } else if (savedTheme === 'eye-care') {
      document.documentElement?.classList?.add('eye-care');
    }

    // Check if mobile
    setIsMobile(window.innerWidth < 768);

    // Handle resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('epub-theme', theme);
    localStorage.setItem('epub-font-family', fontFamily);
    localStorage.setItem('epub-font-size', fontSize?.toString());
    localStorage.setItem('epub-bookmarks', JSON.stringify(bookmarks));
  }, [theme, fontFamily, fontSize, bookmarks]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Auto-close all other dialogs when one opens
      if (isSettingsExpanded && isBookmarksExpanded) {
        setIsBookmarksExpanded(false);
      }
      if (isBookmarksExpanded && isSettingsExpanded) {
        setIsSettingsExpanded(false);
      }

      // Check if click is outside settings panel
      if (settingsRef?.current && !(settingsRef?.current as any)?.contains(event?.target) && isSettingsExpanded) {
        setIsSettingsExpanded(false);
      }
      
      // Check if click is outside bookmarks panel
      if (bookmarksRef?.current && !(bookmarksRef?.current as any)?.contains(event?.target) && isBookmarksExpanded) {
        setIsBookmarksExpanded(false);
      }

    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSettingsExpanded, isBookmarksExpanded]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement?.classList?.remove('dark', 'eye-care');
    if (newTheme === 'dark') {
      document.documentElement?.classList?.add('dark');
    } else if (newTheme === 'eye-care') {
      document.documentElement?.classList?.add('eye-care');
    }
  };

  const handleFontFamilyChange = (newFontFamily: string) => {
    setFontFamily(newFontFamily);
  };

  const handleFontSizeChange = (newFontSize: number) => {
    setFontSize(newFontSize);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleTouchNavigation = (direction: string) => {
    // Close any open panels when navigating
    if (isSettingsExpanded || isBookmarksExpanded) {
      setIsSettingsExpanded(false);
      setIsBookmarksExpanded(false);
      return;
    }
    
    if (direction === 'prev') {
      handlePrevPage();
    } else if (direction === 'next') {
      handleNextPage();
    }
  };

  const handleAddBookmark = () => {
    const newBookmark = {
      id: Date.now(),
      page: currentPage,
      timestamp: new Date(),
      title: `صفحه ${currentPage}`,
      preview: `نشانک در صفحه ${currentPage} - ${new Date()?.toLocaleDateString('fa-IR')}`
    };

    setBookmarks([...bookmarks, newBookmark]);
  };

  const handleNavigateToBookmark = (bookmark: any) => {
    setCurrentPage(bookmark?.page);
  };

  const handleDeleteBookmark = (bookmarkId: any) => {
    setBookmarks(bookmarks?.filter(bookmark => bookmark?.id !== bookmarkId));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleNavigateToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Get theme-specific background colors
  const getBackgroundClass = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900';
      case 'eye-care':
        return 'bg-amber-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <>
      <Head>
        <title>EPUB Reader - خواننده کتاب الکترونیک</title>
        <meta name="description" content="خواننده کتاب الکترونیک با پشتیبانی از زبان فارسی و امکانات پیشرفته" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0" />
      </Head>

      <div className={`min-h-screen transition-colors duration-300 ${getBackgroundClass()}`}>
        {/* Main Content Area */}
        <div className="relative">
          <EpubViewer
            ref={epubViewerRef}
            fontFamily={fontFamily}
            fontSize={fontSize}
            theme={theme}
            onPageChange={handlePageChange}
            onTouchNavigation={handleTouchNavigation}
            height="100vh"
          />
        </div>

        {/* Settings Menu */}
        <SettingsMenu
          ref={settingsRef}
          theme={theme}
          onThemeChange={handleThemeChange}
          fontFamily={fontFamily}
          onFontFamilyChange={handleFontFamilyChange}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          currentPage={currentPage}
          onNavigateToPage={handleNavigateToPage}
          isExpanded={isSettingsExpanded}
          onToggleExpanded={setIsSettingsExpanded}
          isMobile={isMobile}
        />

        {/* Bookmark Panel */}
        <BookmarkPanel
          ref={bookmarksRef}
          bookmarks={bookmarks}
          onNavigateToBookmark={handleNavigateToBookmark}
          onDeleteBookmark={handleDeleteBookmark}
          isExpanded={isBookmarksExpanded}
          onToggleExpanded={setIsBookmarksExpanded}
          isMobile={isMobile}
        />

        {/* Navigation Controls (Mobile Only) */}
        <NavigationControls
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onAddBookmark={handleAddBookmark}
          canGoPrev={currentPage > 1}
          canGoNext={currentPage < totalPages}
          isMobile={isMobile}
          theme={theme}
        />

        {/* Desktop Bookmark Button */}
        {!isMobile && (
          <div className="fixed top-20 right-6 z-40">
            <button
              onClick={handleAddBookmark}
              className={`w-12 h-12 rounded-lg backdrop-blur-sm border shadow-lg transition-all duration-300 flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-800/95 border-slate-700/50 hover:bg-slate-700/70 text-slate-200'
                  : theme === 'eye-care' ? 'bg-amber-100/95 border-amber-300/50 hover:bg-amber-200/70 text-amber-800'
                  : 'bg-white/95 border-gray-200/50 hover:bg-gray-100/70 text-gray-700'
              }`}
              title="افزودن نشانک"
            >
              <Icon name="BookmarkPlus" size={20} />
            </button>
          </div>
        )}

        {/* Page Progress Indicator */}
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40">
          <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border transition-colors ${
            theme === 'dark' ?'bg-slate-800/80 text-slate-200 border-slate-700/50'
              : theme === 'eye-care' ?'bg-amber-100/80 text-amber-800 border-amber-300/50' :'bg-white/80 text-gray-700 border-gray-200/50'
          }`}>
            {currentPage} از {totalPages}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid var(--color-background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid var(--color-background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .epub-content h1 {
          font-size: 1.8em;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: inherit;
        }

        .epub-content h2 {
          font-size: 1.4em;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          color: inherit;
        }

        .epub-content p {
          margin-bottom: 1.2rem;
          text-align: justify;
          line-height: inherit;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .epub-content {
            padding: 1rem !important;
            font-size: 16px !important;
          }
          
          .epub-content h1 {
            font-size: 1.5em !important;
            margin-bottom: 1rem !important;
          }
          
          .epub-content h2 {
            font-size: 1.3em !important;
            margin: 1.5rem 0 0.8rem 0 !important;
          }
          
          .epub-content p {
            margin-bottom: 1rem !important;
            line-height: 1.6 !important;
          }
        }
      `}</style>
    </>
  );
};

export default ReaderInterface;
