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
        console.log('Initializing reader for book ID:', bookId);
        
        // Start reading and get EPUB URL
        console.log('Calling startReading API...');
        const response = await booksApi.startReading(bookId);
        console.log('StartReading response:', response);
        
        if (!response.epubUrl) {
          throw new Error('No EPUB URL received from API');
        }
        
        // Transform relative URL to absolute URL for better debugging
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://134.209.198.206:3000/api/v1';
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        let fullEpubUrl;
        if (response.epubUrl.startsWith('http')) {
          fullEpubUrl = response.epubUrl;
        } else {
          const cleanPath = response.epubUrl.startsWith('/') ? response.epubUrl : `/${response.epubUrl}`;
          fullEpubUrl = `${baseUrl}${cleanPath}`;
        }
        
        setEpubUrl(response.epubUrl); // Keep original for component compatibility
        console.log('EPUB URL set (original):', response.epubUrl);
        console.log('EPUB URL set (full):', fullEpubUrl);
        
        // Get book details
        console.log('Getting book details...');
        const bookData = await booksApi.getBook(bookId);
        console.log('Book data received:', bookData);
        setBook(bookData);
        
        console.log('Reader initialization completed successfully');
      } catch (error: any) {
        console.error('Error initializing reader:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        toast.error('خطا در بارگذاری کتاب: ' + (error.response?.data?.message || error.message));
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
