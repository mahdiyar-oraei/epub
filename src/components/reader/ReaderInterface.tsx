'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import EpubViewer from './EpubViewer';
import { Settings, Bookmark, List, Sun, Moon, Eye, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

const ReaderInterface = () => {
  const [theme, setTheme] = useState('light');
  const [fontFamily, setFontFamily] = useState('vazirmatn');
  const [fontSize, setFontSize] = useState(18);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(50);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('epub-theme') || 'light';
    const savedFontFamily = localStorage.getItem('epub-font-family') || 'vazirmatn';
    const savedFontSize = parseInt(localStorage.getItem('epub-font-size') || '18');
    const savedBookmarks = JSON.parse(localStorage.getItem('epub-bookmarks') || '[]');

    setTheme(savedTheme);
    setFontFamily(savedFontFamily);
    setFontSize(savedFontSize);
    setBookmarks(savedBookmarks);

    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('epub-theme', theme);
    localStorage.setItem('epub-font-family', fontFamily);
    localStorage.setItem('epub-font-size', fontSize.toString());
    localStorage.setItem('epub-bookmarks', JSON.stringify(bookmarks));
  }, [theme, fontFamily, fontSize, bookmarks]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
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
    if (isSettingsOpen || isBookmarksOpen) {
      setIsSettingsOpen(false);
      setIsBookmarksOpen(false);
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
      preview: `نشانک در صفحه ${currentPage} - ${new Date().toLocaleDateString('fa-IR')}`
    };

    setBookmarks([...bookmarks, newBookmark]);
  };

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

  const getControlsClass = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-gray-100 border-gray-700';
      case 'eye-care':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-white text-gray-900 border-gray-200';
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
            fontFamily={fontFamily}
            fontSize={fontSize}
            theme={theme}
            onPageChange={setCurrentPage}
            onTouchNavigation={handleTouchNavigation}
            height="100vh"
          />
        </div>

        {/* Settings Panel */}
        {isSettingsOpen && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${getControlsClass()} shadow-lg`}>
            <div className="space-y-4">
              <h3 className="font-semibold text-right">تنظیمات</h3>
              
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-right">تم</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-2 rounded ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    <Sun size={16} />
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-2 rounded ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    <Moon size={16} />
                  </button>
                  <button
                    onClick={() => handleThemeChange('eye-care')}
                    className={`p-2 rounded ${theme === 'eye-care' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-2 text-right">اندازه فونت</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-sm">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium mb-2 text-right">فونت</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="vazirmatn">وزیر</option>
                  <option value="tahoma">تاهوما</option>
                  <option value="serif">سریف</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks Panel */}
        {isBookmarksOpen && (
          <div className={`fixed top-4 left-4 z-50 p-4 rounded-lg border ${getControlsClass()} shadow-lg w-64`}>
            <h3 className="font-semibold text-right mb-4">نشانک‌ها</h3>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-gray-500 text-right">هیچ نشانکی ثبت نشده</p>
            ) : (
              <div className="space-y-2">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="p-2 rounded border hover:bg-gray-50 cursor-pointer">
                    <div className="text-sm font-medium text-right">{bookmark.title}</div>
                    <div className="text-xs text-gray-500 text-right">{bookmark.preview}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Floating Controls */}
        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-3 rounded-full ${getControlsClass()} shadow-lg hover:shadow-xl transition-shadow`}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
            className={`p-3 rounded-full ${getControlsClass()} shadow-lg hover:shadow-xl transition-shadow`}
          >
            <List size={20} />
          </button>
          <button
            onClick={handleAddBookmark}
            className={`p-3 rounded-full ${getControlsClass()} shadow-lg hover:shadow-xl transition-shadow`}
          >
            <Bookmark size={20} />
          </button>
        </div>

        {/* Navigation Controls (Mobile) */}
        {isMobile && (
          <div className="fixed bottom-4 left-4 z-40 flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`p-3 rounded-full ${getControlsClass()} shadow-lg disabled:opacity-50`}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className={`p-3 rounded-full ${getControlsClass()} shadow-lg disabled:opacity-50`}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}

        {/* Page Progress Indicator */}
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getControlsClass()} shadow-lg`}>
            {currentPage} از {totalPages}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReaderInterface;
