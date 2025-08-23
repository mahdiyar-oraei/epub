'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book, Category, File } from '@/types/api';
import { adminApi, booksApi, categoriesApi } from '@/lib/api';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Eye,
  Filter,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminBooksPage() {
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    categories: [] as string[],
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    fetchData();
  }, [isAuthenticated, user, currentPage, searchTerm, selectedCategory]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [booksResponse, categoriesResponse] = await Promise.all([
        booksApi.getBooks({
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
          page: currentPage,
          limit: 10,
        }),
        categoriesApi.getCategories(),
      ]);
      
      setBooks(booksResponse.books);
      setTotalBooks(booksResponse.totalBooks);
      setTotalPages(booksResponse.totalPages);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطا در بارگذاری داده‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const response = await adminApi.uploadFile(file);
      return response.file.id;
    } catch (error) {
      throw new Error('خطا در آپلود فایل');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !coverFile || !epubFile) {
      toast.error('لطفاً همه فیلدهای ضروری را پر کنید');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload files
      const [coverImageId, epubFileId] = await Promise.all([
        handleFileUpload(coverFile),
        handleFileUpload(epubFile),
      ]);

      // Create book
      await adminApi.createBook({
        title: formData.title,
        author: formData.author,
        description: formData.description,
        coverImageId,
        epubFileId,
        categories: formData.categories,
      });

      toast.success('کتاب با موفقیت اضافه شد');
      setShowAddForm(false);
      setFormData({ title: '', author: '', description: '', categories: [] });
      setCoverFile(null);
      setEpubFile(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'خطا در افزودن کتاب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

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
              مدیریت کتاب‌ها
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {totalBooks.toLocaleString('fa-IR')} کتاب در سیستم
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن کتاب</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در عنوان، نویسنده یا توضیحات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pr-10"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="">همه دسته‌ها</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.title}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">
              جستجو
            </button>
            
            {(searchTerm || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                  fetchData();
                }}
                className="btn btn-outline"
              >
                پاک کردن
              </button>
            )}
          </form>
        </div>

        {/* Books List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                  <div className="w-32 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {books.map((book) => (
                <div key={book.id} className="card p-6">
                  <div className="flex items-center space-x-6 space-x-reverse">
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
                        نویسنده: {book.author}
                      </p>
                      {book.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {book.description}
                        </p>
                      )}
                      
                      {/* Categories */}
                      {book.categories && book.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {book.categories.map((category) => (
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
                    <div className="flex items-center space-x-2 space-x-reverse flex-shrink-0">
                      <Link
                        href={`/reader/${book.id}`}
                        className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                        title="مشاهده"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="ویرایش"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('آیا از حذف این کتاب اطمینان دارید؟')) {
                            // TODO: Implement delete
                            toast.error('قابلیت حذف هنوز پیاده‌سازی نشده');
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  قبلی
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedCategory 
                ? 'نتیجه‌ای برای جستجوی شما یافت نشد' 
                : 'هنوز کتابی در سیستم ثبت نشده است'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              افزودن اولین کتاب
            </button>
          </div>
        )}

        {/* Add Book Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" onClick={() => setShowAddForm(false)}>
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      افزودن کتاب جدید
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        عنوان کتاب *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="input"
                        required
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        نویسنده *
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        className="input"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        توضیحات
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="input resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        دسته‌بندی‌ها
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.categories.includes(category.id)}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                              {category.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        تصویر جلد *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="input"
                        required
                      />
                    </div>

                    {/* EPUB File */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        فایل EPUB *
                      </label>
                      <input
                        type="file"
                        accept=".epub"
                        onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
                        className="input"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn btn-outline"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'در حال افزودن...' : 'افزودن کتاب'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

