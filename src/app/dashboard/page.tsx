'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book, UserReadingStats } from '@/types/api';
import { booksApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import { redirectToLoginWithReturn } from '@/lib/redirect-utils';
import { 
  User, 
  BookOpen, 
  Bookmark, 
  TrendingUp, 
  Clock,
  Calendar,
  Star,
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [readBooks, setReadBooks] = useState<Book[]>([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [userStats, setUserStats] = useState<UserReadingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingBookId, setRemovingBookId] = useState<string | null>(null);

  useEffect(() => {
    // Don't redirect while authentication is still loading
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      redirectToLoginWithReturn();
      return;
    }

    const fetchUserBooks = async () => {
      try {
        // Make API calls independently so one failure doesn't affect others
        const [readResponse, bookmarkedResponse, statsResponse] = await Promise.allSettled([
          booksApi.getReadBooks(1, 6),
          booksApi.getBookmarkedBooks(1, 6),
          booksApi.getUserReadingStats(),
        ]);
        
        console.log('Dashboard: Read books response:', readResponse);
        console.log('Dashboard: Bookmarked books response:', bookmarkedResponse);
        console.log('Dashboard: User stats response:', statsResponse);
        
        // Handle read books response
        if (readResponse.status === 'fulfilled') {
          console.log('Dashboard: Processed books:', readResponse.value);
          setReadBooks(readResponse.value);
        } else {
          console.warn('Failed to fetch read books:', readResponse.reason);
          setReadBooks([]);
        }
        
        // Handle bookmarked books response
        if (bookmarkedResponse.status === 'fulfilled') {
          setBookmarkedBooks(bookmarkedResponse.value.books);
        } else {
          console.warn('Failed to fetch bookmarked books:', bookmarkedResponse.reason);
          setBookmarkedBooks([]);
        }
        
        // Handle user stats response
        if (statsResponse.status === 'fulfilled') {
          console.log('Dashboard: Successfully received user stats:', statsResponse.value);
          setUserStats(statsResponse.value);
        } else {
          console.warn('Failed to fetch user stats:', statsResponse.reason);
          setUserStats(null);
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, [isAuthenticated, authLoading]);

  const handleRemoveBook = async (bookId: string) => {
    if (removingBookId) return; // Prevent multiple concurrent removals
    
    try {
      setRemovingBookId(bookId);
      await booksApi.removeReadingRecord(bookId);
      
      // Remove the book from the local state
      setReadBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      
      // Show success message (optional)
      console.log('Reading record removed successfully');
    } catch (error) {
      console.error('Failed to remove reading record:', error);
      // You could show an error toast here
    } finally {
      setRemovingBookId(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const totalHours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    
    if (totalHours > 0 && remainingMinutes > 0) {
      return `${totalHours.toLocaleString('fa-IR')} ساعت و ${remainingMinutes.toLocaleString('fa-IR')} دقیقه`;
    } else if (totalHours > 0) {
      return `${totalHours.toLocaleString('fa-IR')} ساعت`;
    } else if (remainingMinutes > 0) {
      return `${remainingMinutes.toLocaleString('fa-IR')} دقیقه`;
    } else {
      return '۰ دقیقه';
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  const allUserStatsData = [
    {
      icon: BookOpen,
      label: 'کتاب‌های خوانده شده',
      value: formatNumber(userStats?.totalBooksRead || readBooks?.length || 0),
      rawValue: userStats?.totalBooksRead || readBooks?.length || 0,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      description: 'تعداد کل کتاب‌های مطالعه شده',
      trend: '+۲ کتاب این ماه',
    },
    {
      icon: Clock,
      label: 'کل زمان مطالعه',
      value: userStats ? formatTime(userStats.totalTimeSpent/1000) : '۰ دقیقه',
      rawValue: userStats?.totalTimeSpent || 0,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      description: 'زمان کل صرف شده برای مطالعه',
      trend: '+۱۵ دقیقه امروز',
    },
    {
      icon: TrendingUp,
      label: 'کتاب‌های این ماه',
      value: formatNumber(userStats?.booksThisMonth || 0),
      rawValue: userStats?.booksThisMonth || 0,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      description: 'کتاب‌های مطالعه شده در ماه جاری',
      trend: 'هدف: ۵ کتاب',
    },
  ];

  // Filter out zero-value stats
  const userStatsData = allUserStatsData.filter(stat => stat.rawValue > 0);


  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  // Additional check to ensure user data is available
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
              <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                داشبورد کاربری
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                خوش آمدید، {user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>آخرین بازدید: امروز</span>
          </div>
        </div>

         {/* Combined Stats and Current Reading Cards - 3 in a Row */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           {/* Stats Cards */}
           {userStatsData.map((stat, index) => {
             const Icon = stat.icon;
             return (
               <div 
                 key={index} 
                 className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
               >
                 {/* Gradient Background Overlay */}
                 <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                 
                 {/* Content */}
                 <div className="relative p-6">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       {/* Icon */}
                       <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                         <Icon className={`h-6 w-6 ${stat.color}`} />
                       </div>
                       
                       {/* Label */}
                       <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                         {stat.label}
                       </h3>
                       
                       {/* Value */}
                       <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                         {stat.value}
                       </p>
                       
                       {/* Description */}
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                         {stat.description}
                       </p>
                       
                       {/* Trend */}
                       <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                         <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                           {stat.trend}
                         </span>
                       </div>
                     </div>
                     
                     {/* Decorative Elements */}
                     <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                       <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.bgColor} blur-xl`}></div>
                     </div>
                   </div>
                 </div>
               </div>
             );
           })}

           {/* Current Reading Card */}
           {readBooks?.length > 0 && (
             <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
               {/* Gradient Background Overlay */}
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
               
               {/* Content */}
               <div className="relative p-6">
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
                     {/* Icon */}
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                       <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                     </div>
                     
                     {/* Label */}
                     <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                       در حال مطالعه
                     </h3>
                     
                     {/* Value */}
                     <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                       {formatNumber(readBooks?.length || 0)}
                     </p>
                     
                     {/* Books List with Progress */}
                     <div className="space-y-2 mb-3">
                       {readBooks?.slice(0, 2).map((book) => {
                         const progress = book.progress || 0;
                         const progressPercentage = Math.round(progress * 100);
                         
                         return (
                           <div key={book.id} className="flex items-center space-x-2 space-x-reverse">
                             <div className="w-6 h-8 bg-gray-200 dark:bg-gray-600 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                               {book.coverImage?.url ? (
                                 <img 
                                   src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://kianbooks.com'}${book.coverImage.url}`} 
                                   alt={book.title}
                                   className="w-full h-full object-cover"
                                 />
                               ) : (
                                 <BookOpen className="h-3 w-3 text-gray-400" />
                               )}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                 {book.title}
                               </p>
                               <div className="flex items-center space-x-1 space-x-reverse">
                                 <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                                   <div 
                                     className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-300" 
                                     style={{ width: `${progressPercentage}%` }}
                                   ></div>
                                 </div>
                                 <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                                   {progressPercentage}%
                                 </span>
                               </div>
                             </div>
                           </div>
                         );
                       })}
                       
                       {(readBooks?.length || 0) > 2 && (
                         <div className="text-center">
                           <Link 
                             href="/dashboard/reading-history"
                             className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                           >
                             +{(readBooks?.length || 0) - 2} کتاب دیگر
                           </Link>
                         </div>
                       )}
                     </div>
                     
                     {/* Action Button */}
                     <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                       <Link 
                         href="/dashboard/reading-history"
                         className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                       >
                         ادامه مطالعه
                       </Link>
                     </div>
                   </div>
                   
                   {/* Decorative Elements */}
                   <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 blur-xl"></div>
                   </div>
                 </div>
               </div>
             </div>
           )}
         </div>

        {/* Recently Read Books - Only show if there are books */}
        {(readBooks?.length || 0) > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              کتاب‌های اخیراً خوانده شده
            </h2>
            <Link
              href="/dashboard/reading-history"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (readBooks?.length || 0) > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {readBooks?.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                هنوز کتابی نخوانده‌اید
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                از کتابخانه ما کتابی انتخاب کنید و شروع به مطالعه کنید
              </p>
              <Link href="/library" className="btn btn-primary">
                مرور کتابخانه
              </Link>
            </div>
          )}
        </div>
        )}

        {/* Bookmarked Books - Only show if there are bookmarked books */}
        {(bookmarkedBooks?.length || 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              کتاب‌های نشان‌گذاری شده
            </h2>
            <Link
              href="/dashboard/bookmarks"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

          {(bookmarkedBooks?.length || 0) > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedBooks?.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                هیچ کتابی نشان‌گذاری نکرده‌اید
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                کتاب‌های مورد علاقه خود را نشان‌گذاری کنید تا بعداً مطالعه کنید
              </p>
              <Link href="/library" className="btn btn-primary">
                مرور کتابخانه
              </Link>
            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
