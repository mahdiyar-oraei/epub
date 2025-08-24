import { useEffect, useRef, useState, useCallback } from 'react';
import { booksApi } from '@/lib/api';

export const useReadingTimeTracker = (bookId?: string) => {
  const [isTracking, setIsTracking] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  // Sync time to server every 30 seconds
  const SYNC_INTERVAL = 30 * 1000; // 30 seconds
  const MIN_SYNC_TIME = 10; // Minimum 10 seconds before syncing

  const syncTimeToServer = useCallback(async (timeToSync: number) => {
    if (!bookId || timeToSync < MIN_SYNC_TIME) return;

    try {
      await booksApi.addTimeSpent({ bookId, timeSpent: timeToSync });
      accumulatedTimeRef.current = 0;
      lastSyncRef.current = Date.now();
    } catch (error) {
      console.warn('Failed to sync reading time:', error);
    }
  }, [bookId]);

  const startTracking = useCallback(() => {
    if (!bookId || isTracking) return;

    setIsTracking(true);
    startTimeRef.current = Date.now();
    
    // Set up periodic sync
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentTime = Date.now();
        const sessionTime = Math.floor((currentTime - startTimeRef.current) / 1000);
        const totalAccumulated = accumulatedTimeRef.current + sessionTime;
        
        setTotalTime(totalAccumulated);
        
        // Sync if enough time has passed
        if (totalAccumulated >= MIN_SYNC_TIME && 
            (currentTime - lastSyncRef.current) >= SYNC_INTERVAL) {
          syncTimeToServer(totalAccumulated);
        }
      }
    }, 1000);
  }, [bookId, isTracking, syncTimeToServer]);

  const stopTracking = useCallback(async () => {
    if (!isTracking || !startTimeRef.current) return;

    setIsTracking(false);
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Calculate final session time
    const endTime = Date.now();
    const sessionTime = Math.floor((endTime - startTimeRef.current) / 1000);
    const finalTime = accumulatedTimeRef.current + sessionTime;
    
    setTotalTime(finalTime);
    
    // Sync remaining time to server
    if (finalTime >= MIN_SYNC_TIME) {
      await syncTimeToServer(finalTime);
    }

    startTimeRef.current = null;
  }, [isTracking, syncTimeToServer]);

  const pauseTracking = useCallback(() => {
    if (!isTracking || !startTimeRef.current) return;

    const currentTime = Date.now();
    const sessionTime = Math.floor((currentTime - startTimeRef.current) / 1000);
    accumulatedTimeRef.current += sessionTime;
    
    setIsTracking(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    startTimeRef.current = null;
  }, [isTracking]);

  const resumeTracking = useCallback(() => {
    if (isTracking) return;
    startTracking();
  }, [isTracking, startTracking]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTracking();
      } else if (!isTracking && bookId) {
        resumeTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking, bookId, pauseTracking, resumeTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Sync any remaining time when component unmounts
      if (accumulatedTimeRef.current >= MIN_SYNC_TIME && bookId) {
        syncTimeToServer(accumulatedTimeRef.current);
      }
    };
  }, [bookId, syncTimeToServer]);

  return {
    isTracking,
    totalTime,
    formattedTime: formatTime(totalTime),
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
  };
};
