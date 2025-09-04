'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { useSettingsListener } from '@/hooks/useReaderSettings';
import { Book } from '@/types/api';
import { booksApi } from '@/lib/api';
import { EpubParser, EpubSection, EpubMetadata } from '@/lib/epub-parser';
import ReaderControls from './ReaderControls';
import ReaderToolbar from './ReaderToolbar';

interface EpubReaderProps {
  book: Book;
  epubUrl: string;
  onClose: () => void;
}

interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif' | 'monospace' | 'far-nazanin' | 'far-roya' | 'b-zar';
  theme: 'light' | 'dark' | 'sepia' | 'night';
  lineHeight: number;
}

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

interface ViewerInstance {
  open: (file: string | ArrayBuffer) => Promise<void>;
  close: () => void;
  goTo: (target: string | number) => Promise<void>;
  goToFraction: (fraction: number) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  setAppearance: (settings: any) => void;
  setView: (settings: any) => void;
  getProgress: () => BookProgress;
  getTOC: () => any[];
  getMetadata: () => any;
  addEventListener: (event: string, callback: (event: any) => void) => void;
  removeEventListener: (event: string, callback: (event: any) => void) => void;
  dispatchEvent: (event: string, data: any) => void;
  destroy: () => void;
}

// Dynamic import function for foliate-js modules
async function loadFoliateJS() {
  try {
    // Since we can't import ES modules directly in the browser context,
    // we'll create a script tag to load them
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    // Load the main foliate-js modules
    await Promise.all([
      loadScript('/src/lib/foliate-js-epub.js'),
      loadScript('/src/lib/foliate-js-epubcfi.js'),
      loadScript('/src/lib/foliate-js-overlayer.js')
    ]);

    return (window as any).foliateJS;
  } catch (error) {
    console.error('Failed to load foliate-js:', error);
    throw error;
  }
}

