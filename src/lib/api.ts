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
  CreateBookRequest,
  CreateCategoryRequest,
  File,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://134.209.198.206:3000/api/v1';

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
  
  uploadFile: async (file: globalThis.File): Promise<{ message: string; file: File }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/admin/files/${id}`);
  },
};

export default api;
