'use client';

import { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function OtpInput({ 
  length, 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Normalize Persian/Arabic-Indic digits to ASCII
  const normalizeDigits = (input: string) => {
    return input.replace(/[۰-۹٠-٩]/g, (char) => {
      const code = char.charCodeAt(0);
      // Persian (Eastern Arabic) digits: U+06F0..U+06F9
      if (code >= 0x06F0 && code <= 0x06F9) {
        return String(code - 0x06F0);
      }
      // Arabic-Indic digits: U+0660..U+0669
      if (code >= 0x0660 && code <= 0x0669) {
        return String(code - 0x0660);
      }
      return char;
    });
  };

  // Update internal state when value prop changes
  useEffect(() => {
    const otpArray = value.split('').slice(0, length);
    const paddedOtp = [...otpArray, ...Array(length - otpArray.length).fill('')];
    setOtp(paddedOtp);
  }, [value, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = normalizeDigits(element.value);
    
    // Only allow numbers
    if (!/^\d*$/.test(val)) return;
    
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1); // Only take the last character
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Focus next input
    if (val && index < length - 1) {
      // Use setTimeout to ensure state update is complete before focusing
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current input
        newOtp[index] = '';
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = '';
        inputRefs.current[index - 1]?.focus();
      }
      
      setOtp(newOtp);
      onChange(newOtp.join(''));
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = normalizeDigits(e.clipboardData.getData('text/plain')).replace(/\D/g, '');
    const pastedArray = pastedData.split('').slice(0, length);
    const newOtp = [...pastedArray, ...Array(length - pastedArray.length).fill('')];
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    setTimeout(() => {
      inputRefs.current[focusIndex]?.focus();
    }, 0);
  };

  const getFirstEmptyIndex = () => {
    const idx = otp.findIndex((d) => d === '');
    return idx === -1 ? length - 1 : idx;
  };

  const handleContainerClick = () => {
    const idx = getFirstEmptyIndex();
    inputRefs.current[idx]?.focus();
  };

  const handleFocus = (index: number) => {
    const firstEmpty = getFirstEmptyIndex();
    // Only redirect focus if user clicked on an input that's significantly after the first empty one
    // This prevents interference with natural tab/focus progression
    if (index > firstEmpty + 1) {
      setTimeout(() => {
        inputRefs.current[firstEmpty]?.focus();
      }, 0);
      return;
    }
    // Select existing value to overwrite on type
    const el = inputRefs.current[index];
    if (el && el.value) {
      setTimeout(() => {
        el.select();
      }, 0);
    }
  };

  return (
    <div dir="ltr" onClick={handleContainerClick} className={`flex gap-2 justify-center ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          dir="ltr"
          className={`
            w-12 h-12 text-center text-lg font-semibold
            border-2 rounded-lg
            bg-white dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800
            focus:outline-none
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${digit ? 'border-primary-500 dark:border-primary-400' : ''}
          `}
          aria-label={`کد تأیید رقم ${index + 1}`}
        />
      ))}
    </div>
  );
}
