'use client';

import { useEffect, useRef, useState } from 'react';
import { Book as EpubBook } from 'epubjs';
import { Book } from '@/types/api';
import { booksApi } from '@/lib/api';
import ReaderControls from './ReaderControls';
import ReaderToolbar from './ReaderToolbar';

interface EpubReaderProps {
  book: Book;
  epubUrl: string;
  onClose: () => void;
}

interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif';
  theme: 'light' | 'dark' | 'sepia';
  lineHeight: number;
}

export default function EpubReader({ book, epubUrl, onClose }: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const epubRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [showControls, setShowControls] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    fontFamily: 'serif',
    theme: 'light',
    lineHeight: 1.6,
  });

  useEffect(() => {
    if (!containerRef.current || !epubUrl) return;

    const initializeEpub = async () => {
      try {
        // Create EPUB instance
        const epub = new EpubBook(epubUrl);
        epubRef.current = epub;

        // Create rendition
        const rendition = epub.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          manager: 'default',
        });
        renditionRef.current = rendition;

        // Apply initial settings
        applySettings(rendition, settings);

        // Display the book
        await rendition.display();

        // Set up locations (for progress tracking)
        await epub.locations.generate(1024);
        setTotalLocations(epub.locations.total);

        // Load saved position
        const savedLocation = localStorage.getItem(`book-position-${book.id}`);
        if (savedLocation) {
          await rendition.display(savedLocation);
        }

        // Set up navigation events
        rendition.on('relocated', (location: any) => {
          setCurrentLocation(location.start.cfi);
          
          // Calculate progress
          const currentLocation = epub.locations.locationFromCfi(location.start.cfi);
          const progressPercent = (currentLocation / epub.locations.total) * 100;
          const roundedProgress = Math.round(progressPercent);
          setProgress(roundedProgress);

          // Save position locally
          localStorage.setItem(`book-position-${book.id}`, location.start.cfi);
          
          // Save progress to server (debounced)
          const progressFloat = progressPercent / 100;
          if (progressFloat > 0 && progressFloat <= 1) {
            booksApi.setProgress(book.id, progressFloat).catch(error => {
              console.error('Error saving progress:', error);
            });
          }
        });

        // Set up key navigation
        rendition.on('keyup', (event: KeyboardEvent) => {
          if (event.key === 'ArrowLeft') {
            rendition.prev();
          } else if (event.key === 'ArrowRight') {
            rendition.next();
          }
        });

        // Set up click navigation
        rendition.on('click', (event: MouseEvent) => {
          const rect = containerRef.current!.getBoundingClientRect();
          const clickX = event.clientX - rect.left;
          const centerX = rect.width / 2;

          if (clickX < centerX / 2) {
            rendition.prev();
          } else if (clickX > centerX + centerX / 2) {
            rendition.next();
          } else {
            setShowControls(!showControls);
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing EPUB:', error);
        setIsLoading(false);
      }
    };

    initializeEpub();

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [epubUrl, book.id]);

  const applySettings = (rendition: any, newSettings: ReaderSettings) => {
    // Apply font size
    rendition.themes.fontSize(`${newSettings.fontSize}px`);

    // Apply font family
    const fontFamily = newSettings.fontFamily === 'serif' 
      ? 'Times New Roman, serif' 
      : 'Arial, sans-serif';
    rendition.themes.font(fontFamily);

    // Apply line height
    rendition.themes.default({
      'line-height': newSettings.lineHeight.toString(),
    });

    // Apply theme
    const themes = {
      light: {
        body: {
          'background-color': '#ffffff',
          'color': '#000000',
        },
      },
      dark: {
        body: {
          'background-color': '#1a1a1a',
          'color': '#e5e5e5',
        },
      },
      sepia: {
        body: {
          'background-color': '#f4f1ea',
          'color': '#5c4b37',
        },
      },
    };

    rendition.themes.default(themes[newSettings.theme]);
  };

  const handleSettingsChange = (newSettings: ReaderSettings) => {
    setSettings(newSettings);
    if (renditionRef.current) {
      applySettings(renditionRef.current, newSettings);
    }
  };

  const navigateToPage = (direction: 'prev' | 'next') => {
    if (renditionRef.current) {
      if (direction === 'prev') {
        renditionRef.current.prev();
      } else {
        renditionRef.current.next();
      }
    }
  };

  const navigateToProgress = (progressPercent: number) => {
    if (epubRef.current && renditionRef.current) {
      const targetLocation = Math.floor((progressPercent / 100) * totalLocations);
      const cfi = epubRef.current.locations.cfiFromLocation(targetLocation);
      if (cfi) {
        renditionRef.current.display(cfi);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری کتاب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden">
      {/* Toolbar */}
      <ReaderToolbar
        book={book}
        progress={progress}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={onClose}
        onProgressChange={navigateToProgress}
      />

      {/* Reader Container */}
      <div
        ref={containerRef}
        className="h-full w-full focus:outline-none"
        style={{ 
          height: 'calc(100vh - 64px)',
          backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : 
                          settings.theme === 'sepia' ? '#f4f1ea' : '#ffffff'
        }}
        tabIndex={0}
      />

      {/* Navigation Controls */}
      {showControls && (
        <ReaderControls
          onPrevPage={() => navigateToPage('prev')}
          onNextPage={() => navigateToPage('next')}
          onClose={() => setShowControls(false)}
        />
      )}

      {/* Ad Placeholder */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <div className="ad-placeholder max-w-md mx-auto h-16">
          <p className="text-xs">فضای تبلیغاتی</p>
        </div>
      </div>
    </div>
  );
}
