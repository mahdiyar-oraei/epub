// Type definitions for foliate-js
declare module 'foliate-js' {
  export interface ViewSettings {
    flow?: 'paginated' | 'scrolled';
    width?: number;
    height?: number;
    gap?: number;
    maxColumnWidth?: number;
    maxInlineSize?: number;
    maxBlockSize?: number;
    defaultDirection?: 'ltr' | 'rtl';
    spread?: 'none' | 'auto';
    animated?: boolean;
    vertical?: boolean;
  }

  export interface ThemeSettings {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    lineHeight?: number;
    textAlign?: string;
    wordSpacing?: number;
    letterSpacing?: number;
    paragraphSpacing?: number;
    textIndent?: number;
    hyphenate?: boolean;
    invert?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
  }

  export interface BookProgress {
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

  export interface BookSection {
    index: number;
    href: string;
    label: string;
    subitems?: BookSection[];
  }

  export interface BookMetadata {
    title?: string;
    creator?: string[];
    description?: string;
    publisher?: string;
    language?: string;
    pubdate?: string;
    identifier?: string;
    rights?: string;
    subject?: string[];
    cover?: string;
  }

  export interface SearchResult {
    cfi: string;
    excerpt: string;
    section: BookSection;
  }

  export class EpubViewer {
    constructor(container: HTMLElement);
    
    // Book loading
    open(file: File | ArrayBuffer | string): Promise<void>;
    close(): void;
    
    // Navigation
    goTo(target: string | number): Promise<void>;
    goToFraction(fraction: number): Promise<void>;
    next(): Promise<void>;
    prev(): Promise<void>;
    
    // Settings
    setAppearance(settings: Partial<ThemeSettings>): void;
    setView(settings: Partial<ViewSettings>): void;
    
    // Progress and location
    getProgress(): BookProgress;
    getTOC(): BookSection[];
    getMetadata(): BookMetadata;
    
    // Search
    search(query: string): AsyncGenerator<SearchResult>;
    
    // Events
    addEventListener(event: string, callback: (event: any) => void): void;
    removeEventListener(event: string, callback: (event: any) => void): void;
    
    // Highlighting and annotations
    addAnnotation(cfi: string, color: string, note?: string): void;
    removeAnnotation(cfi: string): void;
    getAnnotations(): any[];
    
    // Text selection
    getSelection(): Selection | null;
    clearSelection(): void;
    
    // Destroy
    destroy(): void;
  }

  // CFI utilities
  export namespace CFI {
    function compare(a: string, b: string): number;
    function isBefore(a: string, b: string): boolean;
    function isAfter(a: string, b: string): boolean;
    function parse(cfi: string): any;
    function stringify(obj: any): string;
    function toRange(doc: Document, cfi: string): Range;
    function fromRange(range: Range): string;
  }

  // Overlayer for highlighting
  export class Overlayer {
    constructor(container: HTMLElement);
    add(range: Range, className?: string, data?: any): void;
    remove(range: Range): void;
    clear(): void;
    redraw(): void;
    hitTest(event: MouseEvent): any;
    element: HTMLElement;
  }
}

// Global module declarations for the downloaded files
declare module '/src/lib/foliate-js-epub.js' {
  export * from 'foliate-js';
}

declare module '/src/lib/foliate-js-epubcfi.js' {
  export * from 'foliate-js';
}

declare module '/src/lib/foliate-js-overlayer.js' {
  export * from 'foliate-js';
}
