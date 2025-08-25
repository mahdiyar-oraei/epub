import JSZip from 'jszip';

export interface EpubSection {
  index: number;
  href: string;
  label: string;
  id: string;
  content?: string;
}

export interface EpubMetadata {
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

export interface EpubTOCItem {
  label: string;
  href: string;
  children?: EpubTOCItem[];
}

export class EpubParser {
  private zip: JSZip | null = null;
  private opfPath: string = '';
  private opfDoc: Document | null = null;
  private manifestItems: { [key: string]: string } = {};
  private spineItems: string[] = [];
  private metadata: EpubMetadata = {};
  private sections: EpubSection[] = [];
  private toc: EpubTOCItem[] = [];

  async loadFromArrayBuffer(data: ArrayBuffer): Promise<void> {
    try {
      console.log('EpubParser: Loading from ArrayBuffer, size:', data.byteLength);
      this.zip = new JSZip();
      await this.zip.loadAsync(data);
      console.log('EpubParser: ZIP loaded successfully');
      
      await this.parseContainer();
      console.log('EpubParser: Container parsed, OPF path:', this.opfPath);
      
      await this.parseOPF();
      console.log('EpubParser: OPF parsed');
      
      await this.parseMetadata();
      console.log('EpubParser: Metadata parsed:', this.metadata.title);
      
      await this.parseSpine();
      console.log('EpubParser: Spine parsed, sections:', this.sections.length);
      
      await this.parseTOC();
      console.log('EpubParser: TOC parsed, items:', this.toc.length);
    } catch (error) {
      console.error('EpubParser: Error in loadFromArrayBuffer:', error);
      throw error;
    }
  }

  async loadFromUrl(url: string): Promise<void> {
    try {
      console.log('EpubParser: Fetching EPUB from URL:', url);
      
      // Add more detailed logging
      console.log('EpubParser: Making fetch request...');
      const response = await fetch(url);
      console.log('EpubParser: Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch EPUB: ${response.status} ${response.statusText}`);
      }
      
      console.log('EpubParser: EPUB fetched successfully, converting to ArrayBuffer');
      const data = await response.arrayBuffer();
      console.log('EpubParser: ArrayBuffer created, size:', data.byteLength);
      await this.loadFromArrayBuffer(data);
    } catch (error) {
      console.error('EpubParser: Error in loadFromUrl:', error);
      console.error('EpubParser: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error;
    }
  }

  private async parseContainer(): Promise<void> {
    if (!this.zip) throw new Error('ZIP not loaded');

    const containerXML = await this.zip.file('META-INF/container.xml')?.async('text');
    if (!containerXML) {
      throw new Error('Invalid EPUB: container.xml not found');
    }

    // Check if DOMParser is available (for browser environment)
    if (typeof DOMParser === 'undefined') {
      throw new Error('DOMParser not available - EPUB parsing requires browser environment');
    }

    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXML, 'application/xml');
    const opfPath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
    
    if (!opfPath) {
      throw new Error('Invalid EPUB: OPF path not found');
    }

    this.opfPath = opfPath;
  }

  private async parseOPF(): Promise<void> {
    if (!this.zip) throw new Error('ZIP not loaded');

    const opfContent = await this.zip.file(this.opfPath)?.async('text');
    if (!opfContent) {
      throw new Error('Invalid EPUB: OPF file not found');
    }

    const parser = new DOMParser();
    this.opfDoc = parser.parseFromString(opfContent, 'application/xml');
  }

