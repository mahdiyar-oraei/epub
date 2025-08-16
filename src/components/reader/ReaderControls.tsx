'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ReaderControlsProps {
  onPrevPage: () => void;
  onNextPage: () => void;
  onClose: () => void;
}

export default function ReaderControls({ onPrevPage, onNextPage, onClose }: ReaderControlsProps) {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-20 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-8 pointer-events-none">
        {/* Previous Page */}
        <button
          onClick={onPrevPage}
          className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 pointer-events-auto"
          aria-label="صفحه قبل"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Next Page */}
        <button
          onClick={onNextPage}
          className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 pointer-events-auto"
          aria-label="صفحه بعد"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Close Button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <button
          onClick={onClose}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 pointer-events-auto"
          aria-label="بستن کنترل‌ها"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 pointer-events-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            برای رفتن به صفحه بعد/قبل کلیک کنید یا از کلیدهای چپ/راست استفاده کنید
          </p>
        </div>
      </div>
    </div>
  );
}
