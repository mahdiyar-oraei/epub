'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const epubRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Use ref callback to detect when container is ready
  const containerRefCallback = (element: HTMLDivElement | null) => {
    if (containerRef.current !== element) {
      containerRef.current = element;
      if (element && epubUrl) {
        console.log('EpubReader: Container is ready via callback, starting initialization');
        // Small delay to ensure DOM is fully ready
        setTimeout(() => {
          if (containerRef.current && epubUrl && !renditionRef.current) {
            initializeEpub();
          }
        }, 50);
      }
    }
  };

  const initializeEpub = async () => {
    if (!containerRef.current || !epubUrl) {
      console.log('EpubReader: Missing container or epubUrl in initializeEpub', {
        hasContainer: !!containerRef.current,
        epubUrl: !!epubUrl
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Convert relative URL to absolute URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://134.209.198.206:3000/api/v1';
      const baseUrl = API_BASE_URL.replace('/api/v1', '');
      
      // Ensure proper URL construction
      let fullEpubUrl;
      if (epubUrl.startsWith('http')) {
        fullEpubUrl = epubUrl;
      } else {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = epubUrl.startsWith('/') ? epubUrl : `/${epubUrl}`;
        fullEpubUrl = `${baseUrl}${cleanPath}`;
      }
      
      console.log('EpubReader: Original URL:', epubUrl);
      console.log('EpubReader: Full URL:', fullEpubUrl);
      
      // Test if URL is accessible
      console.log('EpubReader: Testing EPUB URL accessibility...');
      try {
        const testResponse = await fetch(fullEpubUrl, { method: 'HEAD' });
        console.log('EpubReader: URL test response:', {
          status: testResponse.status,
          statusText: testResponse.statusText,
          headers: Object.fromEntries(testResponse.headers.entries())
        });
        
        if (!testResponse.ok) {
          throw new Error(`EPUB URL not accessible: ${testResponse.status} ${testResponse.statusText}`);
        }
      } catch (fetchError) {
        console.error('EpubReader: Failed to access EPUB URL:', fetchError);
        throw new Error(`Cannot access EPUB file: ${fetchError}`);
      }

      // Create EPUB instance with options to handle iframe sandboxing
      console.log('EpubReader: Creating EPUB instance...');
      const epub = new EpubBook(fullEpubUrl, {
        openAs: 'epub',
        restore: false,
        reload: true
      });
      epubRef.current = epub;

      // Set up error handling for epub
      epub.on('openFailed', (error: any) => {
        console.error('EpubReader: EPUB open failed:', error);
        throw new Error(`Failed to open EPUB: ${error}`);
      });

      console.log('EpubReader: Opening EPUB...');
      await epub.opened;
      console.log('EpubReader: EPUB opened successfully');

      // Create rendition with iframe-friendly options
      console.log('EpubReader: Creating rendition...');
      const rendition = epub.renderTo(containerRef.current!, {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        manager: 'default',
        spread: 'auto',
        minSpreadWidth: 800,
        // Add iframe options to handle sandboxing
        iframe: {
          allowScripts: true,
          allowSameOrigin: true,
          allowForms: true,
          allowPopups: true,
          allowModals: true
        }
      });
      renditionRef.current = rendition;
      console.log('EpubReader: Rendition created');

      // Apply initial settings
      console.log('EpubReader: Applying settings...');
      applySettings(rendition, settings);

      // Display the book
      console.log('EpubReader: Displaying book...');
      await rendition.display();
      console.log('EpubReader: Book displayed successfully');

      // Set up locations (for progress tracking)
      console.log('EpubReader: Generating locations...');
      await epub.locations.generate(1024);
      setTotalLocations(epub.locations.total);
      console.log('EpubReader: Locations generated, total:', epub.locations.total);

      // Load saved position
      const savedLocation = localStorage.getItem(`book-position-${book.id}`);
      if (savedLocation) {
        console.log('EpubReader: Loading saved position:', savedLocation);
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

      // Handle iframe sandboxing issues
      rendition.on('rendered', (section: any, view: any) => {
        // Try to fix iframe sandboxing issues
        if (view && view.document) {
          try {
            // Remove sandbox restrictions if possible
            const iframes = view.document.querySelectorAll('iframe');
            iframes.forEach((iframe: HTMLIFrameElement) => {
              if (iframe.sandbox) {
                iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');
              }
            });
          } catch (error) {
            console.warn('EpubReader: Could not modify iframe sandbox attributes:', error);
          }
        }
      });

      // Handle navigation errors (like 404s)
      rendition.on('navigationError', (error: any) => {
        console.error('EpubReader: Navigation error:', error);
        // Try to recover by going to next/previous section
        if (error.message && error.message.includes('404')) {
          console.log('EpubReader: 404 error detected, attempting recovery...');
          // Try to go to next section
          setTimeout(() => {
            try {
              rendition.next();
            } catch (nextError) {
              console.error('EpubReader: Failed to navigate to next section:', nextError);
              // Try previous section as fallback
              try {
                rendition.prev();
              } catch (prevError) {
                console.error('EpubReader: Failed to navigate to previous section:', prevError);
                setError('خطا در بارگذاری بخش‌های کتاب. لطفاً مجدداً تلاش کنید.');
              }
            }
          }, 1000);
        }
      });

      console.log('EpubReader: Initialization completed successfully');
      setIsLoading(false);
      } catch (error: any) {
        console.error('EpubReader: Error initializing EPUB:', error);
        console.error('EpubReader: Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setError(error.message || 'خطا در بارگذاری کتاب');
        setIsLoading(false);
      }
    };

  // Handle epubUrl changes when container is already ready
  useEffect(() => {
    if (containerRef.current && epubUrl && !renditionRef.current) {
      console.log('EpubReader: epubUrl received, container ready, starting initialization');
      initializeEpub();
    }
  }, [epubUrl]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('EpubReader: Cleaning up...');
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
          console.log('EpubReader: Rendition destroyed');
        } catch (error) {
          console.error('EpubReader: Error destroying rendition:', error);
        }
      }
    };
  }, []);

  // Handle iframe sandboxing issues after mount
  useEffect(() => {
    if (renditionRef.current) {
      const handleIframeSandboxing = () => {
        try {
          // Find all iframes in the container and fix sandbox attributes
          const iframes = containerRef.current?.querySelectorAll('iframe');
          if (iframes) {
            iframes.forEach((iframe: HTMLIFrameElement) => {
              if (iframe.sandbox) {
                // Add necessary permissions to sandbox
                iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');
              }
              // Also try to set allow attribute as fallback
              iframe.setAttribute('allow', 'script; same-origin; forms');
            });
          }
        } catch (error) {
          console.warn('EpubReader: Could not fix iframe sandboxing:', error);
        }
      };

      // Run immediately and also set up a mutation observer
      handleIframeSandboxing();

      // Set up mutation observer to handle dynamically created iframes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'IFRAME') {
                  handleIframeSandboxing();
                } else {
                  // Check for iframes in added elements
                  const iframes = element.querySelectorAll('iframe');
                  if (iframes.length > 0) {
                    handleIframeSandboxing();
                  }
                }
              }
            });
          }
        });
      });

      if (containerRef.current) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true
        });
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [renditionRef.current]);

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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            خطا در بارگذاری کتاب
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Force re-initialization by clearing and setting epubUrl
                const currentUrl = epubUrl;
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
              className="btn btn-primary mr-2"
            >
              تلاش مجدد
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              بازگشت
            </button>
          </div>
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
        ref={containerRefCallback}
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
    </div>
  );
}
