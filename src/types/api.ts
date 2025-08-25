export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
  name?: string | null;
  picture?: string | null;
  provider?: 'EMAIL' | 'GOOGLE';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: {
    url: string;
  };
  epubFileId: string;
  createdAt: string;
  categories: Category[];
}

export interface Category {
  id: string;
  title: string;
}

export interface File {
  id: string;
  path: string;
  url: string;
}

export interface BookResponse {
  books: Book[];
  totalBooks: number;
  page: number;
  totalPages: number;
}

export interface UserBook {
  userId: string;
  bookId: string;
  progress: number;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  role: 'USER' | 'ADMIN';
  user: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
    provider: 'EMAIL' | 'GOOGLE';
  };
}

export interface StartReadingResponse {
  message: string;
  bookId: string;
  epubUrl: string;
  userBook: UserBook;
}

export interface BookFilters {
  search?: string;
  author?: string;
  category?: string;
  sort?: 'title:asc' | 'title:desc' | 'author:asc' | 'author:desc' | 'createdAt:asc' | 'createdAt:desc';
  page?: number;
  limit?: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  description?: string;
  coverImage: {
    url: string;
  };
  epubFileId: string;
  categories?: string[];
}

export interface CreateCategoryRequest {
  title: string;
}

export interface ReadingAnalytics {
  totalTimeSpent: number;
  totalBooksOpened: number;
  totalUsersReading: number;
  topReadBooks: Array<{
    book: {
      id: string;
      title: string;
      author: string;
    };
    readCount: number;
    totalTimeSpent: number;
  }>;
}

export interface VisitMetrics {
  totalVisits: number;
  todayVisits: number;
  last7DaysVisits: number;
  last30DaysVisits: number;
}

export interface UserReadingStats {
  totalBooksRead: number;
  totalTimeSpent: number;
  averageReadingTime: number;
  lastReadBook?: {
    id: string;
    title: string;
    author: string;
    progress: number;
  };
  readingStreak: number;
  booksThisMonth: number;
  timeThisMonth: number;
  currentStreak: number;
  longestStreak: number;
}

export interface TimeSpentRequest {
  bookId: string;
  timeSpent: number;
  userId: string;
}

export interface VisitTrackRequest {
  userId: string;
  page: string;
  timestamp: string;
}

export interface Visit {
  id: string;
  userId: string;
  page: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}
