'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book, User, Category, ReadingAnalytics, VisitMetrics } from '@/types/api';
import { adminApi, booksApi, categoriesApi } from '@/lib/api';
import {
  Users,
  BookOpen,
  Eye,
  Clock,
  PlusCircle,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [readingAnalytics, setReadingAnalytics] = useState<ReadingAnalytics | null>(null);
  const [visitMetrics, setVisitMetrics] = useState<VisitMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [usersResponse, booksResponse, categoriesResponse, analyticsResponse, visitMetricsResponse] = await Promise.all([
          adminApi.getUsers(1, 10),
          booksApi.getBooks({ limit: 10 }),
          categoriesApi.getCategories(),
          adminApi.getReadingAnalytics(),
          adminApi.getVisitMetrics(),
        ]);
        
        setUsers(usersResponse.users);
        setBooks(booksResponse.books);
        setCategories(categoriesResponse);
        setReadingAnalytics(analyticsResponse.analytics);
        setVisitMetrics(visitMetricsResponse.metrics);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, user]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${formatNumber(hours)} ساعت و ${formatNumber(minutes)} دقیقه`;
    }
    return `${formatNumber(minutes)} دقیقه`;
  };

  const adminStats = [
    {
      icon: Users,
      label: 'کل کاربران',
      value: formatNumber(users.length),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: BookOpen,
      label: 'کل کتاب‌ها',
      value: formatNumber(books.length),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Eye,
      label: 'بازدید امروز',
      value: visitMetrics ? formatNumber(visitMetrics.todayVisits) : '۰',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Clock,
      label: 'کل زمان مطالعه',
      value: readingAnalytics ? formatTime(readingAnalytics.totalTimeSpent/1000) : '۰ دقیقه',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const additionalStats = [
    {
      icon: Users,
      label: 'کاربران فعال در مطالعه',
      value: readingAnalytics ? formatNumber(readingAnalytics.totalUsersReading) : '۰',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: BookOpen,
      label: 'کتاب‌های باز شده',
      value: readingAnalytics ? formatNumber(readingAnalytics.totalBooksOpened) : '۰',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    {
      icon: Eye,
      label: 'بازدید ۷ روز گذشته',
      value: visitMetrics ? formatNumber(visitMetrics.last7DaysVisits) : '۰',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      icon: Calendar,
      label: 'بازدید ۳۰ روز گذشته',
      value: visitMetrics ? formatNumber(visitMetrics.last30DaysVisits) : '۰',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  // Generate recent activities from top read books (filter out null books)
  const recentActivities = readingAnalytics?.topReadBooks
    ?.filter(bookData => bookData && bookData.book && bookData.book.title)
    ?.slice(0, 5)
    ?.map((bookData, index) => ({
      id: index + 1,
      user: `${formatNumber(bookData.readCount)} کاربر`,
      action: 'در حال مطالعه',
      target: bookData.book.title,
      time: `${formatTime(bookData.totalTimeSpent/1000)} کل زمان مطالعه`,
    })) || [];

  // Filter admin stats to only show non-zero values
  const filteredAdminStats = adminStats.filter(stat => {
    const value = stat.value;
    // Check if value is not '۰' (Persian zero)
    return value !== '۰' && value !== '۰ دقیقه';
  });

  // Filter additional stats to only show non-zero values  
  const filteredAdditionalStats = additionalStats.filter(stat => {
    const value = stat.value;
    return value !== '۰' && value !== '۰ دقیقه';
  });

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              داشبورد مدیریت
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              مدیریت کتابخانه الکترونیک
            </p>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">

            <Link
              href="/admin/books"
              className="btn btn-primary flex items-center space-x-2 space-x-reverse"
            >
              <PlusCircle className="h-4 w-4" />
              <span>مدیریت کتاب‌ها</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Only show non-zero values */}
        {filteredAdminStats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {filteredAdminStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-opacity-20`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="mr-4 flex-1">
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
        )}

        {/* Additional Analytics Stats - Only show non-zero values */}
        {filteredAdditionalStats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {filteredAdditionalStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-opacity-20`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="mr-4 flex-1">
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              عملیات سریع
            </h3>
            <div className="space-y-3">
              <Link
                href="/admin/books"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900 dark:text-white">مدیریت کتاب‌ها</span>
                </div>
              </Link>
              
              <Link
                href="/admin/users"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Users className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900 dark:text-white">مدیریت کاربران</span>
                </div>
              </Link>
              
              <Link
                href="/admin/categories"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900 dark:text-white">دسته‌بندی‌ها</span>
                </div>
              </Link>
              
              <Link
                href="/admin/analytics"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900 dark:text-white">آمار و گزارشات</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Popular Books - Only show if there are activities */}
          {recentActivities.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                محبوب‌ترین کتاب‌ها
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action}{' '}
                      {activity.target && (
                        <span className="font-medium">{activity.target}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/analytics"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                مشاهده آمار کامل
              </Link>
            </div>
          </div>
          )}

          {/* System Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              وضعیت سیستم
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">سرور</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  آنلاین
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">پایگاه داده</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  آنلاین
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">فضای ذخیره‌سازی</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">۷۸%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">آخرین بک‌آپ</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">۲ ساعت پیش</span>
              </div>
            </div>
          </div>
        </div>



        {/* Recent Books */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              کتاب‌های اخیراً اضافه شده
            </h2>
            <Link
              href="/admin/books"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.slice(0, 4).map((book) => (
                <div key={book.id} className="card p-4">
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-lg mb-3">
                    {book.coverImage?.url ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://kianbooks.com'}${book.coverImage.url}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {book.author}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(book.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                    <Link
                      href={`/admin/books/${book.id}`}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      ویرایش
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ad Placeholder */}
        <div className="ad-placeholder">
          <p>فضای تبلیغاتی مدیریت</p>
        </div>
      </div>
    </div>
  );
}
