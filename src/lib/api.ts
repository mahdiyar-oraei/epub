import axios from 'axios';
import type {
  User,
  Book,
  Category,
  BookResponse,
  LoginResponse,
  StartReadingResponse,
  BookFilters,
  AuthCredentials,
  OtpRequest,
  OtpVerification,
  CreateBookRequest,
  CreateCategoryRequest,
  File,
  TimeSpentRequest,
  VisitTrackRequest,
  VisitMetrics,
  ReadingAnalytics,
  Visit,
  UserReadingStats,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kianbooks.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for book creation requests
    if (config.url?.includes('/admin/books') && config.method === 'post') {
      console.log('Book creation request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Store current page for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('redirectDestination', currentPath);
      
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (credentials: AuthCredentials): Promise<void> => {
    await api.post('/auth/register', credentials);
  },
  
  login: async (credentials: AuthCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  
  // OTP Authentication methods
  sendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/send-otp', { email });
    return response.data;
  },
  
  verifyOtp: async (email: string, otp: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/verify-otp', { email, otp });
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export const booksApi = {
  getBooks: async (filters?: BookFilters): Promise<BookResponse> => {
    const response = await api.get<BookResponse>('/books', { params: filters });
    return response.data;
  },
  
  getBook: async (id: string): Promise<Book> => {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },
  
  getReadBooks: async (page = 1, limit = 10): Promise<BookResponse> => {
    const response = await api.get<BookResponse>('/books/read', {
      params: { page, limit },
    });
    return response.data;
  },
  
  getBookmarkedBooks: async (page = 1, limit = 10): Promise<BookResponse> => {
    const response = await api.get<BookResponse>('/books/bookmarked', {
      params: { page, limit },
    });
    return response.data;
  },
  
  startReading: async (bookId: string): Promise<StartReadingResponse> => {
    const response = await api.post<StartReadingResponse>('/books/start-reading', {
      bookId,
    });
    return response.data;
  },
  
  bookmarkBook: async (bookId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/books/bookmark', {
      bookId,
    });
    return response.data;
  },
  
  setProgress: async (bookId: string, progress: number): Promise<{ message: string; userBook: any }> => {
    const response = await api.post<{ message: string; userBook: any }>('/books/set-progress', {
      bookId,
      progress,
    });
    return response.data;
  },

  addTimeSpent: async (request: TimeSpentRequest): Promise<{ message: string; userBook: any }> => {
    const response = await api.post<{ message: string; userBook: any }>('/books/add-time-spent', request);
    return response.data;
  },

  getUserReadingStats: async (): Promise<UserReadingStats> => {
    try {
      const response = await api.get('/reading-analytics');
      console.log('Full API response:', response.data);
      const analytics = response.data.analytics;
      console.log('Extracted analytics:', analytics);
      
      if (!analytics) {
        console.warn('No analytics data found in response');
        throw new Error('No analytics data found');
      }

      // Find the first book that is not null
      const firstValidBook = analytics.topReadBooks?.find((item: any) => item && item.book);
      
      // Transform the analytics data to match UserReadingStats interface
      const userStats = {
        totalTimeSpent: analytics.totalTimeSpent || 0,
        totalBooksRead: analytics.totalBooksOpened || 0,
        averageReadingTime: analytics.totalBooksOpened > 0 
          ? Math.floor(analytics.totalTimeSpent / analytics.totalBooksOpened)
          : 0,
        currentStreak: 0, // This would need to be calculated on the backend
        longestStreak: 0, // This would need to be calculated on the backend
        booksThisMonth: 0, // This would need to be calculated on the backend
        timeThisMonth: 0, // This would need to be calculated on the backend
        readingStreak: 0, // This would need to be calculated on the backend
        lastReadBook: firstValidBook
          ? {
              id: firstValidBook.book.id,
              title: firstValidBook.book.title,
              author: firstValidBook.book.author,
              progress: 0, // This would need to come from a different endpoint
            }
          : undefined,
      };

      console.log('Final parsed user stats:', {
        totalTimeSpent: userStats.totalTimeSpent,
        totalBooksRead: userStats.totalBooksRead,
        averageReadingTime: userStats.averageReadingTime,
        lastReadBookTitle: userStats.lastReadBook?.title
      });

      return userStats;
    } catch (error) {
      console.error('Error fetching user reading stats:', error);
      // Return default values if API fails
      return {
        totalTimeSpent: 0,
        totalBooksRead: 0,
        averageReadingTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        booksThisMonth: 0,
        timeThisMonth: 0,
        readingStreak: 0,
      };
    }
  },
};

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
};

export const adminApi = {
  getUsers: async (page = 1, limit = 10): Promise<{ users: User[]; totalUsers: number; page: number; totalPages: number }> => {
    const response = await api.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },
  
  createCategory: async (category: CreateCategoryRequest): Promise<{ message: string; category: Category }> => {
    const response = await api.post('/admin/categories', category);
    return response.data;
  },
  
  updateCategory: async (id: string, category: CreateCategoryRequest): Promise<{ message: string; category: Category }> => {
    const response = await api.put(`/admin/categories/${id}`, category);
    return response.data;
  },
  
  createBook: async (book: CreateBookRequest): Promise<{ message: string; book: Book }> => {
    const response = await api.post('/admin/books', book);
    return response.data;
  },
  
  updateBook: async (id: string, book: Partial<CreateBookRequest>): Promise<{ message: string; book: Book }> => {
    const response = await api.put(`/admin/books/${id}`, book);
    return response.data;
  },
  
  deleteBook: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/books/${id}`);
    return response.data;
  },
  
  uploadFile: async (file: globalThis.File): Promise<{ message: string; file: File }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading file to /admin/upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      formData: formData
    });
    
    const response = await api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  },
  
  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/admin/files/${id}`);
  },

  getReadingAnalytics: async (): Promise<{ analytics: ReadingAnalytics }> => {
    const response = await api.get('/admin/books/analytics');
    console.log('Raw API response:', response.data);
    
    // Handle both response formats:
    // 1. { analytics: { ... } }
    // 2. { totalTimeSpent: 48, totalBooksOpened: 2, ... }
    if (response.data.analytics) {
      return response.data;
    } else {
      // If the response doesn't have an analytics wrapper, wrap it
      return { analytics: response.data };
    }
  },

  getVisitMetrics: async (): Promise<{ metrics: VisitMetrics }> => {
    const response = await api.get('/visits/metrics');
    return response.data;
  },
};

export const visitsApi = {
  trackVisit: async (request: VisitTrackRequest): Promise<{ message: string; visit: Visit }> => {
    const response = await api.post('/visits/track', request);
    return response.data;
  },
};

export default api;
