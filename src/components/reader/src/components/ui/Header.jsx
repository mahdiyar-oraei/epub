import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')?.matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement?.classList?.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement?.classList?.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const navigationItems = [
    { path: '/epub-reader-interface', label: 'Reader', icon: 'BookOpen' },
  ];

  const secondaryItems = [
    { label: 'Settings', icon: 'Settings', action: () => console.log('Settings') },
    { label: 'Help', icon: 'HelpCircle', action: () => console.log('Help') },
    { label: 'About', icon: 'Info', action: () => console.log('About') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <Icon name="BookOpen" size={20} color="white" />
          </div>
          <h1 className="text-xl font-heading font-semibold text-foreground">
            EPUB Reader
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={16}
              className="transition-all duration-200"
            >
              {item?.label}
            </Button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-all duration-200 hover:bg-muted"
          >
            <Icon 
              name={isDarkMode ? "Sun" : "Moon"} 
              size={18} 
              className="transition-transform duration-300"
            />
          </Button>

          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="transition-all duration-200 hover:bg-muted"
            >
              <Icon name="MoreHorizontal" size={18} />
            </Button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-floating animate-fade-in">
                <div className="py-1">
                  {secondaryItems?.map((item, index) => (
                    <button
                      key={index}
                      onClick={item?.action}
                      className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                    >
                      <Icon name={item?.icon} size={16} className="mr-3" />
                      {item?.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-all duration-200 hover:bg-muted"
          >
            <Icon 
              name={isDarkMode ? "Sun" : "Moon"} 
              size={18} 
              className="transition-transform duration-300"
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="transition-all duration-200 hover:bg-muted"
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={18} />
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-slide-up">
          <div className="px-6 py-4 space-y-2">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} className="mr-3" />
                {item?.label}
              </button>
            ))}

            <div className="border-t border-border pt-2 mt-4">
              {secondaryItems?.map((item, index) => (
                <button
                  key={index}
                  onClick={item?.action}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors duration-200"
                >
                  <Icon name={item?.icon} size={16} className="mr-3" />
                  {item?.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;