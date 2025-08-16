'use client';

import { useState } from 'react';
import { Category } from '@/types/api';
import { Search, Filter, X } from 'lucide-react';

interface BookFiltersProps {
  categories: Category[];
  onFiltersChange: (filters: any) => void;
}

export default function BookFilters({ categories, onFiltersChange }: BookFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    author: '',
    category: '',
    sort: 'createdAt:desc' as const,
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      author: '',
      category: '',
      sort: 'createdAt:desc' as const,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.author || filters.category || filters.sort !== 'createdAt:desc';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو در عنوان یا توضیحات..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input pr-10"
          />
        </div>
      </form>

      {/* Filter Toggle Button (Mobile) */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 space-x-reverse btn btn-outline w-full justify-center"
        >
          <Filter className="h-4 w-4" />
          <span>فیلترها</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Author Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نویسنده
            </label>
            <input
              type="text"
              placeholder="نام نویسنده..."
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              className="input"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              دسته‌بندی
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
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

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              مرتب‌سازی
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="input"
            >
              <option value="createdAt:desc">جدیدترین</option>
              <option value="createdAt:asc">قدیمی‌ترین</option>
              <option value="title:asc">عنوان (الف-ی)</option>
              <option value="title:desc">عنوان (ی-الف)</option>
              <option value="author:asc">نویسنده (الف-ی)</option>
              <option value="author:desc">نویسنده (ی-الف)</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="btn btn-outline w-full flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              <span>پاک کردن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
