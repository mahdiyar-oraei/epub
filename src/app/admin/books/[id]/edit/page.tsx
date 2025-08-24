'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Book, Category } from '@/types/api';
import { adminApi, booksApi, categoriesApi } from '@/lib/api';
import {
  BookOpen,
  Save,
  X,
  Upload,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  
  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    categories: [] as string[],
  });
  const [coverFile, setCoverFile] = useState<globalThis.File | null>(null);
  const [epubFile, setEpubFile] = useState<globalThis.File | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, user, bookId, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookResponse, categoriesResponse] = await Promise.all([
        booksApi.getBook(bookId),
        categoriesApi.getCategories(),
      ]);
      
      setBook(bookResponse);
      setCategories(categoriesResponse);
      
      // Initialize form data with book data
      setFormData({
        title: bookResponse.title || '',
        author: bookResponse.author || '',
        description: bookResponse.description || '',
        categories: bookResponse.categories?.map(cat => cat.id) || [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطا در بارگذاری داده‌ها');
      router.push('/admin/books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: globalThis.File): Promise<string> => {
    try {
      const response = await adminApi.uploadFile(file);
      return response.file.id;
    } catch (error) {
      throw new Error('خطا در آپلود فایل');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author) {
      toast.error('لطفاً عنوان و نویسنده را وارد کنید');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare update data
      const updateData: any = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        categories: formData.categories,
      };

      // Upload new files if selected
      if (coverFile) {
        const coverImageId = await handleFileUpload(coverFile);
        updateData.coverImageId = coverImageId;
      }

      if (epubFile) {
        const epubFileId = await handleFileUpload(epubFile);
        updateData.epubFileId = epubFileId;
      }

      // Update book
      await adminApi.updateBook(bookId, updateData);

      toast.success('کتاب با موفقیت به‌روزرسانی شد');
      router.push('/admin/books');
    } catch (error: any) {
      console.error('Error updating book:', error);
      toast.error(error.message || 'خطا در به‌روزرسانی کتاب');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              کتاب یافت نشد
            </h3>
            <Link href="/admin/books" className="btn btn-primary">
              بازگشت به لیست کتاب‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ویرایش کتاب
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {book.title}
            </p>
          </div>
          
          <Link
            href="/admin/books"
            className="btn btn-outline flex items-center space-x-2 space-x-reverse"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>بازگشت</span>
          </Link>
        </div>

        {/* Current Book Info */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            اطلاعات فعلی کتاب
          </h3>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
              {book.coverImage?.url ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://134.209.198.206:3000'}${book.coverImage.url}`}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {book.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                نویسنده: {book.author}
              </p>
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
          </div>
        </div>

        {/* Edit Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                توضیحات
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input resize-none"
                rows={4}
                placeholder="توضیحات کتاب..."
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                دسته‌بندی‌ها
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                      {category.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تصویر جلد جدید (اختیاری)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                در صورت انتخاب، تصویر فعلی جایگزین خواهد شد
              </p>
            </div>

            {/* EPUB File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                فایل EPUB جدید (اختیاری)
              </label>
              <input
                type="file"
                accept=".epub"
                onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
                className="input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                در صورت انتخاب، فایل فعلی جایگزین خواهد شد
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/books"
                className="btn btn-outline"
              >
                انصراف
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
