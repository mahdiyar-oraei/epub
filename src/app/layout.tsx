import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { ReaderSettingsProvider } from '@/hooks/useReaderSettings';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import VisitTracker from '@/components/layout/VisitTracker';

export const metadata: Metadata = {
  title: 'کتابخانه الکترونیک',
  description: 'پلتفرم خواندن کتاب‌های الکترونیک',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-vazirmatn">
        <ThemeProvider>
          <ReaderSettingsProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <VisitTracker />
                <Navbar />
                <main className="pt-16">
                  {children}
                </main>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      fontFamily: 'Vazirmatn UI, Vazir, sans-serif',
                      direction: 'rtl',
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </ReaderSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
