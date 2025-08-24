'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Global type declaration for the EPUB parser instance
declare global {
  interface Window {
    currentEpubParser?: any;
  }
}
import { Book } from '@/types/api';
import { booksApi } from '@/lib/api';
import { EpubParser, EpubSection, EpubMetadata } from '@/lib/epub-parser';
import { useReaderSettings, ReaderSettings, useSettingsListener } from '@/hooks/useReaderSettings';
import ReaderToolbar from './ReaderToolbar';
import FloatingNavigation from './FloatingNavigation';
import TableOfContents from './TableOfContents';
import BookmarkPanel from './BookmarkPanel';
import SearchPanel from './SearchPanel';
import SettingsPanel from './SettingsPanel';
import ProgressBar from './ProgressBar';
import { 
  BookOpen, 
  Bookmark, 
  Search, 
  Settings, 
  List, 
  Eye, 
  EyeOff,
  Minimize2,
  Maximize2,
  RotateCcw
} from 'lucide-react';

interface EnhancedReaderProps {
  book: Book;
  epubUrl: string;
  onClose: () => void;
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

interface Bookmark {
  id: string;
  cfi: string;
  text: string;
  note?: string;
  createdAt: string;
}

interface PanelState {
  toc: boolean;
  bookmarks: boolean;
  search: boolean;
  settings: boolean;
}

interface ToolbarState {
  visible: boolean;
  minimized: boolean;
  position: 'top' | 'bottom' | 'floating';
}

export default function EnhancedReader({ book, epubUrl, onClose }: EnhancedReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  
  // Use global reader settings
  const { settings } = useReaderSettings();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<BookProgress>({
    fraction: 0,
    location: 0,
    totalLocations: 0,
    section: { index: 0, href: '', label: '' },
    cfi: ''
  });

  const [panels, setPanels] = useState<PanelState>({
    toc: false,
    bookmarks: false,
    search: false,
    settings: false,
  });

  const [toolbar, setToolbar] = useState<ToolbarState>({
    visible: true,
    minimized: false,
    position: 'top',
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState<EpubSection | null>(null);
  const [sections, setSections] = useState<EpubSection[]>([]);
  const [metadata, setMetadata] = useState<EpubMetadata>({});
  const [preservedContent, setPreservedContent] = useState<string | null>(null);

  // Initialize EPUB parser and viewer
  const initializeReader = useCallback(async () => {
    if (!containerRef.current || !epubUrl) {
      console.log('Cannot initialize reader:', { 
        hasContainer: !!containerRef.current, 
        hasEpubUrl: !!epubUrl,
        epubUrl 
      });
      return;
    }

    console.log('Initializing reader with URL:', epubUrl);
    console.log('Book info:', book);
    console.log('Container ref:', containerRef.current);

    try {
      setIsLoading(true);
      setError(null);

             // Initialize EPUB parser
       const parser = new EpubParser();
       await parser.loadFromUrl(epubUrl);
       
       // Store parser instance globally for reuse
       window.currentEpubParser = parser;
       
       const parsedSections = parser.getSections();
       const parsedMetadata = parser.getMetadata();
       
       
       
       
       
       setSections(parsedSections);
       setMetadata(parsedMetadata);
       setProgress(prev => ({ ...prev, totalLocations: parsedSections.length }));

                   // Load saved progress or first section
      const savedProgress = localStorage.getItem(`book-progress-${book.id}`);
      let sectionToLoad = 0;
      
      if (savedProgress) {
        try {
          const saved = JSON.parse(savedProgress);
          if (saved.sectionIndex < parsedSections.length) {
            sectionToLoad = saved.sectionIndex;
            console.log('Loading saved progress section:', saved.sectionIndex);
          }
        } catch (error) {
          console.warn('Error parsing saved progress:', error);
        }
      }
      
             if (parsedSections.length > 0) {
         // Pass parsedSections directly to avoid state update delay
         await loadSectionWithSections(sectionToLoad, parsedSections);
       }

      setIsLoading(false);
    } catch (error: any) {
      console.error('Error initializing reader:', error);
      setError(error.message || 'خطا در بارگذاری کتاب');
      setIsLoading(false);
    }
  }, [epubUrl, book.id]);

  // Render section content
  const renderSection = useCallback((section: EpubSection, index: number) => {
    if (!containerRef.current) return;
    
    // Preserve content for future settings changes
    if (section.content) {
      setPreservedContent(section.content);
    }
    

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: ${getFontFamily(settings.fontFamily)};
            font-size: ${settings.fontSize}px;
            line-height: ${settings.lineHeight};
            margin: 0;
            padding: ${settings.margin}px;
            background-color: ${getThemeColors(settings.theme).background};
            color: ${getThemeColors(settings.theme).text};
            max-width: ${getWidthValue(settings.width)}px;
            margin: 0 auto;
            text-align: ${settings.justify ? 'justify' : 'right'};
            direction: rtl;
            -webkit-hyphens: ${settings.hyphenation ? 'auto' : 'none'};
            -ms-hyphens: ${settings.hyphenation ? 'auto' : 'none'};
            hyphens: ${settings.hyphenation ? 'auto' : 'none'};
          }
          p { 
            margin-bottom: 1em; 
            text-indent: ${settings.justify ? '1.5em' : '0'};
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
            border-right: 3px solid ${getThemeColors(settings.theme).accent};
            background-color: ${getThemeColors(settings.theme).blockquote};
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
            color: ${getThemeColors(settings.theme).accent};
          }
          .page-number {
            text-align: center;
            margin-top: 2em;
            font-size: 0.9em;
            color: ${getThemeColors(settings.theme).muted};
          }
        </style>
      </head>
      <body>
        <div class="chapter-title">${section.label}</div>
        <div class="content">
          ${section.content ? 
            // Clean and process the EPUB content
            section.content
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
              .replace(/<link[^>]*>/gi, '') // Remove link tags
              .replace(/<meta[^>]*>/gi, '') // Remove meta tags
              .replace(/<title[^>]*>.*?<\/title>/gi, '') // Remove title tags
              .replace(/<head[^>]*>.*?<\/head>/gi, '') // Remove head tags
              .replace(/<body[^>]*>|<\/body>/gi, '') // Remove body tags
              .replace(/<html[^>]*>|<\/html>/gi, '') // Remove html tags
              .replace(/xmlns="[^"]*"/gi, '') // Remove xmlns attributes
              .replace(/epub:type="[^"]*"/gi, '') // Remove epub:type attributes
              .replace(/class="[^"]*"/gi, '') // Remove class attributes
              .replace(/id="[^"]*"/gi, '') // Remove id attributes
              .replace(/style="[^"]*"/gi, '') // Remove style attributes
            : `
            <div style="text-align: center; padding: 2em;">
              <h1>${section.label}</h1>
              <p>محتوای این فصل در حال بارگذاری است...</p>
              <p><strong>کتاب:</strong> ${metadata.title || book.title}</p>
              <p><strong>نویسنده:</strong> ${metadata.creator?.join(', ') || book.author}</p>
              <p>برای نمایش محتوای واقعی کتاب، لطفاً صبر کنید...</p>
            </div>
          `}
        </div>
        <div class="page-number">صفحه ${index + 1} از ${sections.length}</div>
      </body>
      </html>
    `;

    // Create iframe for content
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.srcdoc = htmlContent;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);
  }, [settings, metadata, book, sections]);

  // Load specific section with sections array parameter
  const loadSectionWithSections = useCallback(async (sectionIndex: number, sectionsArray: EpubSection[]) => {
    console.log(`loadSectionWithSections called with index ${sectionIndex}, sections length: ${sectionsArray.length}`);
    
    if (sectionIndex < 0 || sectionIndex >= sectionsArray.length) {
      console.log('Invalid section index, returning early');
      return;
    }

    const section = sectionsArray[sectionIndex];
    
    // Load the actual content from the EPUB
    let content = '';
    try {
      console.log('Loading section content...');
      // Use the existing parser instance if available, or create a new one
      if (!window.currentEpubParser) {
        console.log('Creating new parser instance...');
        window.currentEpubParser = new EpubParser();
        await window.currentEpubParser.loadFromUrl(epubUrl);
      }
      content = await window.currentEpubParser.getSectionContent(sectionIndex);
      console.log(`Loaded content for section ${sectionIndex}:`, content ? `${content.length} characters` : 'No content');
      
      // Preserve the content for settings changes
      if (content) {
        setPreservedContent(content);
      }
    } catch (error) {
      console.error('Error loading section content:', error);
      content = `<p>خطا در بارگذاری محتوای فصل</p>`;
    }
    
    // Ensure the section has content before setting it
    const sectionWithContent = { ...section, content };
    setCurrentSection(sectionWithContent);
    
    // Update progress
    const newProgress = {
      fraction: sectionIndex / sectionsArray.length,
      location: sectionIndex,
      totalLocations: sectionsArray.length,
      section: {
        index: section.index,
        href: section.href,
        label: section.label
      },
      cfi: `epubcfi(/${sectionIndex * 2 + 2}!/)`
    };
    
    setProgress(newProgress);
    
    // Clear preserved content when navigating to a new section
    setPreservedContent(null);
    
    // Save progress
    localStorage.setItem(`book-progress-${book.id}`, JSON.stringify({
      sectionIndex,
      cfi: newProgress.cfi,
      timestamp: Date.now()
    }));

    // Save to API
    try {
      await booksApi.setProgress(book.id, newProgress.fraction);
    } catch (error) {
      console.error('Error saving progress to API:', error);
    }

    // Render section content with actual content
    renderSection({ ...section, content }, sectionIndex);
    console.log(`Section ${sectionIndex} loaded and rendered successfully`);
  }, [book.id, epubUrl, renderSection]);

  // Load specific section
  const loadSection = useCallback(async (sectionIndex: number) => {
    await loadSectionWithSections(sectionIndex, sections);
  }, [sections, loadSectionWithSections]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (progress.location < progress.totalLocations - 1) {
      loadSection(progress.location + 1);
    }
  }, [progress, loadSection]);

  const goToPrev = useCallback(() => {
    if (progress.location > 0) {
      loadSection(progress.location - 1);
    }
  }, [progress, loadSection]);

  const goToSection = useCallback((sectionIndex: number) => {
    loadSection(sectionIndex);
  }, [loadSection]);

  const goToProgress = useCallback((fraction: number) => {
    const sectionIndex = Math.floor(fraction * sections.length);
    loadSection(sectionIndex);
  }, [sections.length, loadSection]);

  // Panel management
  const togglePanel = useCallback((panel: keyof PanelState) => {
    setPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  // Wrapper for components that expect string instead of keyof PanelState
  const togglePanelString = useCallback((panel: string) => {
    if (panel === 'toc' || panel === 'bookmarks' || panel === 'search' || panel === 'settings') {
      togglePanel(panel as keyof PanelState);
    }
  }, [togglePanel]);

  const closeAllPanels = useCallback(() => {
    setPanels({
      toc: false,
      bookmarks: false,
      search: false,
      settings: false,
    });
  }, []);

  // Bookmark navigation
  const goToBookmark = useCallback((bookmark: Bookmark) => {
    // Parse CFI to find section index
    // CFI format: epubcfi(/{sectionIndex * 2 + 2}!/)
    try {
      const cfiMatch = bookmark.cfi.match(/epubcfi\(\/(\d+)!/);
      if (cfiMatch) {
        const sectionNumber = parseInt(cfiMatch[1]);
        const sectionIndex = Math.floor((sectionNumber - 2) / 2);
        
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
          goToSection(sectionIndex);
          closeAllPanels();
        }
      }
    } catch (error) {
      console.error('Error parsing bookmark CFI:', error);
    }
  }, [sections.length, goToSection, closeAllPanels]);

  // Toolbar management
  const toggleToolbar = useCallback(() => {
    setToolbar(prev => ({ ...prev, visible: !prev.visible }));
  }, []);

  const minimizeToolbar = useCallback(() => {
    setToolbar(prev => ({ ...prev, minimized: !prev.minimized }));
  }, []);

  const changeToolbarPosition = useCallback((position: 'top' | 'bottom' | 'floating') => {
    setToolbar(prev => ({ ...prev, position }));
  }, []);

  // Bookmark management
  const addBookmark = useCallback(() => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      cfi: progress.cfi,
      text: currentSection?.label || 'Bookmark',
      createdAt: new Date().toISOString(),
    };
    
    setBookmarks(prev => {
      const updatedBookmarks = [...prev, newBookmark];
      localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updatedBookmarks));
      return updatedBookmarks;
    });
  }, [progress.cfi, currentSection, book.id]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => {
      const updatedBookmarks = prev.filter(b => b.id !== bookmarkId);
      localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updatedBookmarks));
      return updatedBookmarks;
    });
  }, [book.id]);

  // Search functionality
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Simple search implementation - in a real app, you'd use the EPUB parser's search
    const results = sections
      .map((section, index) => ({
        section,
        index,
        matches: section.content?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
      }))
      .filter(result => result.matches > 0);

    setSearchResults(results);
  }, [sections]);

  // Listen for settings changes
  useSettingsListener((newSettings) => {
    console.log('EnhancedReader: Settings changed, re-rendering section:', newSettings);
    
    // Re-render current section with new settings, but preserve content
    if (currentSection) {
      if (currentSection.content) {
        // Ensure we have the content before re-rendering
        renderSection(currentSection, progress.location);
      } else if (preservedContent) {
        // Use preserved content if current section content is missing
        console.log('Using preserved content for re-render...');
        const sectionWithContent = { ...currentSection, content: preservedContent };
        renderSection(sectionWithContent, progress.location);
      } else {
        // If no preserved content, reload the section
        console.log('No preserved content, reloading section...');
        loadSection(progress.location);
      }
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToNext();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToPrev();
          break;
        case 'Escape':
          event.preventDefault();
          closeAllPanels();
          break;
        case ' ':
          event.preventDefault();
          goToNext();
          break;
        case 'b':
          event.preventDefault();
          addBookmark();
          break;
        case 't':
          event.preventDefault();
          togglePanel('toc');
          break;
        case 's':
          event.preventDefault();
          togglePanel('search');
          break;
        case 'c':
          event.preventDefault();
          togglePanel('settings');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, closeAllPanels, addBookmark, togglePanel]);

  // Load saved bookmarks
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`bookmarks-${book.id}`);
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarks(parsed);
      } catch (error) {
        console.error('Error loading saved bookmarks:', error);
      }
    }
  }, [book.id]);

  // Initialize reader
  useEffect(() => {
    initializeReader();
  }, [initializeReader]);

  // Apply current global settings when reader initializes
  useEffect(() => {
    if (currentSection && !isLoading) {
      // Apply current global settings to ensure consistency
      renderSection(currentSection, progress.location);
    }
  }, [settings, currentSection, isLoading, progress.location, renderSection]);

  // Helper functions
  const getFontFamily = (family: string) => {
    switch (family) {
      case 'serif': return 'Georgia, "Times New Roman", serif';
      case 'sans-serif': return 'Arial, "Helvetica Neue", sans-serif';
      case 'monospace': return 'Courier New, monospace';
      default: return 'Georgia, serif';
    }
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'dark':
        return { 
          background: '#1a1a1a', 
          text: '#e5e5e5', 
          accent: '#3b82f6',
          muted: '#888',
          blockquote: 'rgba(255,255,255,0.05)'
        };
      case 'sepia':
        return { 
          background: '#f4f1ea', 
          text: '#5c4b37', 
          accent: '#8b4513',
          muted: '#8b7355',
          blockquote: 'rgba(139, 69, 19, 0.1)'
        };
      case 'night':
        return { 
          background: '#0a0a0a', 
          text: '#d4d4d4', 
          accent: '#60a5fa',
          muted: '#6b7280',
          blockquote: 'rgba(96, 165, 250, 0.1)'
        };
      default:
        return { 
          background: '#ffffff', 
          text: '#000000', 
          accent: '#3b82f6',
          muted: '#6b7280',
          blockquote: 'rgba(0,0,0,0.05)'
        };
    }
  };

  const getWidthValue = (width: string) => {
    switch (width) {
      case 'narrow': return 600;
      case 'wide': return 1000;
      default: return 800;
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            خطا در بارگذاری کتاب
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setError(null);
                initializeReader();
              }}
              className="btn btn-primary mr-2"
            >
              تلاش مجدد
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              بازگشت
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Main Toolbar */}
      {toolbar.visible && (
        <ReaderToolbar
          book={book}
          progress={progress}
          onClose={onClose}
          onProgressChange={goToProgress}
          onTogglePanel={togglePanelString}
          onAddBookmark={addBookmark}
          onToggleToolbar={toggleToolbar}
          onMinimizeToolbar={minimizeToolbar}
          onToolbarPositionChange={changeToolbarPosition}
          minimized={toolbar.minimized}
          position={toolbar.position}
        />
      )}

      {/* Content Area */}
      <div className="flex h-full" style={{ paddingTop: toolbar.visible && toolbar.position === 'top' ? '64px' : '0' }}>
        {/* Left Panel */}
        {panels.toc && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            <TableOfContents
              sections={sections}
              currentSection={progress.location}
              onSectionSelect={goToSection}
              onClose={() => togglePanel('toc')}
              bookmarks={bookmarks}
              onGoToBookmark={goToBookmark}
            />
          </div>
        )}

        {/* Main Reader */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="h-full w-full focus:outline-none cursor-pointer"
            style={{ 
              backgroundColor: getThemeColors(settings.theme).background
            }}
            tabIndex={0}
          />

                     {/* Loading Overlay */}
           {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 z-50">
               <div className="text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                 <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری کتاب...</p>
                 
               </div>
             </div>
           )}

                     {/* Floating Navigation */}
           <FloatingNavigation
             onNext={goToNext}
             onPrev={goToPrev}
             onToggleToolbar={toggleToolbar}
             onTogglePanel={togglePanelString}
             currentPanel={panels}
             hasNext={progress.location < progress.totalLocations - 1}
             hasPrev={progress.location > 0}
           />

                       
        </div>

        {/* Right Panel */}
        {panels.bookmarks && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <BookmarkPanel
              bookmarks={bookmarks}
              onRemoveBookmark={removeBookmark}
              onGoToBookmark={goToBookmark}
              onClose={() => togglePanel('bookmarks')}
            />
          </div>
        )}

        {panels.search && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <SearchPanel
              onSearch={performSearch}
              results={searchResults}
              onResultSelect={(result) => {
                goToSection(result.index);
                closeAllPanels();
              }}
              onClose={() => togglePanel('search')}
            />
          </div>
        )}

        {panels.settings && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <SettingsPanel
              onClose={() => togglePanel('settings')}
            />
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      {toolbar.visible && toolbar.position === 'bottom' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2">
          <ProgressBar
            progress={progress}
            onProgressChange={goToProgress}
            onTogglePanel={togglePanelString}
            onAddBookmark={addBookmark}
          />
        </div>
      )}

      {/* Floating Toolbar Toggle */}
      {!toolbar.visible && (
        <button
          onClick={toggleToolbar}
          className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-primary-600"
        >
          <Eye className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
