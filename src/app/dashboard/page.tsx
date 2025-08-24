'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book, UserReadingStats } from '@/types/api';
import { booksApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import { 
  User, 
  BookOpen, 
  Bookmark, 
  TrendingUp, 
  Clock,
  Calendar,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [readBooks, setReadBooks] = useState<Book[]>([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [userStats, setUserStats] = useState<UserReadingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    const fetchUserBooks = async () => {
      try {
        const [readResponse, bookmarkedResponse, statsResponse] = await Promise.all([
          booksApi.getReadBooks(1, 6),
          booksApi.getBookmarkedBooks(1, 6),
          booksApi.getUserReadingStats(),
        ]);
        
        setReadBooks(readResponse.books);
        setBookmarkedBooks(bookmarkedResponse.books);
        setUserStats(statsResponse);
      } catch (error) {
        console.error('Error fetching user books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, [isAuthenticated]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours.toLocaleString('fa-IR')}:${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes.toLocaleString('fa-IR')} دقیقه`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  const userStatsData = [
    {
      icon: BookOpen,
      label: 'کتاب‌های خوانده شده',
      value: formatNumber(userStats?.totalBooksRead || readBooks.length),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Bookmark,
      label: 'کتاب‌های نشان‌گذاری شده',
      value: formatNumber(bookmarkedBooks.length),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Clock,
      label: 'کل زمان مطالعه',
      value: userStats ? formatTime(userStats.totalTimeSpent) : '۰ دقیقه',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: TrendingUp,
      label: 'کتاب‌های این ماه',
      value: formatNumber(userStats?.booksThisMonth || 0),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (!isAuthenticated) {
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Reading Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Daily Reading Goal */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              آمار مطالعه این ماه
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">زمان مطالعه</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {userStats ? formatTime(userStats.timeThisMonth) : '۰ دقیقه'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">کتاب‌های خوانده شده</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatNumber(userStats?.booksThisMonth || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">متوسط زمان مطالعه</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {userStats ? formatTime(userStats.averageReadingTime) : '۰ دقیقه'}
                </span>
              </div>
            </div>
          </div>

          {/* Reading Streak */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              پیوستگی مطالعه
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {formatNumber(userStats?.currentStreak || 0)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                روز متوالی مطالعه
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">بهترین رکورد:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumber(userStats?.longestStreak || 0)} روز
                  </span>
                </div>
                <div className="flex justify-center">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 mx-1 ${
                        i < Math.min(userStats?.currentStreak || 0, 7) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Reading */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              در حال مطالعه
            </h3>
            {readBooks.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {readBooks[0].title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {readBooks[0].author}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                      <div className="bg-primary-600 h-1 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ۶۵% تکمیل شده
                    </p>
                  </div>
                </div>
                <Link
                  href={`/reader/${readBooks[0].id}`}
                  className="btn btn-primary w-full text-sm"
                >
                  ادامه مطالعه
                </Link>
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

        {/* Recently Read Books */}
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
          ) : readBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {readBooks.map((book) => (
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

        {/* Bookmarked Books */}
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

          {bookmarkedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedBooks.map((book) => (
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

        {/* Ad Placeholder */}
        <div className="mt-12">
          <div className="ad-placeholder">
            <p>فضای تبلیغاتی</p>
          </div>
        </div>
      </div>
    </div>
  );
}
