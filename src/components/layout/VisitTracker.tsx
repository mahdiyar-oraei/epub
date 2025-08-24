'use client';

import { useEffect } from 'react';
import { visitTracker } from '@/lib/visit-tracker';

export default function VisitTracker() {
  useEffect(() => {
    // Track visit on initial load
    visitTracker.trackPageVisit();

    // Reset tracker when component unmounts (e.g., page navigation)
    return () => {
      visitTracker.reset();
    };
  }, []);

  return null; // This component doesn't render anything
}
