'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';

export interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  theme: 'light' | 'dark' | 'sepia' | 'night';
  lineHeight: number;
  margin: number;
  width: 'narrow' | 'standard' | 'wide';
  justify: boolean;
  hyphenation: boolean;
}

interface ReaderSettingsContextType {
  settings: ReaderSettings;
  updateSettings: (newSettings: Partial<ReaderSettings>) => void;
  applySettings: () => void;
  resetToDefaults: () => void;
  exportSettings: () => void;
  importSettings: (settingsData: string) => void;
}

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'serif',
  theme: 'light',
  lineHeight: 1.6,
  margin: 40,
  width: 'standard',
  justify: true,
  hyphenation: false,
};

const ReaderSettingsContext = createContext<ReaderSettingsContextType | undefined>(undefined);

export const ReaderSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('global-reader-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Validate the parsed settings
        const validSettings = { ...defaultSettings, ...parsed };
        setSettings(validSettings);
        console.log('Loaded saved settings:', validSettings);
      } else {
        console.log('No saved settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading saved reader settings:', error);
      // If there's an error, use default settings
      setSettings(defaultSettings);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('global-reader-settings', JSON.stringify(settings));
        console.log('Settings saved to localStorage:', settings);
      } catch (error) {
        console.error('Error saving settings to localStorage:', error);
      }
    }
  }, [settings, isInitialized]);

  // Update settings and auto-apply them
  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    console.log('Updating settings:', { old: settings, new: updatedSettings });
    setSettings(updatedSettings);
    
    // Auto-apply settings immediately
    const event = new CustomEvent('reader-settings-changed', { 
      detail: updatedSettings 
    });
    window.dispatchEvent(event);
    
    // Also update CSS custom properties for global styling
    updateGlobalCSS(updatedSettings);
  };

  // Apply settings immediately to all active readers (for manual application)
  const applySettings = () => {
    console.log('Applying settings manually:', settings);
    // Dispatch a custom event that readers can listen to
    const event = new CustomEvent('reader-settings-changed', { 
      detail: settings 
    });
    window.dispatchEvent(event);
    
    // Also update CSS custom properties for global styling
    updateGlobalCSS(settings);
  };

  // Reset to default settings
  const resetToDefaults = () => {
    console.log('Resetting to default settings');
    setSettings(defaultSettings);
    updateGlobalCSS(defaultSettings);
    
    // Dispatch event for immediate application
    const event = new CustomEvent('reader-settings-changed', { 
      detail: defaultSettings 
    });
    window.dispatchEvent(event);
  };

  // Export settings
  const exportSettings = () => {
    const settingsData = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reader-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import settings
  const importSettings = (settingsData: string) => {
    try {
      const parsed = JSON.parse(settingsData);
      // Validate imported settings
      const validSettings = { ...defaultSettings, ...parsed };
      setSettings(validSettings);
      updateGlobalCSS(validSettings);
      
      // Dispatch event for immediate application
      const event = new CustomEvent('reader-settings-changed', { 
        detail: validSettings 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error parsing imported settings:', error);
      throw new Error('Invalid settings file format');
    }
  };

  // Update global CSS custom properties
  const updateGlobalCSS = (newSettings: ReaderSettings) => {
    const root = document.documentElement;
    
    // Font settings
    root.style.setProperty('--reader-font-size', `${newSettings.fontSize}px`);
    root.style.setProperty('--reader-line-height', newSettings.lineHeight.toString());
    root.style.setProperty('--reader-margin', `${newSettings.margin}px`);
    
    // Theme colors
    const themeColors = getThemeColors(newSettings.theme);
    root.style.setProperty('--reader-bg-color', themeColors.background);
    root.style.setProperty('--reader-text-color', themeColors.text);
    root.style.setProperty('--reader-accent-color', themeColors.accent);
    
    // Font family
    const fontFamily = getFontFamily(newSettings.fontFamily);
    root.style.setProperty('--reader-font-family', fontFamily);
    
    // Text alignment
    root.style.setProperty('--reader-text-align', newSettings.justify ? 'justify' : 'right');
    
    // Width
    const widthValue = getWidthValue(newSettings.width);
    root.style.setProperty('--reader-max-width', `${widthValue}px`);
    
    // Hyphenation
    root.style.setProperty('--reader-hyphens', newSettings.hyphenation ? 'auto' : 'none');
  };

  // Helper functions
  const getFontFamily = (family: string) => {
    switch (family) {
      case 'serif': return 'Georgia, "Times New Roman", serif';
      case 'sans-serif': return 'Arial, "Helvetica Neue", sans-serif';
      case 'monospace': return 'Courier New, monospace';
      default: return 'Georgia, serif';
    }
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'dark':
        return { 
          background: '#1a1a1a', 
          text: '#e5e5e5', 
          accent: '#3b82f6'
        };
      case 'sepia':
        return { 
          background: '#f4f1ea', 
          text: '#5c4b37', 
          accent: '#8b4513'
        };
      case 'night':
        return { 
          background: '#0a0a0a', 
          text: '#d4d4d4', 
          accent: '#60a5fa'
        };
      default:
        return { 
          background: '#ffffff', 
          text: '#000000', 
          accent: '#3b82f6'
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

  // Initialize global CSS on mount
  useEffect(() => {
    if (isInitialized) {
      updateGlobalCSS(settings);
    }
  }, [isInitialized, settings]);

  return (
    <ReaderSettingsContext.Provider value={{
      settings,
      updateSettings,
      applySettings,
      resetToDefaults,
      exportSettings,
      importSettings,
    }}>
      {children}
    </ReaderSettingsContext.Provider>
  );
};

export const useReaderSettings = () => {
  const context = useContext(ReaderSettingsContext);
  if (context === undefined) {
    throw new Error('useReaderSettings must be used within a ReaderSettingsProvider');
  }
  return context;
};

// Custom hook for listening to settings changes
export const useSettingsListener = (callback?: (settings: ReaderSettings) => void) => {
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      if (callback) {
        callback(event.detail);
      }
    };

    window.addEventListener('reader-settings-changed', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('reader-settings-changed', handleSettingsChange as EventListener);
    };
  }, [callback]);
};