export default function EpubReader({ book, epubUrl, onClose }: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const [showControls, setShowControls] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    fontFamily: 'serif',
    theme: 'light',
    lineHeight: 1.6,
  });

  // Custom viewer implementation using proper EPUB parser
  const createCustomViewer = useCallback((container: HTMLElement) => {
    let currentProgress: BookProgress = {
      fraction: 0,
      location: 0,
      totalLocations: 0,
      section: { index: 0, href: '', label: '' },
      cfi: ''
    };

    let epubParser: EpubParser | null = null;
    let currentSections: EpubSection[] = [];
    let currentMetadata: EpubMetadata = {};
    let eventListeners: { [key: string]: ((event: any) => void)[] } = {};

    const viewer: ViewerInstance = {
      async open(file: string | ArrayBuffer) {
        try {
          console.log('Opening EPUB file:', typeof file === 'string' ? file : 'ArrayBuffer');
          
          // Initialize EPUB parser
          epubParser = new EpubParser();
          console.log('EPUB parser initialized');
          
          if (typeof file === 'string') {
            // Load from URL
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kianbooks.com/api/v1';
            const baseUrl = API_BASE_URL.replace('/api/v1', '');
            
            let fullEpubUrl;
            if (file.startsWith('http')) {
              fullEpubUrl = file;
            } else {
              const cleanPath = file.startsWith('/') ? file : `/${file}`;
              fullEpubUrl = `${baseUrl}${cleanPath}`;
            }

            console.log('Loading EPUB from URL:', fullEpubUrl);
            await epubParser.loadFromUrl(fullEpubUrl);
          } else {
            // Load from ArrayBuffer
            console.log('Loading EPUB from ArrayBuffer');
            await epubParser.loadFromArrayBuffer(file);
          }

          console.log('EPUB loaded, getting sections...');
          
          // Verify parser is still valid
          if (!epubParser) {
            throw new Error('EPUB parser became null after loading');
          }

          // Get parsed data
          currentSections = epubParser.getSections();
          currentMetadata = epubParser.getMetadata();
          
          console.log('Sections loaded:', currentSections.length);
          console.log('Metadata loaded:', currentMetadata);

          setTotalLocations(currentSections.length);
          currentProgress.totalLocations = currentSections.length;

          // Load first section
          if (currentSections.length > 0) {
            console.log('Loading first section...');
            await this.goTo(0);
          }

          // Trigger open event
          this.dispatchEvent('opened', { sections: currentSections, metadata: currentMetadata });
          console.log('EPUB opened successfully');
        } catch (error) {
          console.error('Error opening EPUB:', error);
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          
          // Fallback: create a simple single-section EPUB
          console.log('Creating fallback EPUB structure...');
          currentSections = [{
            index: 0,
            href: 'fallback.xhtml',
            label: 'کتاب',
            id: 'fallback'
          }];
          currentMetadata = {
            title: book.title,
            creator: [book.author],
            description: book.description || 'کتاب الکترونیکی'
          };
          
          setTotalLocations(1);
          currentProgress.totalLocations = 1;
          
          // Load fallback content
          await this.goTo(0);
          
          // Trigger open event with fallback data
          this.dispatchEvent('opened', { sections: currentSections, metadata: currentMetadata });
          console.log('Fallback EPUB structure created');
        }
      },

      close() {
        if (container) {
          container.innerHTML = '';
        }
        epubParser = null;
        currentSections = [];
        currentMetadata = {};
        eventListeners = {};
      },

            async goTo(target: string | number) {
        try {
          let sectionIndex: number;
          
          if (typeof target === 'number') {
            sectionIndex = target;
          } else {
            // If target is a CFI or other identifier, find the section
            sectionIndex = 0; // Simplified for now
          }

          if (sectionIndex < 0 || sectionIndex >= currentSections.length) {
            return;
          }

          const section = currentSections[sectionIndex];
          
          // Get actual section content from EPUB (if parser available)
          let sectionContent = '';
          if (epubParser) {
            try {
              sectionContent = await epubParser.getSectionContent(sectionIndex);
            } catch (error) {
              console.warn('Failed to get section content from parser:', error);
            }
          }
          
          // Create styled HTML content
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @font-face { font-family: 'FAR Nazanin'; src: url('/fonts/Far_Nazanin.ttf') format('truetype'); font-weight: normal; font-style: normal; font-display: swap; }
                @font-face { font-family: 'FAR Roya'; src: url('/fonts/Far_Roya.ttf') format('truetype'); font-weight: normal; font-style: normal; font-display: swap; }
                @font-face { font-family: 'B Zar'; src: url('/fonts/BZar.ttf') format('truetype'); font-weight: normal; font-style: normal; font-display: swap; }
                body {
                  font-family: ${getFontFamily(settings.fontFamily)};
                  font-size: ${settings.fontSize}px;
                  line-height: ${settings.lineHeight};
                  margin: 0;
                  padding: 40px;
                  background-color: ${getThemeColors(settings.theme).background};
                  color: ${getThemeColors(settings.theme).text};
                  max-width: 800px;
                  margin: 0 auto;
                  text-align: justify;
                }
                p { 
                  margin-bottom: 1em; 
                  text-indent: 1.5em;
                }
                h1, h2, h3, h4, h5, h6 { 
                  margin-top: 2em; 
                  margin-bottom: 1em; 
                  text-align: center;
                  text-indent: 0;
                }
                h1 { font-size: 1.8em; }
                h2 { font-size: 1.5em; }
                h3 { font-size: 1.3em; }
                blockquote {
                  margin: 1.5em 2em;
                  padding: 0.5em 1em;
                  border-left: 3px solid ${getThemeColors(settings.theme).text};
                  background-color: ${settings.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
                }
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                  margin: 1em auto;
                }
                .chapter-title {
                  text-align: center;
                  margin-bottom: 2em;
                  font-size: 1.2em;
                  font-weight: bold;
                  color: ${settings.theme === 'dark' ? '#888' : '#666'};
                }
              </style>
            </head>
            <body>
              <div class="chapter-title">${section.label}</div>
              ${sectionContent || `
                <h1>${section.label}</h1>
                <p>محتوای این فصل در حال بارگذاری است...</p>
                <p><strong>کتاب:</strong> ${currentMetadata.title || book.title}</p>
                <p><strong>نویسنده:</strong> ${currentMetadata.creator?.join(', ') || book.author}</p>
                <p><strong>پیشرفت:</strong> ${Math.round((sectionIndex / currentSections.length) * 100)}%</p>
              `}
            </body>
            </html>
          `;

          // Create iframe to display content
          const iframe = document.createElement('iframe');
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          iframe.srcdoc = htmlContent;

          container.innerHTML = '';
          container.appendChild(iframe);

          // Update progress
          currentProgress = {
            fraction: sectionIndex / currentSections.length,
            location: sectionIndex,
            totalLocations: currentSections.length,
            section: {
              index: section.index,
              href: section.href,
              label: section.label
            },
            cfi: `epubcfi(/${sectionIndex * 2 + 2}!/)`
          };

          setProgress(Math.round(currentProgress.fraction * 100));

          // Save progress
          const progressFloat = currentProgress.fraction;
          if (progressFloat > 0 && progressFloat <= 1) {
            booksApi.setProgress(book.id, progressFloat).catch(error => {
              console.error('Error saving progress:', error);
            });
          }

          // Save position locally
          localStorage.setItem(`book-position-${book.id}`, currentProgress.cfi);

          // Trigger relocated event
          this.dispatchEvent('relocated', currentProgress);
        } catch (error) {
          console.error('Error navigating to section:', error);
        }
      },

      async goToFraction(fraction: number) {
        const targetIndex = Math.floor(fraction * currentSections.length);
        await this.goTo(Math.max(0, Math.min(targetIndex, currentSections.length - 1)));
      },

      async next() {
        const nextIndex = currentProgress.location + 1;
        if (nextIndex < currentSections.length) {
          await this.goTo(nextIndex);
        }
      },

      async prev() {
        const prevIndex = currentProgress.location - 1;
        if (prevIndex >= 0) {
          await this.goTo(prevIndex);
        }
      },

      setAppearance(appearanceSettings: any) {
        // Apply appearance settings to current iframe
        const iframe = container.querySelector('iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentDocument) {
          const body = iframe.contentDocument.body;
          if (body) {
            body.style.fontFamily = appearanceSettings.fontFamily || body.style.fontFamily;
            body.style.fontSize = appearanceSettings.fontSize ? `${appearanceSettings.fontSize}px` : body.style.fontSize;
            body.style.lineHeight = appearanceSettings.lineHeight?.toString() || body.style.lineHeight;
            body.style.backgroundColor = appearanceSettings.backgroundColor || body.style.backgroundColor;
            body.style.color = appearanceSettings.foregroundColor || body.style.color;
          }
        }
      },

      setView(viewSettings: any) {
        // Handle view settings like flow, width, etc.
        console.log('View settings updated:', viewSettings);
      },

      getProgress() {
        return currentProgress;
      },

      getTOC() {
        return epubParser ? epubParser.getTOC() : [];
      },

      getMetadata() {
        return currentMetadata;
      },

      addEventListener(event: string, callback: (event: any) => void) {
        if (!eventListeners[event]) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(callback);
      },

      removeEventListener(event: string, callback: (event: any) => void) {
        if (eventListeners[event]) {
          eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
        }
      },

      dispatchEvent(event: string, data: any) {
        if (eventListeners[event]) {
          eventListeners[event].forEach(callback => callback(data));
        }
      },

      destroy() {
        this.close();
      }
    };

    return viewer;
  }, [book, epubUrl, settings]);

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'dark':
        return { background: '#1a1a1a', text: '#e5e5e5' };
      case 'sepia':
        return { background: '#f4f1ea', text: '#5c4b37' };
      case 'night':
        return { background: '#0a0a0a', text: '#d4d4d4' };
      default:
        return { background: '#ffffff', text: '#000000' };
    }
  };

  const getFontFamily = (family: ReaderSettings['fontFamily']) => {
    switch (family) {
      case 'serif':
        return 'Georgia, "Times New Roman", serif';
      case 'sans-serif':
        return 'Arial, "Helvetica Neue", sans-serif';
      case 'monospace':
        return 'Courier New, monospace';
      case 'far-nazanin':
        return '"FAR Nazanin", Georgia, serif';
      case 'far-roya':
        return '"FAR Roya", Georgia, serif';
      case 'b-zar':
        return '"B Zar", Georgia, serif';
      default:
        return 'Georgia, serif';
    }
  };

  const initializeViewer = useCallback(async () => {
    if (!containerRef.current || !epubUrl) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create custom viewer instance
      const viewer = createCustomViewer(containerRef.current);
      viewerRef.current = viewer;

      // Set up event listeners
      viewer.addEventListener('opened', (event) => {
        console.log('EPUB opened:', event);
        setIsLoading(false);
      });

      viewer.addEventListener('relocated', (location) => {
        console.log('Location changed:', location);
      });

      // Load saved position
      const savedLocation = localStorage.getItem(`book-position-${book.id}`);
      
      // Open the EPUB
      await viewer.open(epubUrl);
      
      // Go to saved position if available
      if (savedLocation) {
        // For now, just go to first chapter
        await viewer.goTo(0);
      }

    } catch (error: any) {
      console.error('Error initializing viewer:', error);
      setError(error.message || 'خطا در بارگذاری کتاب');
      setIsLoading(false);
    }
  }, [epubUrl, book.id, createCustomViewer]);

  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!viewerRef.current) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          viewerRef.current.next();
          break;
        case 'ArrowRight':
          event.preventDefault();
          viewerRef.current.prev();
          break;
        case 'Escape':
          event.preventDefault();
          setShowControls(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize viewer when container and URL are ready
  useEffect(() => {
    if (containerRef.current && epubUrl) {
      initializeViewer();
    }
  }, [initializeViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  const handleSettingsChange = useCallback((newSettings: ReaderSettings) => {
    setSettings(newSettings);
    
    if (viewerRef.current) {
      viewerRef.current.setAppearance({
        fontFamily: getFontFamily(newSettings.fontFamily),
        fontSize: newSettings.fontSize,
        lineHeight: newSettings.lineHeight,
        backgroundColor: getThemeColors(newSettings.theme).background,
        foregroundColor: getThemeColors(newSettings.theme).text,
      });
    }
  }, []);

  // Listen to global reader settings changes and apply to iframe body
  useSettingsListener((newSettings: any) => {
    const mapped = {
      fontSize: newSettings.fontSize,
      fontFamily: newSettings.fontFamily as ReaderSettings['fontFamily'],
      theme: newSettings.theme as ReaderSettings['theme'],
      lineHeight: newSettings.lineHeight,
    } as ReaderSettings;
    handleSettingsChange(mapped);
  });

  const navigateToPage = useCallback((direction: 'prev' | 'next') => {
    if (viewerRef.current) {
      if (direction === 'prev') {
        viewerRef.current.prev();
      } else {
        viewerRef.current.next();
      }
    }
  }, []);

  const navigateToProgress = useCallback((progressPercent: number) => {
    if (viewerRef.current) {
      const fraction = progressPercent / 100;
      viewerRef.current.goToFraction(fraction);
    }
  }, []);

  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const centerX = rect.width / 2;

    if (clickX < centerX / 2) {
      navigateToPage('prev');
    } else if (clickX > centerX + centerX / 2) {
      navigateToPage('next');
    } else {
      setShowControls(!showControls);
    }
  }, [navigateToPage, showControls]);

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
                initializeViewer();
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
        progress={{
          fraction: progress / 100,
          location: Math.floor((progress / 100) * totalLocations),
          totalLocations: totalLocations,
          section: {
            index: 0,
            href: '',
            label: ''
          },
          cfi: ''
        }}
        onClose={onClose}
        onProgressChange={navigateToProgress}
        onTogglePanel={() => {}}
        onAddBookmark={() => {}}
        onToggleToolbar={() => {}}
        onMinimizeToolbar={() => {}}
        onToolbarPositionChange={() => {}}
        minimized={false}
        position="top"
      />

      {/* Reader Container */}
      <div
        ref={containerRef}
        className="h-full w-full focus:outline-none cursor-pointer"
        style={{ 
          height: 'calc(100vh - 64px)',
          backgroundColor: getThemeColors(settings.theme).background
        }}
        tabIndex={0}
        onClick={handleContainerClick}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری کتاب...</p>
          </div>
        </div>
      )}

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