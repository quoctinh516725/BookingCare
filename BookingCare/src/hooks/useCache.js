import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for caching data with expiry
 * @param {string} key - The key to store the data under in localStorage
 * @param {Function} fetchFunction - The function to call to get fresh data
 * @param {Object} options - Configuration options
 * @param {number} options.duration - How long to cache the data for in milliseconds
 * @param {boolean} options.autoRefresh - Whether to automatically refresh data when cache expires
 * @returns {Object} - The cached data and utilities
 */
const useCache = (key, fetchFunction, options = {}) => {
  const { 
    duration = 5 * 60 * 1000, // 5 minutes default
    autoRefresh = true 
  } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(0);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    try {
      const cacheData = localStorage.getItem(key);
      if (!cacheData) return false;
      
      const { timestamp } = JSON.parse(cacheData);
      return Date.now() - timestamp < duration;
    } catch (err) {
      console.error(`Error checking cache validity for ${key}:`, err);
      return false;
    }
  }, [key, duration]);

  // Get data from cache
  const getFromCache = useCallback(() => {
    try {
      const cacheData = localStorage.getItem(key);
      if (!cacheData) return null;
      
      const { data, timestamp } = JSON.parse(cacheData);
      setLastFetched(timestamp);
      return data;
    } catch (err) {
      console.error(`Error retrieving cache for ${key}:`, err);
      return null;
    }
  }, [key]);

  // Save data to cache
  const saveToCache = useCallback((data) => {
    try {
      const timestamp = Date.now();
      const cacheData = {
        data,
        timestamp
      };
      
      localStorage.setItem(key, JSON.stringify(cacheData));
      setLastFetched(timestamp);
      
      return true;
    } catch (err) {
      console.error(`Error saving to cache for ${key}:`, err);
      return false;
    }
  }, [key]);

  // Fetch fresh data
  const fetchData = useCallback(async (forceFetch = false) => {
    // Check if we need to fetch or can use cache
    if (!forceFetch && isCacheValid()) {
      const cachedData = getFromCache();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const freshData = await fetchFunction();
      setData(freshData);
      saveToCache(freshData);
      setLoading(false);
      return freshData;
    } catch (err) {
      console.error(`Error fetching data for ${key}:`, err);
      setError(err.message || 'Error fetching data');
      setLoading(false);
      
      // Return cached data as fallback even if expired
      const cachedData = getFromCache();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
      
      return null;
    }
  }, [fetchFunction, getFromCache, isCacheValid, key, saveToCache]);

  // Force refresh the data
  const refresh = useCallback(async () => {
    return await fetchData(true);
  }, [fetchData]);

  // Clear this cache entry
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error clearing cache for ${key}:`, err);
      return false;
    }
  }, [key]);

  // Check if data needs refreshing
  useEffect(() => {
    const initialLoad = async () => {
      if (isCacheValid()) {
        // Cache is valid, use it
        const cachedData = getFromCache();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          
          // If autoRefresh is enabled, refresh in background
          // when cache is over halfway through its lifetime
          if (autoRefresh) {
            const age = Date.now() - lastFetched;
            if (age > duration / 2) {
              fetchData(true);
            }
          }
        } else {
          // Cache is valid but couldn't retrieve it
          await fetchData(true);
        }
      } else {
        // Cache is not valid, fetch fresh data
        await fetchData(true);
      }
    };
    
    initialLoad();
    
    // Set up timer to check for cache expiry
    if (autoRefresh) {
      const interval = setInterval(() => {
        const age = Date.now() - lastFetched;
        if (age > duration) {
          fetchData(true);
        }
      }, Math.min(duration / 2, 60000)); // Check at least every minute
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, duration, fetchData, getFromCache, isCacheValid, lastFetched]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    lastFetched
  };
};

export default useCache; 