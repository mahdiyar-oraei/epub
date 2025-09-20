'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types/api';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Bookmark, BookmarkCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(book.isBookmarked || false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('برای نشان‌گذاری کتاب وارد شوید');
      return;
    }

    setIsBookmarking(true);
    try {
      await booksApi.bookmarkBook(book.id);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'نشان کتاب حذف شد' : 'کتاب نشان‌گذاری شد');
    } catch (error) {
      console.error('Error bookmarking book:', error);
      if (error instanceof Error && error.message?.includes('Network connection failed')) {
        toast.error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
      } else {
        toast.error('خطا در نشان‌گذاری کتاب');
      }
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleStartReading = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('برای شروع مطالعه وارد شوید');
      return;
    }

    try {
      const response = await booksApi.startReading(book.id);
      window.location.href = `/reader/${book.id}`;
    } catch (error) {
      console.error('Error starting reading:', error);
      if (error instanceof Error && error.message?.includes('Network connection failed')) {
        toast.error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
      } else {
        toast.error('خطا در شروع مطالعه');
      }
    }
  };

  return (
    <div className="card group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Book Cover */}
        <div className="aspect-[3/4] relative overflow-hidden bg-gray-200 dark:bg-gray-700">
          {book.coverImage?.url ? (
            <Image
              src={book.coverImage.url}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={isBookmarking}
            className="absolute top-2 left-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary-600" />
            ) : (
              <Bookmark className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {book.author}
          </p>
          
          {book.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {book.description}
            </p>
          )}

          {/* Categories */}
          {book.categories && book.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {book.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="inline-block px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full"
                >
                  {category.title}
                </span>
              ))}
              {book.categories.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  +{book.categories.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleStartReading}
              className="flex-1 btn btn-primary text-sm py-2"
            >
              <BookOpen className="h-4 w-4 ml-1" />
              شروع مطالعه
            </button>
            <Link
              href={`/books/${book.id}`}
              className="btn btn-outline text-sm py-2 px-3"
            >
              جزئیات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
