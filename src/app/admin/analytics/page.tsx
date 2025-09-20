'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ReadingAnalytics, VisitMetrics } from '@/types/api';
import { adminApi } from '@/lib/api';
import {
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Eye,
  Calendar,
  BarChart3,
  ArrowLeft,
  Download,
  RefreshCw,
  Activity,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [readingAnalytics, setReadingAnalytics] = useState<ReadingAnalytics | null>(null);
  const [visitMetrics, setVisitMetrics] = useState<VisitMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    fetchAnalytics();
  }, [isAuthenticated, user]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [analyticsResponse, metricsResponse] = await Promise.all([
        adminApi.getReadingAnalytics().catch(() => ({ analytics: null })),
        adminApi.getVisitMetrics().catch(() => ({ metrics: null })),
      ]);
      
      console.log('Full analytics response:', analyticsResponse);
      console.log('Full metrics response:', metricsResponse);
      
      if (analyticsResponse && analyticsResponse.analytics) {
        console.log('Reading analytics data:', analyticsResponse.analytics);
        console.log('Total time spent:', analyticsResponse.analytics.totalTimeSpent);
        console.log('Total books opened:', analyticsResponse.analytics.totalBooksOpened);
        console.log('Total users reading:', analyticsResponse.analytics.totalUsersReading);
        console.log('Top read books:', analyticsResponse.analytics.topReadBooks);
      }
      
      if (metricsResponse && metricsResponse.metrics) {
        console.log('Visit metrics data:', metricsResponse.metrics);
      }
      
      // Handle different response structures
      let readingData = null;
      if (analyticsResponse && 'analytics' in analyticsResponse) {
        if (analyticsResponse.analytics) {
          readingData = analyticsResponse.analytics;
        }
      } else if (analyticsResponse && typeof analyticsResponse === 'object' && analyticsResponse !== null) {
        // Direct response without analytics wrapper
        const response = analyticsResponse as any;
        if (response.totalTimeSpent !== undefined) {
          readingData = response;
        }
      }
      
      // Validate the data structure
      if (readingData) {
        console.log('Processed reading data:', readingData);
        console.log('Data validation:');
        console.log('- totalTimeSpent:', readingData.totalTimeSpent, 'type:', typeof readingData.totalTimeSpent);
        console.log('- totalBooksOpened:', readingData.totalBooksOpened, 'type:', typeof readingData.totalBooksOpened);
        console.log('- totalUsersReading:', readingData.totalUsersReading, 'type:', typeof readingData.totalUsersReading);
        console.log('- topReadBooks:', readingData.topReadBooks, 'type:', typeof readingData.topReadBooks);
      }
      
      setReadingAnalytics(readingData);
      setVisitMetrics(metricsResponse?.metrics || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    // Ensure num is a valid number
    if (typeof num !== 'number' || isNaN(num)) {
      console.warn('formatNumber received invalid value:', num);
      return '۰';
    }
    return num.toLocaleString('fa-IR');
  };

  const formatTime = (seconds: number): string => {
    // Ensure seconds is a valid number
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      console.warn('formatTime received invalid value:', seconds);
      return '۰ دقیقه';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours.toLocaleString('fa-IR')}:${minutes.toLocaleString('fa-IR').padStart(2, '۰')}`;
    }
    return `${minutes.toLocaleString('fa-IR')} دقیقه`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href="/admin"
              className="btn btn-outline btn-sm flex items-center space-x-2 space-x-reverse"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>بازگشت</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                آمار و تحلیل‌ها
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                تحلیل جامع عملکرد سیستم و کاربران
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="btn btn-outline flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>بروزرسانی</span>
            </button>
            <button className="btn btn-primary flex items-center space-x-2 space-x-reverse">
              <Download className="h-4 w-4" />
              <span>دانلود گزارش</span>
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            آخرین بروزرسانی: {formatDate(lastUpdated)}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card p-12 mb-8 text-center">
            <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              در حال بارگذاری آمار...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              لطفاً صبر کنید تا داده‌ها بارگذاری شوند
            </p>
          </div>
        )}



        {/* Overview Stats */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">کل کتاب‌های باز شده</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {readingAnalytics ? formatNumber(readingAnalytics.totalBooksOpened) : '۰'}
                </p>

              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 dark:bg-opacity-20">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">کاربران فعال</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {readingAnalytics ? formatNumber(readingAnalytics.totalUsersReading) : '۰'}
                </p>

              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 dark:bg-opacity-20">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">کل زمان مطالعه</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {readingAnalytics ? formatTime(readingAnalytics.totalTimeSpent) : '۰ دقیقه'}
                </p>

              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 dark:bg-opacity-20">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">کل بازدیدها</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {visitMetrics ? formatNumber(visitMetrics.totalVisits) : '۰'}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Reading Analytics */}
        {!isLoading && readingAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Read Books */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  پرخواننده‌ترین کتاب‌ها
                </h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {readingAnalytics.topReadBooks
                  .filter(item => item && item.book && item.book.title) // Filter out null/undefined items
                  .slice(0, 5)
                  .map((item, index) => (
                  <div key={item.book.id} className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.book.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.book.author} • {formatNumber(item.readCount)} خواننده
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(item.totalTimeSpent)}
                    </div>
                  </div>
                ))}
                {/* Show message if no valid books */}
                {readingAnalytics.topReadBooks.filter(item => item && item.book && item.book.title).length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p>هیچ کتابی برای نمایش وجود ندارد</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reading Trends */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  روند مطالعه
                </h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">متوسط زمان مطالعه</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {readingAnalytics.totalUsersReading > 0 
                      ? formatTime(Math.floor(readingAnalytics.totalTimeSpent / readingAnalytics.totalUsersReading))
                      : '۰ دقیقه'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">نسبت کاربران فعال</span>
                  <span className="text-lg font-semibold text-green-600">
                    {readingAnalytics.totalUsersReading > 0 ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">کتاب‌های محبوب</span>
                  <span className="text-lg font-semibold text-purple-600">
                    {readingAnalytics.topReadBooks.filter(item => item && item.book && item.book.title).length > 0 ? 'بله' : 'خیر'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visit Metrics */}
        {!isLoading && visitMetrics && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                آمار بازدیدها
              </h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatNumber(visitMetrics.totalVisits)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">کل بازدیدها</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatNumber(visitMetrics.todayVisits)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">بازدید امروز</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatNumber(visitMetrics.last7DaysVisits)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">۷ روز گذشته</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {formatNumber(visitMetrics.last30DaysVisits)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">۳۰ روز گذشته</div>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!readingAnalytics && !visitMetrics && !isLoading && (
          <div className="card p-12 mb-8 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              داده‌ای برای نمایش وجود ندارد
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              در حال حاضر آمار یا متریک‌هایی برای نمایش وجود ندارد
            </p>
            <button
              onClick={fetchAnalytics}
              className="btn btn-primary"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Performance Metrics */}
        {!isLoading && readingAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Reading Statistics */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                آمار مطالعه
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">متوسط زمان مطالعه</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {readingAnalytics.totalUsersReading > 0 
                      ? formatTime(Math.floor(readingAnalytics.totalTimeSpent / readingAnalytics.totalUsersReading))
                      : '۰ دقیقه'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">نسبت کاربران فعال</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {readingAnalytics.totalUsersReading > 0 ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">کتاب‌های محبوب</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {readingAnalytics.topReadBooks.filter(item => item && item.book && item.book.title).length > 0 ? 'بله' : 'خیر'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Performance */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                عملکرد محتوا
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">کتاب‌های محبوب</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {readingAnalytics.topReadBooks.filter(item => item && item.book && item.book.title).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">کل زمان مطالعه</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTime(readingAnalytics.totalTimeSpent)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">کاربران فعال</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(readingAnalytics.totalUsersReading)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                آمار سریع
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">کتاب‌های باز شده</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(readingAnalytics.totalBooksOpened)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">میانگین خواننده</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {readingAnalytics.topReadBooks.filter(item => item && item.book && item.book.title).length > 0 
                      ? formatNumber(Math.floor(readingAnalytics.totalUsersReading / readingAnalytics.topReadBooks.filter(item => item && item.book && item.book.title).length))
                      : '۰'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">وضعیت سیستم</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    آنلاین
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        {!isLoading && (readingAnalytics || visitMetrics) && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              گزینه‌های خروجی
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="btn btn-outline flex items-center justify-center space-x-2 space-x-reverse">
                <Download className="h-4 w-4" />
                <span>گزارش PDF</span>
              </button>
              <button className="btn btn-outline flex items-center justify-center space-x-2 space-x-reverse">
                <Download className="h-4 w-4" />
                <span>گزارش Excel</span>
              </button>
              <button className="btn btn-outline flex items-center justify-center space-x-2 space-x-reverse">
                <Download className="h-4 w-4" />
                <span>داده‌های JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
