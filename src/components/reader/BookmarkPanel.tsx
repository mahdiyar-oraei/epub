'use client';

import { useState } from 'react';
import { X, Bookmark, Trash2, Clock, MapPin, Edit3, Plus } from 'lucide-react';

interface Bookmark {
  id: string;
  cfi: string;
  text: string;
  note?: string;
  createdAt: string;
}

interface BookmarkPanelProps {
  bookmarks: Bookmark[];
  onRemoveBookmark: (bookmarkId: string) => void;
  onGoToBookmark: (bookmark: Bookmark) => void;
  onClose: () => void;
}

export default function BookmarkPanel({
  bookmarks,
  onRemoveBookmark,
  onGoToBookmark,
  onClose
}: BookmarkPanelProps) {
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark.id);
    setEditNote(bookmark.note || '');
  };

  const handleSaveNote = (bookmarkId: string) => {
    // In a real implementation, you'd update the bookmark with the new note
    // For now, we'll just close the edit mode
    setEditingBookmark(null);
    setEditNote('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Bookmark className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">نشان‌ها</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {bookmarks.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto p-2">
        {bookmarks.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">نشان‌ای ثبت نشده</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              برای افزودن نشان، از دکمه B یا کلیک روی دکمه نشان استفاده کنید
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow"
              >
                {/* Bookmark Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {bookmark.text}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <button
                      onClick={() => handleEditBookmark(bookmark)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="ویرایش"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(bookmark.id)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Bookmark Note */}
                {editingBookmark === bookmark.id ? (
                  <div className="mb-3">
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="یادداشت خود را اضافه کنید..."
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      rows={2}
                    />
                    <div className="flex items-center space-x-2 space-x-reverse mt-2">
                      <button
                        onClick={() => handleSaveNote(bookmark.id)}
                        className="px-3 py-1 text-xs bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                      >
                        ذخیره
                      </button>
                      <button
                        onClick={() => setEditingBookmark(null)}
                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        لغو
                      </button>
                    </div>
                  </div>
                ) : (
                  bookmark.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 italic">
                      {bookmark.note}
                    </p>
                  )
                )}

                {/* Bookmark Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(bookmark.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => onGoToBookmark(bookmark)}
                    className="px-3 py-1 text-xs bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                  >
                    برو به
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>کل نشان‌ها: {bookmarks.length}</p>
          <p className="mt-1">برای افزودن نشان از کلید B استفاده کنید</p>
        </div>
      </div>
    </div>
  );
}
