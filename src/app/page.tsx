'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, Category } from '@/types/api';
import { booksApi, categoriesApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import BookFilters from '@/components/books/BookFilters';
import Hero from '@/components/home/Hero';
import { BookOpen, TrendingUp, Users, Star } from 'lucide-react';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching books and categories...');
        const [booksResponse, categoriesResponse] = await Promise.all([
          booksApi.getBooks({ limit: 12 }),
          categoriesApi.getCategories(),
        ]);
        
        console.log('Books response:', booksResponse);
        console.log('Categories response:', categoriesResponse);
        
        setBooks(booksResponse.books);
        setTotalBooks(booksResponse.totalBooks);
        setCategories(categoriesResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Show error state when API fails
        setBooks([]);
        setTotalBooks(0);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      icon: Users,
      label: 'کاربران فعال',
      value: '۱,۲۳۴',
      color: 'text-green-600',
    },
    {
      icon: TrendingUp,
      label: 'بازدید ماهانه',
      value: '۱۰,۵۶۷',
      color: 'text-purple-600',
    },
    {
      icon: Star,
      label: 'امتیاز رضایت',
      value: '۴.۸',
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
                {books.length === 0 && totalBooks === 0 ? 'خطا در بارگذاری کتاب‌ها' : 'کتابی یافت نشد'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {books.length === 0 && totalBooks === 0 
                  ? 'لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید'
                  : 'با فیلترهای مختلف جستجو کنید'
                }
              </p>
              {books.length === 0 && totalBooks === 0 && (
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 btn btn-primary"
                >
                  تلاش مجدد
                </button>
              )}
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

      {/* Ad Placeholder */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ad-placeholder">
            <p>فضای تبلیغاتی</p>
          </div>
        </div>
      </section>
    </div>
  );
}
