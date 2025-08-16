import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';

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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazir:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-vazir">
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Navbar />
              <main className="pt-16">
                {children}
              </main>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    fontFamily: 'Vazir',
                    direction: 'rtl',
                  },
                }}
              />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