  private async parseMetadata(): Promise<void> {
    if (!this.opfDoc) return;

    const metadataElement = this.opfDoc.querySelector('metadata');
    if (!metadataElement) return;

    // Title
    const title = metadataElement.querySelector('title')?.textContent;
    if (title) this.metadata.title = title;

    // Creator/Author
    const creators = Array.from(metadataElement.querySelectorAll('creator')).map(el => el.textContent).filter(Boolean) as string[];
    if (creators.length > 0) this.metadata.creator = creators;

    // Description
    const description = metadataElement.querySelector('description')?.textContent;
    if (description) this.metadata.description = description;

    // Publisher
    const publisher = metadataElement.querySelector('publisher')?.textContent;
    if (publisher) this.metadata.publisher = publisher;

    // Language
    const language = metadataElement.querySelector('language')?.textContent;
    if (language) this.metadata.language = language;

    // Publication date
    const pubdate = metadataElement.querySelector('date')?.textContent;
    if (pubdate) this.metadata.pubdate = pubdate;

    // Identifier
    const identifier = metadataElement.querySelector('identifier')?.textContent;
    if (identifier) this.metadata.identifier = identifier;

    // Rights
    const rights = metadataElement.querySelector('rights')?.textContent;
    if (rights) this.metadata.rights = rights;

    // Subjects
    const subjects = Array.from(metadataElement.querySelectorAll('subject')).map(el => el.textContent).filter(Boolean) as string[];
    if (subjects.length > 0) this.metadata.subject = subjects;
  }

  private async parseSpine(): Promise<void> {
    if (!this.opfDoc) {
      console.log('EpubParser: No OPF document available for spine parsing');
      return;
    }

    try {
      // Parse manifest
      const manifestItems = Array.from(this.opfDoc.querySelectorAll('manifest item'));
      console.log('EpubParser: Found manifest items:', manifestItems.length);
      
      this.manifestItems = manifestItems.reduce((acc, item) => {
        const id = item.getAttribute('id');
        const href = item.getAttribute('href');
        if (id && href) {
          acc[id] = href;
        }
        return acc;
      }, {} as { [key: string]: string });

      console.log('EpubParser: Manifest items processed:', Object.keys(this.manifestItems).length);

      // Parse spine
      const spineItems = Array.from(this.opfDoc.querySelectorAll('spine itemref'));
      console.log('EpubParser: Found spine items:', spineItems.length);
      
      this.spineItems = spineItems.map(item => item.getAttribute('idref')).filter(Boolean) as string[];
      console.log('EpubParser: Spine item IDs:', this.spineItems);

      // Build sections with generic labels initially
      this.sections = this.spineItems.map((id, index) => ({
        index,
        href: this.manifestItems[id] || '',
        label: `فصل ${index + 1}`,
        id
      })).filter(section => section.href);
      
      console.log('EpubParser: Sections built:', this.sections.length);
      console.log('EpubParser: Section hrefs:', this.sections.map(s => s.href));
    } catch (error) {
      console.error('EpubParser: Error parsing spine:', error);
      throw error;
    }
  }

  private async parseTOC(): Promise<void> {
    if (!this.zip || !this.opfDoc) return;

    // Try to find NCX file first
    const ncxItem = this.opfDoc.querySelector('manifest item[media-type="application/x-dtbncx+xml"]');
    if (ncxItem) {
      const ncxHref = ncxItem.getAttribute('href');
      if (ncxHref) {
        await this.parseNCXTOC(ncxHref);
        this.updateSectionLabelsFromTOC();
        return;
      }
    }

    // Fallback to nav.xhtml or similar
    const navItem = this.opfDoc.querySelector('manifest item[properties*="nav"]');
    if (navItem) {
      const navHref = navItem.getAttribute('href');
      if (navHref) {
        await this.parseNavTOC(navHref);
        this.updateSectionLabelsFromTOC();
        return;
      }
    }

    // Generate basic TOC from spine
    this.toc = this.sections.map(section => ({
      label: section.label,
      href: section.href
    }));
    

  }

