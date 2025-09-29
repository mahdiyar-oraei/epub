'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book } from '@/types/api';
import { booksApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import { redirectToLoginWithReturn } from '@/lib/redirect-utils';
import { 
  ArrowRight,
  BookOpen, 
  Calendar,
  Clock,
  TrendingUp,
  User,
  Filter,
  Search,
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function ReadingHistoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [readBooks, setReadBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removingBookId, setRemovingBookId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress'>('recent');

  useEffect(() => {
    // Don't redirect while authentication is still loading
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      redirectToLoginWithReturn();
      return;
    }

    const fetchReadingHistory = async () => {
      try {
        setIsLoading(true);
        const response = await booksApi.getReadBooks(currentPage, 12);
        setReadBooks(response);
        // For now, we'll assume there are more pages if we get 12 books
        setTotalPages(response.length === 12 ? currentPage + 1 : currentPage);
      } catch (error) {
        console.error('Error fetching reading history:', error);
        setReadBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadingHistory();
  }, [isAuthenticated, authLoading, currentPage]);

  const handleRemoveBook = async (bookId: string) => {
    if (removingBookId) return; // Prevent multiple concurrent removals
    
    try {
      setRemovingBookId(bookId);
      await booksApi.removeReadingRecord(bookId);
      
      // Remove the book from the local state
      setReadBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      
      console.log('Reading record removed successfully');
    } catch (error) {
      console.error('Failed to remove reading record:', error);
    } finally {
      setRemovingBookId(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const totalHours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    
    if (totalHours > 0 && remainingMinutes > 0) {
      return `${totalHours.toLocaleString('fa-IR')} ساعت و ${remainingMinutes.toLocaleString('fa-IR')} دقیقه`;
    } else if (totalHours > 0) {
      return `${totalHours.toLocaleString('fa-IR')} ساعت`;
    } else if (remainingMinutes > 0) {
      return `${remainingMinutes.toLocaleString('fa-IR')} دقیقه`;
    } else {
      return '۰ دقیقه';
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  // Filter and sort books
  const filteredBooks = readBooks
    .filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'recent':
        default:
          // Assuming more recent books have higher IDs or we can sort by a date field
          return b.id.localeCompare(a.id);
      }
    });

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  // Additional check to ensure user data is available
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link 
                href="/dashboard"
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  تاریخچه مطالعه
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  تمام کتاب‌های مطالعه شده شما
                </p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">کل کتاب‌ها</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(readBooks.length)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">تکمیل شده</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(readBooks.filter(book => (book.progress || 0) >= 1).length)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">در حال مطالعه</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(readBooks.filter(book => (book.progress || 0) > 0 && (book.progress || 0) < 1).length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در کتاب‌ها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'progress')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="recent">جدیدترین</option>
                <option value="title">نام کتاب</option>
                <option value="progress">درصد پیشرفت</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="relative group">
                  <BookCard book={book} />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveBook(book.id)}
                    disabled={removingBookId === book.id}
                    className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                    title="حذف از تاریخچه"
                  >
                    {removingBookId === book.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 space-x-reverse mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  قبلی
                </button>
                
                <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  صفحه {currentPage} از {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'هیچ کتابی یافت نشد' : 'هیچ کتابی در تاریخچه شما نیست'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'سعی کنید کلمات کلیدی مختلفی جستجو کنید'
                : 'شروع به مطالعه کنید تا کتاب‌های شما اینجا نمایش داده شوند'
              }
            </p>
            {!searchTerm && (
              <Link href="/library" className="btn btn-primary">
                مرور کتابخانه
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
