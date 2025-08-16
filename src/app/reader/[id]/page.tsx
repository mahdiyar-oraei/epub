'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Book } from '@/types/api';
import { booksApi } from '@/lib/api';
import EpubReader from '@/components/reader/EpubReader';
import { ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [epubUrl, setEpubUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeReader = async () => {
      try {
        const bookId = params.id as string;
        
        // Start reading and get EPUB URL
        const response = await booksApi.startReading(bookId);
        setEpubUrl(response.epubUrl);
        
        // Get book details
        const bookData = await booksApi.getBook(bookId);
        setBook(bookData);
      } catch (error: any) {
        console.error('Error initializing reader:', error);
        toast.error('خطا در بارگذاری کتاب');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      initializeReader();
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری کتاب...</p>
        </div>
      </div>
    );
  }

  if (!book || !epubUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            کتاب یافت نشد
          </h2>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary flex items-center space-x-2 space-x-reverse mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>بازگشت به خانه</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900">
      <EpubReader 
        book={book}
        epubUrl={epubUrl}
        onClose={() => router.push('/')}
      />
    </div>
  );
}