  private async parseNCXTOC(ncxPath: string): Promise<void> {
    if (!this.zip) return;

    try {
      const ncxContent = await this.zip.file(this.getFullPath(ncxPath))?.async('text');
      if (!ncxContent) return;

      const parser = new DOMParser();
      const ncxDoc = parser.parseFromString(ncxContent, 'application/xml');
      
      const navPoints = Array.from(ncxDoc.querySelectorAll('navPoint'));
      this.toc = navPoints.map(navPoint => {
        const label = navPoint.querySelector('navLabel text')?.textContent || 'Untitled';
        const src = navPoint.querySelector('content')?.getAttribute('src') || '';
        
        // Clean up the href - remove fragment identifier and normalize
        let href = src.split('#')[0];
        
        // If href is relative, make sure it's properly formatted
        if (href && !href.startsWith('http') && !href.startsWith('/')) {
          // Ensure href is relative to the OPF directory
          const opfDir = this.opfPath.substring(0, this.opfPath.lastIndexOf('/') + 1);
          href = opfDir + href;
        }
        
        return {
          label: label.trim(),
          href: href
        };
      });
      

    } catch (error) {
      console.warn('Failed to parse NCX TOC:', error);
    }
  }

  private async parseNavTOC(navPath: string): Promise<void> {
    if (!this.zip) return;

    try {
      const navContent = await this.zip.file(this.getFullPath(navPath))?.async('text');
      if (!navContent) return;

      const parser = new DOMParser();
      const navDoc = parser.parseFromString(navContent, 'application/xml');
      
      const tocNav = navDoc.querySelector('nav[epub\\:type="toc"], nav[role="doc-toc"]');
      if (!tocNav) return;

      const parseNavList = (ol: Element): EpubTOCItem[] => {
        const items: EpubTOCItem[] = [];
        const lis = Array.from(ol.children).filter(child => child.tagName.toLowerCase() === 'li');
        
        for (const li of lis) {
          const link = li.querySelector('a');
          if (link) {
            const label = link.textContent?.trim() || 'Untitled';
            let href = link.getAttribute('href') || '';
            
            // Clean up the href - remove fragment identifier and normalize
            href = href.split('#')[0];
            
            // If href is relative, make sure it's properly formatted
            if (href && !href.startsWith('http') && !href.startsWith('/')) {
              // Ensure href is relative to the OPF directory
              const opfDir = this.opfPath.substring(0, this.opfPath.lastIndexOf('/') + 1);
              href = opfDir + href;
            }
            
            const item: EpubTOCItem = {
              label,
              href: href
            };

            // Check for nested list
            const nestedOl = li.querySelector('ol');
            if (nestedOl) {
              item.children = parseNavList(nestedOl);
            }

            items.push(item);
          }
        }
        
        return items;
      };

      const ol = tocNav.querySelector('ol');
      if (ol) {
        this.toc = parseNavList(ol);
      }
      

    } catch (error) {
      console.warn('Failed to parse nav TOC:', error);
    }
  }

  private getFullPath(relativePath: string): string {
    const opfDir = this.opfPath.substring(0, this.opfPath.lastIndexOf('/') + 1);
    return opfDir + relativePath;
  }

  private updateSectionLabelsFromTOC(): void {
    if (this.toc.length === 0 || this.sections.length === 0) {
      console.log('Cannot update section labels: TOC or sections are empty');
      console.log('TOC length:', this.toc.length);
      console.log('Sections length:', this.sections.length);
      return;
    }



    // Create a map of href to TOC label for quick lookup
    const tocMap = new Map<string, string>();
    
    // Process TOC items and their children recursively
    const processTOCItems = (items: EpubTOCItem[]) => {
      items.forEach(item => {
        // Store the TOC item with its href
        if (item.href) {
          tocMap.set(item.href, item.label);
        }
        
        // Process children recursively
        if (item.children && item.children.length > 0) {
          processTOCItems(item.children);
        }
      });
    };

    processTOCItems(this.toc);

    // Update section labels based on TOC
    this.sections.forEach((section, index) => {
      // Try to find a matching TOC item by href
      let matchedLabel = tocMap.get(section.href);
      
      // If no direct match, try to find by partial href match
      if (!matchedLabel) {
        for (const [tocHref, tocLabel] of Array.from(tocMap.entries())) {
          // Try exact match first
          if (section.href === tocHref) {
            matchedLabel = tocLabel;
            break;
          }
          
          // Try matching by filename (without path)
          const sectionFilename = section.href.split('/').pop()?.split('#')[0];
          const tocFilename = tocHref.split('/').pop()?.split('#')[0];
          
          if (sectionFilename && tocFilename && sectionFilename === tocFilename) {
            matchedLabel = tocLabel;
            break;
          }
          
          // Try partial path matching
          if (section.href.includes(tocHref) || tocHref.includes(section.href)) {
            matchedLabel = tocLabel;
            break;
          }
        }
      }

      // Update the section label if we found a match
      if (matchedLabel) {
        section.label = matchedLabel;
      }
    });
  }

