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
  coverImageId: string;
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
  coverImageId: string;
  epubFileId: string;
  categories?: string[];
}

export interface CreateCategoryRequest {
  title: string;
}
