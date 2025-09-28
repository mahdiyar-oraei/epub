'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book, UserReadingStats } from '@/types/api';
import { booksApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import { redirectToLoginWithReturn } from '@/lib/redirect-utils';
import { 
  User, 
  BookOpen, 
  Bookmark, 
  TrendingUp, 
  Clock,
  Calendar,
  Star,
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [readBooks, setReadBooks] = useState<Book[]>([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [userStats, setUserStats] = useState<UserReadingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingBookId, setRemovingBookId] = useState<string | null>(null);

  useEffect(() => {
    // Don't redirect while authentication is still loading
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      redirectToLoginWithReturn();
      return;
    }

    const fetchUserBooks = async () => {
      try {
        // Make API calls independently so one failure doesn't affect others
        const [readResponse, bookmarkedResponse, statsResponse] = await Promise.allSettled([
          booksApi.getReadBooks(1, 6),
          booksApi.getBookmarkedBooks(1, 6),
          booksApi.getUserReadingStats(),
        ]);
        
        console.log('Dashboard: Read books response:', readResponse);
        console.log('Dashboard: Bookmarked books response:', bookmarkedResponse);
        console.log('Dashboard: User stats response:', statsResponse);
        
        // Handle read books response
        if (readResponse.status === 'fulfilled') {
          console.log('Dashboard: Processed books:', readResponse.value);
          setReadBooks(readResponse.value);
        } else {
          console.warn('Failed to fetch read books:', readResponse.reason);
          setReadBooks([]);
        }
        
        // Handle bookmarked books response
        if (bookmarkedResponse.status === 'fulfilled') {
          setBookmarkedBooks(bookmarkedResponse.value.books);
        } else {
          console.warn('Failed to fetch bookmarked books:', bookmarkedResponse.reason);
          setBookmarkedBooks([]);
        }
        
        // Handle user stats response
        if (statsResponse.status === 'fulfilled') {
          console.log('Dashboard: Successfully received user stats:', statsResponse.value);
          setUserStats(statsResponse.value);
        } else {
          console.warn('Failed to fetch user stats:', statsResponse.reason);
          setUserStats(null);
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, [isAuthenticated, authLoading]);

  const handleRemoveBook = async (bookId: string) => {
    if (removingBookId) return; // Prevent multiple concurrent removals
    
    try {
      setRemovingBookId(bookId);
      await booksApi.removeReadingRecord(bookId);
      
      // Remove the book from the local state
      setReadBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      
      // Show success message (optional)
      console.log('Reading record removed successfully');
    } catch (error) {
      console.error('Failed to remove reading record:', error);
      // You could show an error toast here
    } finally {
      setRemovingBookId(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours.toLocaleString('fa-IR')}:${minutes.toLocaleString('fa-IR').padStart(2, '0')}`;
    }
    return `${minutes.toLocaleString('fa-IR')} دقیقه`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  const allUserStatsData = [
    {
      icon: BookOpen,
      label: 'کتاب‌های خوانده شده',
      value: formatNumber(userStats?.totalBooksRead || readBooks?.length || 0),
      rawValue: userStats?.totalBooksRead || readBooks?.length || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Bookmark,
      label: 'کتاب‌های نشان‌گذاری شده',
      value: formatNumber(bookmarkedBooks?.length || 0),
      rawValue: bookmarkedBooks?.length || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Clock,
      label: 'کل زمان مطالعه',
      value: userStats ? formatTime(userStats.totalTimeSpent) : '۰ دقیقه',
      rawValue: userStats?.totalTimeSpent || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: TrendingUp,
      label: 'کتاب‌های این ماه',
      value: formatNumber(userStats?.booksThisMonth || 0),
      rawValue: userStats?.booksThisMonth || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  // Filter out zero-value stats
  const userStatsData = allUserStatsData.filter(stat => stat.rawValue > 0);


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
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
              <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                داشبورد کاربری
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                خوش آمدید، {user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>آخرین بازدید: امروز</span>
          </div>
        </div>

        {/* Stats Cards and Current Reading - Combined Layout */}
        {(userStatsData.length > 0 || readBooks?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {/* Stats Cards */}
            {userStatsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-opacity-20`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Current Reading Card */}
            <div className={`card p-6 ${userStatsData.length > 0 ? 'lg:col-span-2 xl:col-span-2' : 'sm:col-span-2 lg:col-span-4'}`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                کتاب‌های در حال مطالعه
              </h3>
              {readBooks?.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {readBooks?.slice(0, 3).map((book) => {
                    const progress = book.progress || 0;
                    const progressPercentage = Math.round(progress * 100);
                    
                    return (
                      <div key={book.id} className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                          {book.coverImage?.url ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://kianbooks.com'}${book.coverImage.url}`} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {book.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {book.author}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {progressPercentage}% تکمیل شده
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Link
                            href={`/reader/${book.id}`}
                            className="btn btn-primary btn-sm text-xs px-2 py-1"
                          >
                            ادامه
                          </Link>
                          <button
                            onClick={() => handleRemoveBook(book.id)}
                            disabled={removingBookId === book.id}
                            className="btn btn-outline btn-sm text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50"
                            title="حذف از لیست"
                          >
                            {removingBookId === book.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(readBooks?.length || 0) > 3 && (
                    <div className="text-center pt-2">
                      <Link 
                        href="/dashboard/reading-history"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        مشاهده {(readBooks?.length || 0) - 3} کتاب دیگر
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    هنوز کتابی شروع نکرده‌اید
                  </p>
                  <Link href="/library" className="btn btn-outline text-sm mt-2">
                    انتخاب کتاب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recently Read Books - Only show if there are books */}
        {(readBooks?.length || 0) > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              کتاب‌های اخیراً خوانده شده
            </h2>
            <Link
              href="/dashboard/reading-history"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (readBooks?.length || 0) > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {readBooks?.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                هنوز کتابی نخوانده‌اید
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                از کتابخانه ما کتابی انتخاب کنید و شروع به مطالعه کنید
              </p>
              <Link href="/library" className="btn btn-primary">
                مرور کتابخانه
              </Link>
            </div>
          )}
        </div>
        )}

        {/* Bookmarked Books - Only show if there are bookmarked books */}
        {(bookmarkedBooks?.length || 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              کتاب‌های نشان‌گذاری شده
            </h2>
            <Link
              href="/dashboard/bookmarks"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

          {(bookmarkedBooks?.length || 0) > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedBooks?.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                هیچ کتابی نشان‌گذاری نکرده‌اید
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                کتاب‌های مورد علاقه خود را نشان‌گذاری کنید تا بعداً مطالعه کنید
              </p>
              <Link href="/library" className="btn btn-primary">
                مرور کتابخانه
              </Link>
            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
