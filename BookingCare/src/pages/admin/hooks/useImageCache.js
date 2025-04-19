import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to load and cache images in localStorage
 * @param {string} src - Image URL to load
 * @param {string} fallbackSrc - Fallback image URL if loading fails
 * @param {number} quality - Image quality (0-1) for WebP conversion, default 0.8
 * @param {number} expiryTime - Cache expiry time in milliseconds, default 7 days
 * @param {string} cachePrefix - Prefix for cache key, used to separate different image types
 * @returns {Object} - Contains image source, loading status, and error state
 */
const useImageCache = (
  src, 
  fallbackSrc = '', 
  quality = 0.8, 
  expiryTime = 7 * 24 * 60 * 60 * 1000, 
  cachePrefix = 'admin_img_'
) => {
  const [imgSrc, setImgSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if localStorage is available
  const isLocalStorageAvailable = useCallback(() => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      // Silent fail
      return false;
    }
  }, []);

  // Check if browser supports WebP
  const supportsWebP = useCallback(() => {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  }, []);

  // Create a cache key from the src URL
  const createCacheKey = useCallback((url) => {
    try {
      // Remove any query parameters for consistency
      const baseUrl = url.split('?')[0];
      // Create a unique key using the cachePrefix and the URL
      return `${cachePrefix}${encodeURIComponent(baseUrl)}`;
    } catch {
      // Silent fail
      return `${cachePrefix}${Date.now()}`;
    }
  }, [cachePrefix]);

  // Check if image is cached and not expired
  const checkCachedImage = useCallback((key) => {
    if (!isLocalStorageAvailable()) return null;
    
    try {
      const cachedData = localStorage.getItem(key);
      if (!cachedData) return null;
      
      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      if (now - timestamp < expiryTime) {
        console.log('Using cached image:', src);
        return data;
      } else {
        // Clean up expired item
        localStorage.removeItem(key);
        return null;
      }
    } catch {
      return null;
    }
  }, [src, expiryTime, isLocalStorageAvailable]);

  // Determine if a URL is from the same origin
  const isSameOrigin = useCallback((url) => {
    try {
      const currentOrigin = window.location.origin;
      const urlObj = new URL(url, currentOrigin);
      return urlObj.origin === currentOrigin;
    } catch {
      return false;
    }
  }, []);

  // Load and cache the image
  useEffect(() => {
    if (!src) {
      setImgSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const cacheKey = createCacheKey(src);
    const cachedImage = checkCachedImage(cacheKey);
    
    if (cachedImage) {
      setImgSrc(cachedImage);
      setIsLoading(false);
      return;
    }
    
    // Load the image
    const img = new Image();
    let aborted = false;
    
    img.onload = () => {
      if (aborted) return;
      
      try {
        // Check if we can safely manipulate this image with canvas
        const canUseCanvas = isSameOrigin(src) || img.crossOrigin === 'anonymous';
        
        if (supportsWebP() && canUseCanvas) {
          // Convert to WebP if supported and image is safe to manipulate
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          try {
            // Convert to WebP format with specified quality
            const webpData = canvas.toDataURL('image/webp', quality);
            
            // Cache the WebP image
            if (isLocalStorageAvailable()) {
              try {
                localStorage.setItem(cacheKey, JSON.stringify({
                  data: webpData,
                  timestamp: Date.now()
                }));
              } catch {
                // Storage might be full, try to clean up old items
                console.warn('localStorage may be full, cleaning up old cache items');
                cleanupOldCache();
              }
            }
            
            setImgSrc(webpData);
          } catch (canvasError) {
            console.warn('Canvas operation failed, using original image:', canvasError);
            cacheAndSetOriginalImage();
          }
        } else {
          // If WebP is not supported or image is cross-origin, use the original format
          cacheAndSetOriginalImage();
        }
      } catch (err) {
        console.error('Error processing image:', err);
        cacheAndSetOriginalImage();
      }
      
      setIsLoading(false);
    };
    
    // Helper function to cache and set the original image
    const cacheAndSetOriginalImage = () => {
      if (isLocalStorageAvailable()) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: src,
            timestamp: Date.now()
          }));
        } catch {
          // Storage might be full, skip caching
          console.warn('localStorage may be full, skipping image cache');
        }
      }
      
      setImgSrc(src);
    };
    
    img.onerror = () => {
      if (aborted) return;
      console.error('Failed to load image:', src);
      setImgSrc(fallbackSrc);
      setError(new Error(`Failed to load image: ${src}`));
      setIsLoading(false);
    };
    
    // For same-origin images or if we specifically want to try cross-origin loading
    if (isSameOrigin(src)) {
      // Only set crossOrigin for same-origin images
      img.crossOrigin = 'anonymous';
    }
    
    img.src = src;
    
    // Cleanup function
    return () => {
      aborted = true;
    };
  }, [src, fallbackSrc, quality, checkCachedImage, createCacheKey, isLocalStorageAvailable, supportsWebP, isSameOrigin]);

  // Function to clean up old cache items
  const cleanupOldCache = () => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      // Find and remove old image cache items
      const now = Date.now();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith(cachePrefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item && item.timestamp && (now - item.timestamp > expiryTime / 2)) {
              localStorage.removeItem(key);
            }
          } catch {
            // Ignore parsing errors for invalid cache items
          }
        }
      }
    } catch {
      // Ignore any localStorage access errors
    }
  };

  return {
    imgSrc,
    isLoading,
    error,
  };
};

export default useImageCache; 