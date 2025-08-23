'use client';

import { Bookmark, List, Search, Settings } from 'lucide-react';

interface BookProgress {
  fraction: number;
  location: number;
  totalLocations: number;
  section: {
    index: number;
    href: string;
    label: string;
  };
  cfi: string;
}

interface ProgressBarProps {
  progress: BookProgress;
  onProgressChange: (progress: number) => void;
  onTogglePanel: (panel: string) => void;
  onAddBookmark: () => void;
}

export default function ProgressBar({
  progress,
  onProgressChange,
  onTogglePanel,
  onAddBookmark
}: ProgressBarProps) {
  const progressPercent = Math.round(progress.fraction * 100);

  return (
    <div className="flex items-center justify-between px-4 py-2">
      {/* Left: Quick Actions */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <button
          onClick={() => onTogglePanel('toc')}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="فهرست مطالب"
        >
          <List className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onTogglePanel('search')}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="جستجو"
        >
          <Search className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onTogglePanel('settings')}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="تنظیمات"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Center: Progress Bar */}
      <div className="flex-1 mx-6 max-w-md">
        <div className="flex items-center space-x-3 space-x-reverse">
          {/* Progress Info */}
          <div className="text-xs text-gray-600 dark:text-gray-400 min-w-[4rem] text-center">
            <div className="font-medium">{progressPercent}%</div>
            <div className="text-xs opacity-75">
              {progress.location + 1} / {progress.totalLocations}
            </div>
          </div>

          {/* Progress Slider */}
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => onProgressChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thin"
            />
            
            {/* Progress Tooltip */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {progress.section.label}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Bookmark and Info */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <button
          onClick={onAddBookmark}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="افزودن نشان"
        >
          <Bookmark className="h-4 w-4" />
        </button>
        
        {/* Current Section Info */}
        <div className="text-xs text-gray-600 dark:text-gray-400 max-w-[8rem] truncate">
          {progress.section.label}
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider-thin::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: rgb(37, 99, 235);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thin::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: rgb(37, 99, 235);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thin::-webkit-slider-track {
          background: linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${progressPercent}%, rgb(209, 213, 219) ${progressPercent}%, rgb(209, 213, 219) 100%);
          border-radius: 8px;
          height: 8px;
        }

        .slider-thin::-moz-range-track {
          background: linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${progressPercent}%, rgb(209, 213, 219) ${progressPercent}%, rgb(209, 213, 219) 100%);
          border-radius: 8px;
          height: 8px;
          border: none;
        }
      `}</style>
    </div>
  );
}
