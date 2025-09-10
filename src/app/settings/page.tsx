'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy'>('general');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تنظیمات</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-right px-4 py-3 rounded-md transition-colors ${
                  activeTab === 'general'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="h-5 w-5" />
                  <span>عمومی</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-right px-4 py-3 rounded-md transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Bell className="h-5 w-5" />
                  <span>اعلان‌ها</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full text-right px-4 py-3 rounded-md transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Shield className="h-5 w-5" />
                  <span>حریم خصوصی</span>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">تنظیمات عمومی</h2>
                  
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">حالت شب</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">تم تاریک برای محیط‌های کم نور</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDarkModeToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Reading Settings Link */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">تنظیمات خواندن</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          تنظیمات فونت، اندازه متن و تم در داخل خواننده کتاب قابل تنظیم است
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">تنظیمات اعلان‌ها</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">اعلان‌های جدید</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">دریافت اعلان برای کتاب‌های جدید</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">یادآوری مطالعه</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">یادآوری روزانه برای ادامه مطالعه</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">حریم خصوصی</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">سابقه مطالعه</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">مدیریت سابقه مطالعه شما</p>
                      <button className="btn btn-outline text-sm">پاک کردن سابقه</button>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">داده‌های شخصی</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">مدیریت اطلاعات شخصی</p>
                      <button className="btn btn-outline text-sm">صادر کردن داده‌ها</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}