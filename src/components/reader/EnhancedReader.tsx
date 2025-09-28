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
import FloatingSettings from './FloatingSettings';
import FloatingTOC from './FloatingTOC';
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
  RotateCcw,
  ChevronLeft,
  ChevronRight
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
  const readingStartTime = useRef<number>(Date.now()); // Track when user started reading
  
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

  // Removed panel and toolbar state since we're using floating buttons only

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [currentSection, setCurrentSection] = useState<EpubSection | null>(null);
  const [sections, setSections] = useState<EpubSection[]>([]);
  const [metadata, setMetadata] = useState<EpubMetadata>({});
  const [preservedContent, setPreservedContent] = useState<string | null>(null);

  // Handle internal section links
  const handleInternalSectionLink = useCallback((href: string, targetSections: EpubSection[], goToSectionFn: (index: number) => void) => {
    console.log('Handling internal section link:', href);
    console.log('Available sections:', targetSections.map((s, i) => `${i}: ${s.href} - ${s.label}`));
    
    // Extract filename and anchor from href
    const parts = href.split('#');
    const filename = parts[0];
    const anchorId = parts[1];
    
    // Find the section that matches this filename
    let targetSectionIndex = -1;
    
    // Try to match by href or filename
    for (let i = 0; i < targetSections.length; i++) {
      const section = targetSections[i];
      if (section.href === filename || 
          section.href.endsWith(filename) || 
          filename.includes(section.href)) {
        targetSectionIndex = i;
        break;
      }
    }
    
    // If not found, try to parse section number from filename
    if (targetSectionIndex === -1) {
      const match = filename.match(/(\d+)/);
      if (match) {
        const sectionNumber = parseInt(match[1]);
        // Try different indexing strategies
        if (sectionNumber > 0 && sectionNumber <= targetSections.length) {
          targetSectionIndex = sectionNumber - 1; // Zero-based index
        } else if (sectionNumber >= 0 && sectionNumber < targetSections.length) {
          targetSectionIndex = sectionNumber; // Already zero-based
        }
      }
    }
    
    if (targetSectionIndex >= 0 && targetSectionIndex < targetSections.length) {
      console.log(`Navigating to section ${targetSectionIndex} with anchor ${anchorId || 'none'}`);
      goToSectionFn(targetSectionIndex);
      
      // If there's an anchor, scroll to it after navigation
      if (anchorId) {
        setTimeout(() => {
          const iframe = containerRef.current?.querySelector('iframe');
          const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
          if (iframeDoc) {
            const targetElement = iframeDoc.getElementById(anchorId);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 500); // Wait for section to load
      }
    } else {
      console.warn('Could not find target section for href:', href);
    }
  }, []);

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

      // Don't load any section here - let restoreEnhancedPosition handle it
      // This will be called after sections are set and the effect runs

      setIsLoading(false);
    } catch (error: any) {
      console.error('Error initializing reader:', error);
      setError(error.message || 'خطا در بارگذاری کتاب');
      setIsLoading(false);
    }
  }, [epubUrl, book.id]);

  // Render section content
  const applyAppearanceToIframe = useCallback(() => {
    const iframe = containerRef.current?.querySelector('iframe');
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!iframeDoc) return;
    const body = iframeDoc.body;
    if (!body) return;
    body.style.fontFamily = getFontFamily(settings.fontFamily);
    body.style.fontSize = `${settings.fontSize}px`;
    body.style.lineHeight = String(settings.lineHeight);
    body.style.backgroundColor = getThemeColors(settings.theme).background;
    body.style.color = getThemeColors(settings.theme).text;
    body.style.maxWidth = `${getWidthValue(settings.width)}px`;
    body.style.textAlign = settings.justify ? 'justify' : 'right';
    body.style.padding = `${settings.margin}px`;
  }, [settings]);

  const renderSection = useCallback((section: EpubSection, index: number, loadSectionFn?: (sectionIndex: number, sectionsArray: EpubSection[]) => Promise<void>) => {
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
          @font-face { font-family: 'FAR Nazanin'; src: url('/fonts/Far_Nazanin.ttf') format('truetype'); font-weight: normal; font-style: normal; font-display: swap; }
          @font-face { font-family: 'FAR Roya'; src: url('/fonts/Far_Roya.ttf') format('truetype'); font-weight: normal; font-style: normal; font-display: swap; }
          @font-face { font-family: 'B Zar'; src: url('/fonts/BZar.ttf') format('truetype'); font-weight: normal; font-style: normal; font-display: swap; }
          html {
            height: 100%;
            overflow-y: auto;
          }
          body {
            font-family: ${getFontFamily(settings.fontFamily)};
            font-size: ${settings.fontSize}px;
            line-height: ${settings.lineHeight};
            margin: 0;
            padding: ${settings.margin}px;
            padding-bottom: ${settings.margin * 3}px;
            background-color: ${getThemeColors(settings.theme).background};
            color: ${getThemeColors(settings.theme).text};
            max-width: ${getWidthValue(settings.width)}px;
            margin: 0 auto;
            text-align: ${settings.justify ? 'justify' : 'right'};
            direction: rtl;
            -webkit-hyphens: ${settings.hyphenation ? 'auto' : 'none'};
            -ms-hyphens: ${settings.hyphenation ? 'auto' : 'none'};
            hyphens: ${settings.hyphenation ? 'auto' : 'none'};
            min-height: calc(100vh - ${settings.margin * 6}px);
            box-sizing: border-box;
            overflow-x: hidden;
            word-wrap: break-word;
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
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          img[src*="cover"] {
            max-width: 300px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
          }
          img:not([src*="cover"]) {
            max-width: 100%;
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
            margin-bottom: 2em;
            font-size: 0.9em;
            color: ${getThemeColors(settings.theme).muted};
          }
          .content {
            margin-bottom: 3em;
            padding-bottom: 1em;
          }
          .main-container {
            min-height: 100vh;
            padding-bottom: 4em;
          }
          a {
            color: ${getThemeColors(settings.theme).accent};
            text-decoration: underline;
            cursor: pointer;
          }
          a:hover {
            color: ${getThemeColors(settings.theme).text};
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="main-container">
          <div class="chapter-title">${section.label}</div>
          <div class="content">
          ${section.content ? 
            (() => {
              // Clean and process the EPUB content while preserving images
              let processedContent = section.content
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
                // Convert xlink:href to src for images to work properly
                .replace(/xlink:href="([^"]*)"/gi, 'src="$1"')
                .replace(/<image([^>]*)>/gi, '<img$1>'); // Convert image tags to img tags
              
              // Log image processing for debugging
              const imageMatches = processedContent.match(/<img[^>]*>/gi);
              if (imageMatches) {
                console.log('Found images in content:', imageMatches.length);
                imageMatches.forEach((img: string, index: number) => {
                  const srcMatch = img.match(/src="([^"]*)"/);
                  if (srcMatch) {
                    console.log(`Image ${index + 1} src:`, srcMatch[1]);
                  }
                });
              }
              
              return processedContent;
            })()
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
        </div>
      </body>
      </html>
    `;

    // Create iframe for content
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'auto';
    iframe.style.display = 'block';
    iframe.scrolling = 'yes';
    iframe.srcdoc = htmlContent;

    // Add load event listener to handle internal links and scroll tracking
    iframe.onload = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        console.log('Iframe loaded, setting up scroll tracking and internal links');
        
        // Ensure latest appearance is applied after load
        applyAppearanceToIframe();
        
        // Set up scroll tracking for this specific iframe
        let lastScrollTime = 0;
        const THROTTLE_DELAY = 1000;
        
        const handleScrollInIframe = () => {
          const now = Date.now();
          console.log('Scroll detected in iframe at:', now);
          
          if (now - lastScrollTime >= THROTTLE_DELAY) {
            lastScrollTime = now;
            
            // Calculate scroll position inline
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (!iframeDoc) return;

              const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
              const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
              const viewportHeight = iframe.offsetHeight;
              
              const scrollPercent = scrollHeight > viewportHeight ? 
                scrollTop / (scrollHeight - viewportHeight) : 0;
              
              const lineHeight = 24;
              const estimatedLineNumber = Math.floor(scrollTop / lineHeight);
              
              const scrollData = {
                scrollPercent: Math.max(0, Math.min(1, scrollPercent)),
                lineNumber: estimatedLineNumber,
              };
              
              console.log('Iframe scroll data:', scrollData);
              
              // Save progress inline
              const bookProgress = index / sections.length;
              
              // Encode progress (inline implementation)
              const clampedProgress = Math.max(0, Math.min(1, bookProgress));
              const clampedSectionIndex = Math.max(0, Math.min(999, index));
              const clampedScrollPercent = Math.max(0, Math.min(1, scrollData.scrollPercent));
              const clampedLineNumber = Math.max(0, Math.min(999, scrollData.lineNumber));
              
              const progressPart = Math.floor(clampedProgress * 10000) / 10000;
              const sectionPart = clampedSectionIndex / 1000000;
              const scrollPart = Math.floor(clampedScrollPercent * 999) / 1000000000;
              const linePart = clampedLineNumber / 1000000000000;
              
              const encodedProgress = progressPart + sectionPart + scrollPart + linePart;
              
              // Only save to API after 30 seconds of reading
              const readingTime = Date.now() - readingStartTime.current;
              if (readingTime >= 30000) { // 30 seconds
                booksApi.setProgress(book.id, encodedProgress).then(() => {
                  console.log('Enhanced progress saved on scroll:', {
                    section: index,
                    scrollPercent: Math.round(scrollData.scrollPercent * 100),
                    lineNumber: scrollData.lineNumber,
                    encoded: encodedProgress,
                    readingTime: Math.round(readingTime / 1000) + 's'
                  });
                }).catch(error => {
                  console.error('Error saving progress to API:', error);
                });
              } else {
                console.log('Progress not saved - waiting for 30s reading time:', {
                  currentTime: Math.round(readingTime / 1000) + 's',
                  required: '30s'
                });
              }
              
              // Save to localStorage
              const detailedProgress = {
                sectionIndex: index,
                scrollPercent: scrollData.scrollPercent,
                lineNumber: scrollData.lineNumber,
                cfi: `epubcfi(/${index * 2 + 2}!/)`,
                timestamp: Date.now()
              };
              localStorage.setItem(`book-progress-${book.id}`, JSON.stringify(detailedProgress));
              
            } catch (error) {
              console.error('Error in scroll tracking:', error);
            }
          }
        };

        // Add scroll listeners to both document and window of iframe
        iframeDoc.addEventListener('scroll', handleScrollInIframe, { passive: true });
        if (iframe.contentWindow) {
          iframe.contentWindow.addEventListener('scroll', handleScrollInIframe, { passive: true });
        }
        
        console.log('Scroll listeners added to iframe document and window');
        
        // Add click event listener for all anchor tags
        iframeDoc.addEventListener('click', (event) => {
          const target = event.target as HTMLElement;
          const anchor = target.closest('a');
          
          if (anchor && anchor.href) {
            event.preventDefault();
            
            // Extract the href attribute
            const href = anchor.getAttribute('href');
            if (!href) return;
            
            console.log('Internal link clicked:', href);
            console.log('Link element:', anchor);
            console.log('Current sections available:', sections.length);
            
            // Handle different types of internal links
            if (href.startsWith('#')) {
              // Anchor link within current section - scroll to element
              const targetElement = iframeDoc.getElementById(href.substring(1));
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
              }
            } else if (href.includes('.html') || href.includes('.xhtml')) {
              // Link to another section - use the passed loadSection function if available
              if (loadSectionFn) {
                const localGoToSection = (targetIndex: number) => {
                  loadSectionFn(targetIndex, sections);
                };
                handleInternalSectionLink(href, sections, localGoToSection);
              }
            } else if (href.startsWith('http://localhost:3000/reader/') || href.includes('index_split_')) {
              // Handle malformed internal links that look like external URLs
              const match = href.match(/index_split_(\d+)\.html(?:#(.+))?/);
              if (match) {
                const sectionNumber = parseInt(match[1]);
                const anchorId = match[2];
                
                // Navigate to the section (subtract 1 for zero-based index)
                const targetSectionIndex = Math.max(0, sectionNumber - 1);
                if (targetSectionIndex < sections.length) {
                  console.log(`Navigating to section ${targetSectionIndex} with anchor ${anchorId || 'none'}`);
                  if (loadSectionFn) {
                    loadSectionFn(targetSectionIndex, sections);
                  }
                  
                  // If there's an anchor, scroll to it after navigation
                  if (anchorId) {
                    setTimeout(() => {
                      const newIframe = containerRef.current?.querySelector('iframe');
                      const newIframeDoc = newIframe?.contentDocument || newIframe?.contentWindow?.document;
                      if (newIframeDoc) {
                        const targetElement = newIframeDoc.getElementById(anchorId);
                        if (targetElement) {
                          targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }, 500); // Wait for section to load
                  }
                }
              }
            }
          }
        });
      }
    };

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);
  }, [settings, metadata, book, sections, handleInternalSectionLink, applyAppearanceToIframe]);

  // Enhanced progress encoding/decoding utilities
  const encodeDetailedProgress = useCallback((
    bookProgress: number,     // 0.0 to 1.0 (actual reading progress)
    sectionIndex: number,     // Current section (0-999)
    scrollPercent: number,    // Scroll percentage within section (0.0-1.0)
    lineNumber?: number       // Optional line number (0-999)
  ): number => {
    // Ensure values are within bounds
    const clampedProgress = Math.max(0, Math.min(1, bookProgress));
    const clampedSectionIndex = Math.max(0, Math.min(999, sectionIndex));
    const clampedScrollPercent = Math.max(0, Math.min(1, scrollPercent));
    const clampedLineNumber = lineNumber ? Math.max(0, Math.min(999, lineNumber)) : 0;
    
    // Format: X.YYYYZZZWWWLLL
    // X.YYYY = book progress (4 decimal places)
    // ZZZ = section index (3 digits)
    // WWW = scroll percentage (3 digits, 0-999 representing 0-100%)
    // LLL = line number (3 digits, optional)
    
    const progressPart = Math.floor(clampedProgress * 10000) / 10000; // 4 decimal places
    const sectionPart = clampedSectionIndex / 1000000; // Shift to 6th-8th decimal places
    const scrollPart = Math.floor(clampedScrollPercent * 999) / 1000000000; // Shift to 9th-11th decimal places
    const linePart = clampedLineNumber / 1000000000000; // Shift to 12th-14th decimal places
    
    return progressPart + sectionPart + scrollPart + linePart;
  }, []);

  const decodeDetailedProgress = useCallback((encodedProgress: number) => {
    // Convert to string with enough precision
    const progressStr = encodedProgress.toFixed(14);
    console.log('Decoding progress:', { encodedProgress, progressStr });
    
    // Format: X.YYYYZZZWWWLLL
    // X.YYYY = book progress (positions 0-5: "X.YYYY")
    // ZZZ = section index (positions 6-8: after decimal, digits 5-7)
    // WWW = scroll percentage (positions 9-11: after decimal, digits 8-10) 
    // LLL = line number (positions 12-14: after decimal, digits 11-13)
    
    // Extract the decimal part and pad with zeros if needed
    const decimalPart = progressStr.split('.')[1] || '00000000000000';
    const paddedDecimal = decimalPart.padEnd(14, '0');
    
    // The format is: 0.75603147958400
    // Decimal part: 75603147958400
    // Structure: BBBBSSSSSSWWWLLL (where B=book, S=section, W=scroll, L=line)
    // But the actual structure based on encoding is: 7560|31|479|584|00
    
    const bookProgress = parseFloat(progressStr.substring(0, 6)); // 0.7560
    
    // Find section, scroll, and line by working backwards from known structure
    // The encoding adds: section/1000000 + scroll/1000000000 + line/1000000000000
    // So we need to extract these properly
    
    // Remove the book progress part to isolate the encoded section/scroll/line data
    const remainingValue = encodedProgress - bookProgress;
    console.log('Remaining value after removing book progress:', remainingValue);
    
    // Extract section (should be around 0.000031 for section 31)
    const sectionValue = Math.floor(remainingValue * 1000000);
    const sectionIndex = sectionValue;
    
    // Extract scroll (remaining after section)
    const afterSection = remainingValue - (sectionIndex / 1000000);
    const scrollValue = Math.floor(afterSection * 1000000000);
    const scrollPercent = scrollValue / 999;
    
    // Extract line (remaining after scroll)  
    const afterScroll = afterSection - (scrollValue / 1000000000);
    const lineValue = Math.floor(afterScroll * 1000000000000);
    const lineNumber = lineValue;
    
    const decoded = {
      bookProgress: Math.max(0, Math.min(1, bookProgress)),
      sectionIndex: Math.max(0, sectionIndex),
      scrollPercent: Math.max(0, Math.min(1, scrollPercent)),
      lineNumber: Math.max(0, lineNumber),
    };
    
    console.log('Decoding details:', {
      progressStr,
      encodedProgress,
      bookProgress,
      remainingValue,
      sectionValue,
      scrollValue,
      lineValue,
      final: decoded
    });
    
    return decoded;
  }, []);

  // Calculate scroll position within iframe
  const calculateScrollPosition = useCallback((iframe: HTMLIFrameElement) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return { scrollPercent: 0, lineNumber: 0 };

      const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
      const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
      const viewportHeight = iframe.offsetHeight;
      
      // Calculate scroll percentage within current section
      const scrollPercent = scrollHeight > viewportHeight ? 
        scrollTop / (scrollHeight - viewportHeight) : 0;
      
      // Estimate line number based on scroll position
      const lineHeight = 24; // Approximate line height in pixels
      const estimatedLineNumber = Math.floor(scrollTop / lineHeight);
      
      const result = {
        scrollPercent: Math.max(0, Math.min(1, scrollPercent)),
        lineNumber: estimatedLineNumber,
      };
      
      console.log('Scroll calculation details:', {
        scrollTop,
        scrollHeight,
        viewportHeight,
        maxScroll: scrollHeight - viewportHeight,
        rawScrollPercent: scrollPercent,
        clampedScrollPercent: result.scrollPercent,
        percentAsDisplay: Math.round(result.scrollPercent * 100) + '%'
      });
      
      return result;
    } catch (error) {
      console.error('Error calculating scroll position:', error);
      return { scrollPercent: 0, lineNumber: 0 };
    }
  }, []);

  // Enhanced progress saving with encoded data and throttling
  const saveEnhancedProgress = useCallback(async (
    sectionIndex: number, 
    sectionsArray: EpubSection[],
    scrollPercent: number = 0,
    lineNumber: number = 0,
    forceApiCall: boolean = false
  ) => {
    const bookProgress = sectionIndex / sectionsArray.length;
    
    // Encode all information into single progress value
    const encodedProgress = encodeDetailedProgress(
      bookProgress,
      sectionIndex,
      scrollPercent,
      lineNumber
    );
    
    // Update progress state immediately
    const newProgress = {
      fraction: bookProgress, // Keep original fraction for UI
      location: sectionIndex,
      totalLocations: sectionsArray.length,
      section: {
        index: sectionsArray[sectionIndex]?.index || sectionIndex,
        href: sectionsArray[sectionIndex]?.href || '',
        label: sectionsArray[sectionIndex]?.label || ''
      },
      cfi: `epubcfi(/${sectionIndex * 2 + 2}!/)`
    };
    
    setProgress(newProgress);
    
    // Always save detailed progress locally for quick access
    const detailedProgress = {
      sectionIndex,
      scrollPercent,
      lineNumber,
      cfi: newProgress.cfi,
      timestamp: Date.now()
    };
    localStorage.setItem(`book-progress-${book.id}`, JSON.stringify(detailedProgress));

    // Save to API only after 30 seconds of reading
    const readingTime = Date.now() - readingStartTime.current;
    if (readingTime >= 30000) { // 30 seconds
      try {
        await booksApi.setProgress(book.id, encodedProgress);
        console.log('Enhanced progress saved on scroll:', {
          section: sectionIndex,
          scrollPercent: Math.round(scrollPercent * 100),
          lineNumber,
          encoded: encodedProgress,
          readingTime: Math.round(readingTime / 1000) + 's'
        });
      } catch (error) {
        console.error('Error saving progress to API:', error);
      }
    } else {
      console.log('Progress not saved - waiting for 30s reading time:', {
        currentTime: Math.round(readingTime / 1000) + 's',
        required: '30s'
      });
    }
  }, [book.id, encodeDetailedProgress, decodeDetailedProgress]);

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
    
    // Use enhanced progress saving
    await saveEnhancedProgress(sectionIndex, sectionsArray);

    // Render section content with actual content
    renderSection({ ...section, content }, sectionIndex, loadSectionWithSections);
    console.log(`Section ${sectionIndex} loaded and rendered successfully`);
  }, [book.id, epubUrl, renderSection, saveEnhancedProgress]);

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
        }
      }
    } catch (error) {
      console.error('Error parsing bookmark CFI:', error);
    }
  }, [sections.length, goToSection]);

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

  // Search functionality removed - using floating UI only

  // Listen for settings changes: apply directly to iframe without rerendering content
  useSettingsListener(() => {
    applyAppearanceToIframe();
  });

  // Keyboard navigation - simplified for minimal UI
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
        case ' ':
          event.preventDefault();
          goToNext();
          break;
        case 'b':
          event.preventDefault();
          addBookmark();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, addBookmark]);

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

  // Test EPUB parser functionality
  const testEpubParser = useCallback(async () => {
    if (!window.currentEpubParser) {
      console.log('No EPUB parser instance found');
      return;
    }
    
    try {
      console.log('Testing EPUB parser...');
      const sections = window.currentEpubParser.getSections();
      console.log('Sections found:', sections.length);
      
      if (sections.length > 0) {
        const firstSection = sections[0];
        console.log('First section:', firstSection);
        
        const content = await window.currentEpubParser.getSectionContent(0);
        console.log('First section content length:', content?.length || 0);
        
        // Check for images in content
        const imageMatches = content?.match(/<img[^>]*>/gi) || [];
        console.log('Images found in first section:', imageMatches.length);
        
        imageMatches.forEach((img: string, index: number) => {
          const srcMatch = img.match(/src="([^"]*)"/);
          if (srcMatch) {
            console.log(`Image ${index + 1} src:`, srcMatch[1]);
          }
        });
      }
    } catch (error) {
      console.error('Error testing EPUB parser:', error);
    }
  }, []);

  // Apply current global settings when reader initializes
  useEffect(() => {
    if (currentSection && !isLoading) {
      // Apply current global settings to ensure consistency
      renderSection(currentSection, progress.location, (index: number, sectionsArray: EpubSection[]) => loadSection(index));
    }
  }, [settings, currentSection, isLoading, progress.location, renderSection, loadSection]);

  // Cleanup effect for EPUB parser and blob URLs
  useEffect(() => {
    return () => {
      // Clean up EPUB parser when component unmounts
      if (window.currentEpubParser) {
        window.currentEpubParser.destroy();
        window.currentEpubParser = undefined;
      }
    };
  }, []);

  // Scroll tracking and position restoration
  useEffect(() => {
    const setupScrollTracking = () => {
      const iframe = containerRef.current?.querySelector('iframe');
      if (!iframe) {
        console.log('No iframe found for scroll tracking');
        return null;
      }

      let lastScrollTime = 0;
      const THROTTLE_DELAY = 100; // Throttle to every 100ms for more responsive progress saving
      
      const handleScroll = () => {
        const now = Date.now();
        console.log('Scroll event detected at:', now);
        
        // Throttle scroll events to prevent too many API calls
        if (now - lastScrollTime >= THROTTLE_DELAY) {
          lastScrollTime = now;
          
          const scrollData = calculateScrollPosition(iframe);
          console.log('Saving progress with scroll data:', scrollData);
          
          // Save enhanced progress immediately on every scroll
          saveEnhancedProgress(
            progress.location,
            sections,
            scrollData.scrollPercent,
            scrollData.lineNumber
          );
        }
      };

      const attachScrollListener = () => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.readyState === 'complete') {
          console.log('Attaching scroll listener to iframe document');
          iframeDoc.addEventListener('scroll', handleScroll, { passive: true });
          
          // Also try to listen on the iframe window
          if (iframe.contentWindow) {
            iframe.contentWindow.addEventListener('scroll', handleScroll, { passive: true });
          }
          
          return () => {
            console.log('Removing scroll listeners');
            iframeDoc.removeEventListener('scroll', handleScroll);
            if (iframe.contentWindow) {
              iframe.contentWindow.removeEventListener('scroll', handleScroll);
            }
          };
        }
        return null;
      };

      // Try to attach immediately if iframe is ready
      let cleanup = attachScrollListener();
      
      // If not ready, wait for iframe to load
      if (!cleanup) {
        const handleIframeLoad = () => {
          console.log('Iframe loaded, setting up scroll tracking');
          cleanup = attachScrollListener();
        };
        
        iframe.addEventListener('load', handleIframeLoad);
        
        return () => {
          iframe.removeEventListener('load', handleIframeLoad);
          if (cleanup) cleanup();
        };
      }
      
      return cleanup;
    };

    // Set up scroll tracking
    const cleanup = setupScrollTracking();
    
    // Also set up a mutation observer to detect when new iframes are added
    const observer = new MutationObserver(() => {
      console.log('DOM mutation detected, re-setting up scroll tracking');
      setupScrollTracking();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }
    
    return () => {
      if (cleanup) cleanup();
      observer.disconnect();
    };
  }, [progress.location, sections, calculateScrollPosition, saveEnhancedProgress]);

  // Load progress from API and decode it
  const loadProgressFromAPI = useCallback(async () => {
    try {
      console.log('Loading progress from API for book:', book.id);
      const response = await booksApi.getProgress(book.id);
      
      if (response.userBook && response.userBook.progress) {
        const encodedProgress = response.userBook.progress;
        console.log('Encoded progress from API:', encodedProgress);
        
        // Decode the detailed progress
        const decoded = decodeDetailedProgress(encodedProgress);
        console.log('Decoded progress from API:', decoded);
        
        return {
          sectionIndex: decoded.sectionIndex,
          scrollPercent: decoded.scrollPercent,
          lineNumber: decoded.lineNumber,
          bookProgress: decoded.bookProgress, // Add this for fallback calculations
          cfi: `epubcfi(/${decoded.sectionIndex * 2 + 2}!/)`,
          timestamp: Date.now(),
          source: 'api'
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Error loading progress from API:', error);
      return null;
    }
  }, [book.id, decodeDetailedProgress]);

  // Enhanced position restoration with API fallback
  const restoreEnhancedPosition = useCallback(async () => {
    try {
      console.log('Starting position restoration for book:', book.id);
      
      // First try to get progress from API
      let progressData = await loadProgressFromAPI();
      
      // If no API data, fall back to localStorage
      if (!progressData) {
        console.log('No API progress found, checking localStorage');
        const savedProgress = localStorage.getItem(`book-progress-${book.id}`);
        
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          progressData = { ...parsed, source: 'localStorage' };
          console.log('Found localStorage progress:', progressData);
        }
      }
      
      if (progressData && sections.length > 0) {
        console.log('Restoring position from:', progressData.source);
        console.log('Progress data details:', {
          sectionIndex: progressData.sectionIndex,
          totalSections: sections.length,
          scrollPercent: progressData.scrollPercent,
          lineNumber: progressData.lineNumber
        });
        
        // Validate and fix section index
        let targetSection = progressData.sectionIndex;
        if (targetSection >= sections.length) {
          console.warn(`Invalid section index ${targetSection}, max is ${sections.length - 1}. Using book progress to estimate section.`);
          // Fallback: use book progress to estimate section
          const estimatedSection = Math.floor(progressData.bookProgress * sections.length);
          targetSection = Math.min(estimatedSection, sections.length - 1);
          console.log(`Estimated section from book progress: ${targetSection}`);
        }
        
        targetSection = Math.max(0, Math.min(targetSection, sections.length - 1));
        console.log(`Final target section: ${targetSection}`);
        
        // Load the correct section first
        await loadSectionWithSections(targetSection, sections);
        
        // Restore scroll position after content loads with multiple attempts
        const attemptScrollRestore = (attempt = 1, maxAttempts = 5) => {
          setTimeout(() => {
            const iframe = containerRef.current?.querySelector('iframe');
            console.log(`Scroll restore attempt ${attempt}:`, { 
              hasIframe: !!iframe, 
              scrollPercent: progressData.scrollPercent,
              targetSection 
            });
            
            if (iframe) {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc && iframeDoc.readyState === 'complete') {
                const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
                const viewportHeight = iframe.offsetHeight;
                
                console.log('Scroll dimensions:', {
                  scrollHeight,
                  viewportHeight,
                  scrollPercent: progressData.scrollPercent
                });
                
                if (scrollHeight > viewportHeight && progressData.scrollPercent > 0) {
                  const maxScroll = scrollHeight - viewportHeight;
                  const targetScroll = progressData.scrollPercent * maxScroll;
                  
                  console.log('Scroll restoration calculation:', {
                    savedScrollPercent: progressData.scrollPercent,
                    scrollHeight,
                    viewportHeight,
                    maxScroll,
                    targetScroll,
                    percentDisplay: Math.round(progressData.scrollPercent * 100) + '%'
                  });
                  
                  iframeDoc.documentElement.scrollTop = targetScroll;
                  iframeDoc.body.scrollTop = targetScroll;
                  
                  // Verify the scroll was applied
                  const actualScroll = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
                  const verifyPercent = maxScroll > 0 ? actualScroll / maxScroll : 0;
                  
                  console.log('Enhanced position restored:', {
                    section: targetSection,
                    savedScrollPercent: Math.round(progressData.scrollPercent * 100) + '%',
                    actualScrollPercent: Math.round(verifyPercent * 100) + '%',
                    lineNumber: progressData.lineNumber,
                    targetScroll,
                    actualScroll,
                    source: progressData.source
                  });
                } else {
                  console.log('Skipping scroll restore:', {
                    reason: scrollHeight <= viewportHeight ? 'Content not scrollable' : 'No scroll position saved',
                    scrollHeight,
                    viewportHeight,
                    scrollPercent: progressData.scrollPercent
                  });
                }
              } else if (attempt < maxAttempts) {
                console.log(`Iframe not ready, retrying... (attempt ${attempt}/${maxAttempts})`);
                attemptScrollRestore(attempt + 1, maxAttempts);
              } else {
                console.warn('Failed to restore scroll position after', maxAttempts, 'attempts');
              }
            } else if (attempt < maxAttempts) {
              console.log(`No iframe found, retrying... (attempt ${attempt}/${maxAttempts})`);
              attemptScrollRestore(attempt + 1, maxAttempts);
            }
          }, attempt * 500); // Increasing delay for each attempt
        };
        
        attemptScrollRestore();
      } else {
        console.log('No saved progress found, starting from beginning');
        // Load first section if no progress found
        if (sections.length > 0) {
          await loadSectionWithSections(0, sections);
        }
      }
    } catch (error) {
      console.error('Error restoring enhanced position:', error);
      // Fallback to first section on error
      if (sections.length > 0) {
        await loadSectionWithSections(0, sections);
      }
    }
  }, [book.id, sections, loadSectionWithSections, loadProgressFromAPI]);

  // Restore position when sections are loaded
  useEffect(() => {
    if (sections.length > 0 && !isLoading) {
      console.log('Book structure loaded:', {
        totalSections: sections.length,
        bookTitle: metadata.title || book.title,
        sampleSections: sections.slice(0, 3).map(s => ({ label: s.label, href: s.href }))
      });
      restoreEnhancedPosition();
    }
  }, [sections.length, isLoading, restoreEnhancedPosition, metadata.title, book.title]);

  // Helper functions
  const getFontFamily = (family: string) => {
    switch (family) {
      case 'serif': return 'Georgia, "Times New Roman", serif';
      case 'sans-serif': return 'Arial, "Helvetica Neue", sans-serif';
      case 'monospace': return 'Courier New, monospace';
      case 'far-nazanin': return '"FAR Nazanin", Georgia, serif';
      case 'far-roya': return '"FAR Roya", Georgia, serif';
      case 'b-zar': return '"B Zar", Georgia, serif';
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

  // Handle image loading and error handling
  const handleImageLoad = (event: Event) => {
    const img = event.target as HTMLImageElement;
    if (img.nextElementSibling) {
      (img.nextElementSibling as HTMLElement).style.display = 'none';
    }
  };

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    if (img.nextElementSibling) {
      (img.nextElementSibling as HTMLElement).style.display = 'block';
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
      {/* Main Reader Content */}
      <div className="h-full w-full relative">
        <div
          ref={containerRef}
          className="h-full w-full focus:outline-none cursor-pointer"
          style={{ 
            backgroundColor: getThemeColors(settings.theme).background,
            minHeight: '100%',
            overflow: 'visible'
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

        {/* Floating Settings Button */}
        <FloatingSettings onClose={onClose} />

        {/* Floating TOC Button */}
        <FloatingTOC
          sections={sections}
          currentSection={progress.location}
          bookmarks={bookmarks}
          onSectionSelect={goToSection}
          onGoToBookmark={goToBookmark}
          onAddBookmark={addBookmark}
        />

        {/* Subtle Navigation Hints */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {/* Left Navigation Hint */}
          <button
            onClick={goToPrev}
            disabled={progress.location <= 0}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-sm transition-all duration-200 pointer-events-auto opacity-20 hover:opacity-60 ${
              progress.location > 0
                ? 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-md backdrop-blur-sm'
                : 'bg-gray-300/50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            aria-label="صفحه قبل"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right Navigation Hint */}
          <button
            onClick={goToNext}
            disabled={progress.location >= progress.totalLocations - 1}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-sm transition-all duration-200 pointer-events-auto opacity-20 hover:opacity-60 ${
              progress.location < progress.totalLocations - 1
                ? 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-md backdrop-blur-sm'
                : 'bg-gray-300/50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            aria-label="صفحه بعد"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
