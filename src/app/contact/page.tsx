'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('لطفاً همه فیلدها را پر کنید');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('پیام شما با موفقیت ارسال شد');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'ایمیل',
      value: 'info@ebooklibrary.ir',
      description: 'برای سوالات عمومی و پشتیبانی',
    },
    {
      icon: Phone,
      title: 'تلفن',
      value: '۰۲۱-۱۲۳۴۵۶۷۸',
      description: 'شنبه تا پنج‌شنبه، ۹ تا ۱۷',
    },
    {
      icon: MapPin,
      title: 'آدرس',
      value: 'تهران، خیابان ولیعصر',
      description: 'دفتر مرکزی شرکت',
    },
    {
      icon: Clock,
      title: 'ساعات کاری',
      value: '۹:۰۰ - ۱۷:۰۰',
      description: 'شنبه تا پنج‌شنبه',
    },
  ];

  const subjects = [
    'سوال عمومی',
    'مشکل فنی',
    'پیشنهاد',
    'انتقاد',
    'همکاری',
    'سایر',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            تماس با ما
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ما در اینجا هستیم تا به سوالات شما پاسخ دهیم و از نظرات شما استقبال کنیم
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              اطلاعات تماس
            </h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                        <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {info.title}
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {info.value}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                شبکه‌های اجتماعی
              </h3>
              <div className="flex space-x-4 space-x-reverse">
                <a
                  href="#"
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label="تلگرام"
                >
                  <div className="w-5 h-5 bg-gray-600 dark:bg-gray-300 rounded"></div>
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label="اینستاگرام"
                >
                  <div className="w-5 h-5 bg-gray-600 dark:bg-gray-300 rounded"></div>
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label="توییتر"
                >
                  <div className="w-5 h-5 bg-gray-600 dark:bg-gray-300 rounded"></div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                پیام خود را ارسال کنید
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      placeholder="نام کامل خود را وارد کنید"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    موضوع
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">موضوع پیام را انتخاب کنید</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    پیام
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="input resize-none"
                    placeholder="پیام خود را بنویسید..."
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>در حال ارسال...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>ارسال پیام</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            سوالات متداول
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                چگونه می‌توانم کتاب دانلود کنم؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                پس از ثبت‌نام و ورود به حساب کاربری، می‌توانید کتاب‌ها را مستقیماً مطالعه کنید 
                یا برای مطالعه آفلاین دانلود کنید.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                آیا استفاده از سایت رایگان است؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                بله، ثبت‌نام و دسترسی به بخش زیادی از کتاب‌ها کاملاً رایگان است. 
                برخی محتواهای ویژه ممکن است نیاز به اشتراک داشته باشند.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                چگونه کتاب پیشنهاد دهم؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                می‌توانید از طریق فرم تماس یا ایمیل، کتاب‌های مورد نظر خود را به ما پیشنهاد دهید. 
                تیم ما درخواست شما را بررسی خواهد کرد.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                مشکل فنی دارم، چه کنم؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                لطفاً مشکل خود را از طریق فرم تماس یا ایمیل پشتیبانی گزارش دهید. 
                تیم فنی ما در کمترین زمان پاسخ خواهد داد.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Placeholder */}
        <div className="mt-12">
          <div className="ad-placeholder">
            <p>فضای تبلیغاتی</p>
          </div>
        </div>
      </div>
    </div>
  );
}
