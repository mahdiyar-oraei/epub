'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';

interface AutoNextButtonProps {
  onNext: () => void;
  onCancel?: () => void;
  isVisible: boolean;
  duration?: number; // Duration in milliseconds, default 5000ms (5 seconds)
}

export default function AutoNextButton({ 
  onNext, 
  onCancel, 
  isVisible, 
  duration = 5000 
}: AutoNextButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer when the button becomes visible
  useEffect(() => {
    if (isVisible && !isActive) {
      setIsActive(true);
      setProgress(0);
      setTimeLeft(duration / 1000);
      
      // Clear any existing timers
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Update progress every 100ms for smooth animation
      const updateInterval = 100;
      const totalSteps = duration / updateInterval;
      let currentStep = 0;
      
      intervalRef.current = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        const newTimeLeft = Math.ceil((duration - (currentStep * updateInterval)) / 1000);
        
        setProgress(newProgress);
        setTimeLeft(Math.max(0, newTimeLeft));
        
        if (currentStep >= totalSteps) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onNext();
          setIsActive(false);
        }
      }, updateInterval);
      
      // Backup timeout in case interval fails
      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onNext();
        setIsActive(false);
      }, duration);
    }
  }, [isVisible, duration, onNext, isActive]);

  // Reset when not visible
  useEffect(() => {
    if (!isVisible) {
      setIsActive(false);
      setProgress(0);
      setTimeLeft(duration / 1000);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [isVisible, duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCancel = () => {
    setIsActive(false);
    setProgress(0);
    setTimeLeft(duration / 1000);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onCancel?.();
  };

  const handleNextNow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsActive(false);
    onNext();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-1 flex items-center space-x-2 rtl:space-x-reverse">
        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-500 hover:text-red-500"
          aria-label="لغو"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress Button */}
        <div className="relative">
          <button
            onClick={handleNextNow}
            className="relative p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 overflow-hidden"
            aria-label={`صفحه بعد در ${timeLeft} ثانیه`}
          >
            {/* Progress Background */}
            <div 
              className="absolute inset-0 bg-blue-600 rounded-full transition-all duration-100 ease-linear"
              style={{
                transform: `scale(${progress / 100})`,
                transformOrigin: 'center'
              }}
            />
            
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center">
              <ChevronRight className="h-5 w-5" />
            </div>
          </button>

          {/* Timer Text */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {timeLeft}
          </div>
        </div>

        {/* Progress Text */}
        <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          صفحه بعد در {timeLeft} ثانیه
        </div>
      </div>
    </div>
  );
}
