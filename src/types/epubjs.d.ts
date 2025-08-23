declare module 'epubjs' {
  export interface Location {
    start: { cfi: string };
    end: { cfi: string };
  }

  export interface Locations {
    generate(chars?: number): Promise<void>;
    locationFromCfi(cfi: string): number;
    cfiFromLocation(location: number): string;
    total: number;
  }

  export interface Themes {
    default(styles: any): void;
    fontSize(size: string): void;
    font(family: string): void;
  }

  export interface Rendition {
    display(target?: string): Promise<void>;
    next(): Promise<void>;
    prev(): Promise<void>;
    on(event: string, callback: Function): void;
    themes: Themes;
    destroy(): void;
  }

  export class Book {
    constructor(url: string, options?: any);
    renderTo(element: HTMLElement, options?: any): Rendition;
    locations: Locations;
    opened: Promise<void>;
    on(event: string, callback: Function): void;
  }

  export default Book;
}