  async getSectionContent(sectionIndex: number): Promise<string> {
    if (!this.zip || sectionIndex < 0 || sectionIndex >= this.sections.length) {
      return '';
    }

    const section = this.sections[sectionIndex];
    const fullPath = this.getFullPath(section.href);
    
    try {
      const content = await this.zip.file(fullPath)?.async('text');
      if (!content) return '';
      
      // Process content to resolve image URLs
      return await this.processContentWithImages(content, fullPath);
    } catch (error) {
      console.error('Failed to load section content:', error);
      return '';
    }
  }

  private async processContentWithImages(content: string, basePath: string): Promise<string> {
    // Create a temporary DOM element to parse and modify the content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Find all image elements and process them
    const images = doc.querySelectorAll('img, image');
    for (const img of images) {
      try {
        // Get the image source (handle both src and xlink:href)
        let imageSrc = img.getAttribute('src') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        
        if (imageSrc && !imageSrc.startsWith('http') && !imageSrc.startsWith('data:')) {
          // Resolve relative path
          const resolvedPath = this.getFullPath(imageSrc);
          
          // Load the image as blob and create a blob URL
          const imageBlob = await this.zip!.file(resolvedPath)?.async('blob');
          if (imageBlob) {
            const blobUrl = URL.createObjectURL(imageBlob);
            
            // Convert image tag to img tag and set src
            if (img.tagName.toLowerCase() === 'image') {
              const newImg = doc.createElement('img');
              // Copy all attributes
              Array.from(img.attributes).forEach(attr => {
                if (attr.name !== 'xlink:href') {
                  newImg.setAttribute(attr.name, attr.value);
                }
              });
              newImg.setAttribute('src', blobUrl);
              newImg.style.maxWidth = '100%';
              newImg.style.height = 'auto';
              newImg.style.display = 'block';
              newImg.style.margin = '1em auto';
              
              // Replace the image element
              img.parentNode?.replaceChild(newImg, img);
            } else {
              // For regular img tags, just update the src
              img.setAttribute('src', blobUrl);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to process image:', error);
      }
    }
    
    // Serialize back to string
    return new XMLSerializer().serializeToString(doc);
  }

  getMetadata(): EpubMetadata {
    return this.metadata;
  }

  getSections(): EpubSection[] {
    return this.sections;
  }

  getTOC(): EpubTOCItem[] {
    return this.toc;
  }

  getTotalSections(): number {
    return this.sections.length;
  }

  async getImageBlob(imagePath: string): Promise<Blob | null> {
    if (!this.zip) return null;
    
    try {
      const resolvedPath = this.getFullPath(imagePath);
      const imageBlob = await this.zip.file(resolvedPath)?.async('blob');
      return imageBlob || null;
    } catch (error) {
      console.error('Failed to load image:', error);
      return null;
    }
  }

  // Clean up blob URLs to prevent memory leaks
  private blobUrls: Set<string> = new Set();
  
  createImageBlobUrl(imagePath: string): string | null {
    this.getImageBlob(imagePath).then(blob => {
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        this.blobUrls.add(blobUrl);
        return blobUrl;
      }
      return null;
    });
    return null;
  }

  cleanupBlobUrls(): void {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls.clear();
  }

  destroy(): void {
    this.cleanupBlobUrls();
    this.zip = null;
    this.opfDoc = null;
  }
}
