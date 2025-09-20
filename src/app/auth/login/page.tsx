'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import OtpInput from '@/components/auth/OtpInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { sendOtp, verifyOtp } = useAuth();
  const router = useRouter();

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('لطفاً ایمیل خود را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(email);
      setStep('otp');
      startCountdown();
    } catch (error) {
      // Error is handled in the sendOtp function
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('لطفاً کد ۶ رقمی را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      // Navigation is handled by the verifyOtp function
    } catch (error) {
      // Error is handled in the verifyOtp function
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      await sendOtp(email);
      startCountdown();
      toast.success('کد تأیید مجدد ارسال شد');
    } catch (error) {
      // Error is handled in the sendOtp function
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setCountdown(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {step === 'email' ? 'ورود به حساب کاربری' : 'تأیید کد ایمیل'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {step === 'email' ? (
              <>
                یا{' '}
                <Link
                  href="/auth/register"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  حساب کاربری جدید بسازید
                </Link>
              </>
            ) : (
              <>کد ۶ رقمی ارسال شده به {email} را وارد کنید</>
            )}
          </p>
        </div>

        {step === 'email' ? (
          /* Email Step */
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                ایمیل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pr-10"
                  placeholder="ایمیل"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                    در حال ارسال کد...
                  </div>
                ) : (
                  'ارسال کد تأیید'
                )}
              </button>
            </div>

            
          </form>
        ) : (
          /* OTP Step */
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
                  کد تأیید ۶ رقمی
                </label>
                <OtpInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                  className="mb-4"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                    در حال تأیید...
                  </div>
                ) : (
                  'تأیید و ورود'
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                تغییر ایمیل
              </button>
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ارسال مجدد کد در {countdown} ثانیه
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  <RefreshCw className="h-4 w-4 ml-1" />
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
