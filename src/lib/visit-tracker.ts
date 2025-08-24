import { visitsApi } from './api';

export class VisitTracker {
  private static instance: VisitTracker;
  private hasTracked = false;

  private constructor() {}

  public static getInstance(): VisitTracker {
    if (!VisitTracker.instance) {
      VisitTracker.instance = new VisitTracker();
    }
    return VisitTracker.instance;
  }

  public async trackPageVisit(pageUrl?: string): Promise<void> {
    // Only track once per session
    if (this.hasTracked) {
      return;
    }

    try {
      const meta = {
        userAgent: navigator.userAgent,
        referrer: document.referrer || '',
        pageUrl: pageUrl || window.location.pathname,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      };

      await visitsApi.trackVisit({ meta });
      this.hasTracked = true;
    } catch (error) {
      console.warn('Failed to track visit:', error);
    }
  }

  public reset(): void {
    this.hasTracked = false;
  }
}

export const visitTracker = VisitTracker.getInstance();
