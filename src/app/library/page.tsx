'use client';

import { useEffect, useState } from 'react';
import { Book, Category } from '@/types/api';
import { booksApi, categoriesApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import BookFilters from '@/components/books/BookFilters';
import { BookOpen, Grid, List } from 'lucide-react';

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFilters, setCurrentFilters] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await categoriesApi.getCategories();
        setCategories(categoriesResponse);
        
        await fetchBooks({});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchBooks = async (filters: any, page = 1) => {
    setIsLoading(true);
    try {
      const response = await booksApi.getBooks({ 
        ...filters, 
        page, 
        limit: viewMode === 'grid' ? 12 : 10 
      });
      setBooks(response.books);
      setTotalBooks(response.totalBooks);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (filters: any) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
    fetchBooks(filters, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBooks(currentFilters, page);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    // Refetch with different limit based on view mode
    fetchBooks(currentFilters, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            کتابخانه الکترونیک
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {totalBooks.toLocaleString('fa-IR')} کتاب موجود
            </p>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                aria-label="نمایش شبکه‌ای"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                aria-label="نمایش لیستی"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <BookFilters 
            categories={categories}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Books Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: viewMode === 'grid' ? 12 : 10 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                {viewMode === 'grid' ? (
                  <>
                    <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </>
                ) : (
                  <div className="card p-4 flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                    <div className="w-24 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {books.map((book) => (
                  <div key={book.id} className="card p-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {/* Book Cover */}
                      <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                      
                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {book.author}
                        </p>
                        {book.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {book.description}
                          </p>
                        )}
                        
                        {/* Categories */}
                        {book.categories && book.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {book.categories.slice(0, 3).map((category) => (
                              <span
                                key={category.id}
                                className="inline-block px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full"
                              >
                                {category.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-2 flex-shrink-0">
                        <button className="btn btn-primary text-sm px-4 py-2">
                          شروع مطالعه
                        </button>
                        <button className="btn btn-outline text-sm px-4 py-2">
                          جزئیات
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  قبلی
                </button>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page.toLocaleString('fa-IR')}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
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
              کتابی یافت نشد
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              فیلترهای مختلف را امتحان کنید
            </p>
          </div>
        )}

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
