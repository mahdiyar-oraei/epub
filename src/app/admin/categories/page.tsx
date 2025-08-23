'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Category } from '@/types/api';
import { adminApi, categoriesApi } from '@/lib/api';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ title: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    fetchCategories();
  }, [isAuthenticated, user]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoriesApi.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('خطا در بارگذاری دسته‌بندی‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('عنوان دسته‌بندی الزامی است');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update existing category
        await adminApi.updateCategory(editingCategory.id, { title: formData.title.trim() });
        toast.success('دسته‌بندی با موفقیت به‌روزرسانی شد');
      } else {
        // Create new category
        await adminApi.createCategory({ title: formData.title.trim() });
        toast.success('دسته‌بندی با موفقیت اضافه شد');
      }

      setFormData({ title: '' });
      setShowAddForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در عملیات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ title: category.title });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ title: '' });
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              مدیریت دسته‌بندی‌ها
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {categories.length.toLocaleString('fa-IR')} دسته‌بندی در سیستم
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن دسته‌بندی</span>
          </button>
        </div>

        {/* Categories List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <Tag className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        شناسه: {category.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      title="ویرایش"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
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
        ) : (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              دسته‌بندی یافت نشد
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              هنوز دسته‌بندی در سیستم ثبت نشده است
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              افزودن اولین دسته‌بندی
            </button>
          </div>
        )}

        {/* Add/Edit Category Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" onClick={handleCancel}>
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      عنوان دسته‌بندی
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ title: e.target.value })}
                      className="input"
                      placeholder="مثال: رمان، علمی-تخیلی، ..."
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end space-x-3 space-x-reverse">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-outline"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting 
                        ? (editingCategory ? 'در حال به‌روزرسانی...' : 'در حال افزودن...') 
                        : (editingCategory ? 'به‌روزرسانی' : 'افزودن')}
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

