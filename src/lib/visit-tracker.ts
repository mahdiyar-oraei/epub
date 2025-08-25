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
      await visitsApi.trackVisit({
        userId: 'anonymous', // We'll need to get this from auth context
        page: pageUrl || window.location.pathname,
        timestamp: new Date().toISOString(),
      });
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
