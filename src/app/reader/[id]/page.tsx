'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Book } from '@/types/api';
import { booksApi } from '@/lib/api';
import EnhancedReader from '@/components/reader/EnhancedReader';
import { useReadingTimeTracker } from '@/hooks/useReadingTimeTracker';
import { ArrowLeft, Loader, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [epubUrl, setEpubUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Always call the reading time tracker hook (it handles undefined bookId safely)
  const bookId = params.id as string;
  const {
    isTracking,
    formattedTime,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking
  } = useReadingTimeTracker(bookId || '');

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
        
        // Transform relative URL to absolute URL
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kianbooks.com/api/v1';
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        let fullEpubUrl;
        
        console.log('Environment check:', {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
          API_BASE_URL,
          baseUrl
        });
        console.log('Original EPUB URL from API:', response.epubUrl);
        
        if (response.epubUrl.startsWith('http')) {
          fullEpubUrl = response.epubUrl;
          console.log('URL is already absolute, using as-is');
        } else {
          // Try different URL construction methods
          const cleanPath = response.epubUrl.startsWith('/') ? response.epubUrl : `/${response.epubUrl}`;
          
          // Method 1: Use baseUrl
          fullEpubUrl = `${baseUrl}${cleanPath}`;
          console.log('Method 1 - Constructed URL:', fullEpubUrl);
          
          // Method 2: Try with API base URL
          const alternativeUrl = `${API_BASE_URL.replace('/api/v1', '')}${cleanPath}`;
          console.log('Method 2 - Alternative URL:', alternativeUrl);
          
          // Method 3: Try with just the server base
          const serverBaseUrl = 'https://kianbooks.com';
          const serverUrl = `${serverBaseUrl}${cleanPath}`;
          console.log('Method 3 - Server URL:', serverUrl);
        }
        
        // Test the URL accessibility
        try {
          console.log('Testing EPUB URL accessibility...');
          const testResponse = await fetch(fullEpubUrl, { method: 'HEAD' });
          console.log('Primary URL test response status:', testResponse.status);
          if (!testResponse.ok) {
            console.warn('Primary EPUB URL not accessible:', testResponse.status, testResponse.statusText);
            
            // Try alternative URLs if primary fails
            if (!response.epubUrl.startsWith('http')) {
              const cleanPath = response.epubUrl.startsWith('/') ? response.epubUrl : `/${response.epubUrl}`;
              const alternativeUrls = [
                `${API_BASE_URL.replace('/api/v1', '')}${cleanPath}`,
                `https://kianbooks.com${cleanPath}`
              ];
              
              for (const altUrl of alternativeUrls) {
                try {
                  console.log('Testing alternative URL:', altUrl);
                  const altResponse = await fetch(altUrl, { method: 'HEAD' });
                  if (altResponse.ok) {
                    console.log('Alternative URL works:', altUrl);
                    fullEpubUrl = altUrl;
                    break;
                  }
                } catch (altError) {
                  console.warn('Alternative URL failed:', altUrl, altError);
                }
              }
            }
          }
        } catch (testError) {
          console.warn('Could not test EPUB URL accessibility:', testError);
        }
        
        // Use the full URL for the reader
        setEpubUrl(fullEpubUrl);
        console.log('Final EPUB URL set:', fullEpubUrl);
        
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

  // Start tracking when reader is loaded
  useEffect(() => {
    if (book && epubUrl && !isLoading) {
      startTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [book, epubUrl, isLoading, startTracking, stopTracking]);

  // Early returns after all hooks
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
    <div className="h-screen bg-white dark:bg-gray-900 relative">
      <EnhancedReader 
        book={book}
        epubUrl={epubUrl}
        onClose={async () => {
          await stopTracking();
          router.push('/');
        }}
      />
    </div>
  );
}
