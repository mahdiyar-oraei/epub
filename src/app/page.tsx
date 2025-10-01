'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, Category, VisitMetrics } from '@/types/api';
import { booksApi, categoriesApi, adminApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import BookFilters from '@/components/books/BookFilters';
import Hero from '@/components/home/Hero';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, TrendingUp, Users, Star } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [visitMetrics, setVisitMetrics] = useState<VisitMetrics | null>(null);
  const [userReadBooks, setUserReadBooks] = useState<Book[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksResponse, categoriesResponse, visitMetricsResponse] = await Promise.all([
          booksApi.getBooks({ limit: 12 }),
          categoriesApi.getCategories(),
          adminApi.getVisitMetrics().catch(() => ({ metrics: null })),
        ]);
        
        setBooks(booksResponse.books);
        setTotalBooks(booksResponse.totalBooks);
        setCategories(categoriesResponse);
        setVisitMetrics(visitMetricsResponse?.metrics || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch user reading data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        setIsLoadingUserData(true);
        try {
          const readResponse = await booksApi.getReadBooks(1, 6);
          setUserReadBooks(readResponse);
        } catch (error) {
          console.error('Error fetching user reading data:', error);
          setUserReadBooks([]);
        } finally {
          setIsLoadingUserData(false);
        }
      };

      fetchUserData();
    }
  }, [isAuthenticated]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  const handleFiltersChange = async (filters: any) => {
    setIsLoading(true);
    try {
      const response = await booksApi.getBooks(filters);
      setBooks(response.books);
      setTotalBooks(response.totalBooks);
    } catch (error) {
      console.error('Error filtering books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: BookOpen,
      label: 'کتاب‌های موجود',
      value: totalBooks.toLocaleString('fa-IR'),
      color: 'text-blue-600',
    },
    {
      icon: TrendingUp,
      label: 'بازدید امروز',
      value: visitMetrics ? visitMetrics.todayVisits.toLocaleString('fa-IR') : '۰',
      color: 'text-green-600',
    },
    {
      icon: Users,
      label: 'بازدید ۳۰ روز',
      value: visitMetrics ? visitMetrics.last30DaysVisits.toLocaleString('fa-IR') : '۰',
      color: 'text-purple-600',
    },
    {
      icon: Star,
      label: 'کل بازدیدها',
      value: visitMetrics ? visitMetrics.totalVisits.toLocaleString('fa-IR') : '۰',
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Reading Section - Only show for authenticated users */}
      {isAuthenticated && userReadBooks.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ادامه مطالعه
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                کتاب‌هایی که در حال مطالعه آنها هستید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userReadBooks.slice(0, 3).map((book) => {
                const progress = book.progress || 0;
                const progressPercentage = Math.round(progress * 100);
                
                return (
                  <div 
                    key={book.id} 
                    className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                  >
                    {/* Gradient Background Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    {/* Content */}
                    <div className="relative p-6">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        {/* Book Cover */}
                        <div className="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {book.coverImage?.url ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://kianbooks.com'}${book.coverImage.url}`} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {book.title}
                          </h3>
                          
                          {/* {book.authors && book.authors.length > 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {book.authors.map(author => author.name).join('، ')}
                            </p>
                          )} */}
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                پیشرفت مطالعه
                              </span>
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Continue Reading Button */}
                          <Link 
                            href={`/reader/${book.id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <BookOpen className="h-4 w-4 ml-2" />
                            ادامه مطالعه
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Reading History Button */}
            {userReadBooks.length > 3 && (
              <div className="text-center mt-8">
                <Link
                  href="/dashboard/reading-history"
                  className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  <BookOpen className="h-5 w-5 ml-2" />
                  مشاهده همه کتاب‌های خوانده شده
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Books Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              کتاب‌های پیشنهادی
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              مجموعه‌ای از بهترین کتاب‌های الکترونیک را مطالعه کنید
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <BookFilters 
              categories={categories}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Books Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                کتابی یافت نشد
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                با فیلترهای مختلف جستجو کنید
              </p>
            </div>
          )}

          {/* View All Books Button */}
          {books.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/library"
                className="btn btn-primary inline-flex items-center space-x-2 space-x-reverse"
              >
                <BookOpen className="h-5 w-5" />
                <span>مشاهده همه کتاب‌ها</span>
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
