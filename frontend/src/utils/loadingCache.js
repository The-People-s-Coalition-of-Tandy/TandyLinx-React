const LOADING_CACHE_KEY = 'template_loader_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Add keyboard shortcut for development
if (process.env.NODE_ENV === 'development') {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      localStorage.removeItem(LOADING_CACHE_KEY);
      console.log('Loading cache cleared! Refresh to see the loader.');
    }
  });
}

export const shouldShowLoading = () => {
  const lastLoadTime = localStorage.getItem(LOADING_CACHE_KEY);
  const currentTime = Date.now();
  
  // Don't set the timestamp until after the animation completes
  if (!lastLoadTime || (currentTime - parseInt(lastLoadTime)) > CACHE_DURATION) {
    return true;
  }
  
  console.log('Should show loading: false', {
    lastLoadTime,
    timeSinceLastLoad: currentTime - parseInt(lastLoadTime),
    cacheExpired: (currentTime - parseInt(lastLoadTime)) > CACHE_DURATION
  });
  return false;
};

export const setLastLoadTime = () => {
  localStorage.setItem(LOADING_CACHE_KEY, Date.now().toString());
};

export const clearLoadingCache = () => {
  localStorage.removeItem(LOADING_CACHE_KEY);
}; 