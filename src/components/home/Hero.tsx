'use client';

import Link from 'next/link';
import { BookOpen, Download, Users, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <BookOpen className="h-20 w-20 text-white opacity-90 mx-auto mb-4" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            کتابخانه الکترونیک
            <br />
            <span className="text-primary-200">مطالعه آنلاین</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            دسترسی آسان به هزاران کتاب الکترونیک با امکان مطالعه آنلاین و ذخیره آخرین صفحه خوانده شده
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/library"
              className="btn bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
            >
              شروع مطالعه
            </Link>
            <Link
              href="/auth/register"
              className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 text-lg"
            >
              ثبت‌نام رایگان
            </Link>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <Download className="h-12 w-12 text-primary-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">دانلود آفلاین</h3>
              <p className="text-primary-100">
                امکان دانلود و مطالعه کتاب‌ها بدون اتصال به اینترنت
              </p>
            </div>
            
            <div className="text-center">
              <Users className="h-12 w-12 text-primary-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">جامعه خوانندگان</h3>
              <p className="text-primary-100">
                به جامعه بزرگ خوانندگان بپیوندید و تجربیات خود را به اشتراک بگذارید
              </p>
            </div>
            
            <div className="text-center">
              <Star className="h-12 w-12 text-primary-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">محتوای با کیفیت</h3>
              <p className="text-primary-100">
                دسترسی به کتاب‌های منتخب و با کیفیت از نویسندگان معتبر
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 -left-8 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -bottom-8 right-1/4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
      </div>
    </section>
  );
}
