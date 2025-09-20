/**
 * Utility functions for handling redirect destinations in authentication flows
 */

/**
 * Store the current page path as the redirect destination after authentication
 */
export const storeCurrentPageForRedirect = () => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('redirectDestination', currentPath);
  }
};

/**
 * Get the stored redirect destination
 */
export const getStoredRedirectDestination = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('redirectDestination');
  }
  return null;
};

/**
 * Clear the stored redirect destination
 */
export const clearStoredRedirectDestination = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('redirectDestination');
  }
};

/**
 * Check if the current page requires authentication
 */
export const isPageRequiringAuth = (pathname: string): boolean => {
  // Add paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/admin',
    '/settings',
    '/library'
  ];
  
  // Check if the current path starts with any protected path
  return protectedPaths.some(path => pathname.startsWith(path));
};

/**
 * Redirect to login while storing the current page for later redirect
 */
export const redirectToLoginWithReturn = () => {
  storeCurrentPageForRedirect();
  window.location.href = '/auth/login';
};
