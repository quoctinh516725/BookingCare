import React, { createContext, useState, useContext, useEffect } from "react";
import SpecialistService from "../../../../services/SpecialistService";
import SpecialistCategoryService from "../../../../services/SpecialistCategoryService";

const AdminSpecialistCacheContext = createContext();

export const useAdminSpecialistCache = () => useContext(AdminSpecialistCacheContext);

// Constants for cache configuration
const SPECIALISTS_CACHE_KEY = "admin_specialists_cache";
const CATEGORIES_CACHE_KEY = "admin_specialist_categories_cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const AdminSpecialistCacheProvider = ({ children }) => {
  // Initialize specialists state from localStorage if available
  const [specialists, setSpecialists] = useState(() => {
    try {
      const cachedData = localStorage.getItem(SPECIALISTS_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        // Check if cache is still valid
        if (data && timestamp && now - timestamp < CACHE_DURATION) {
          console.log("Using cached specialists from localStorage in admin");
          return data;
        }
      }
      return [];
    } catch (err) {
      console.error("Error reading specialists cache from localStorage:", err);
      return [];
    }
  });

  // Initialize categories state from localStorage if available
  const [categories, setCategories] = useState(() => {
    try {
      const cachedData = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        // Check if cache is still valid
        if (data && timestamp && now - timestamp < CACHE_DURATION) {
          console.log("Using cached specialist categories from localStorage in admin");
          return data;
        }
      }
      return [];
    } catch (err) {
      console.error("Error reading specialist categories cache from localStorage:", err);
      return [];
    }
  });

  const [specialistsLoading, setSpecialistsLoading] = useState(specialists.length === 0);
  const [categoriesLoading, setCategoriesLoading] = useState(categories.length === 0);
  const [error, setError] = useState(null);
  
  // Save data to localStorage with timestamp
  const saveToLocalStorage = (key, data) => {
    try {
      const timestamp = new Date().getTime();
      localStorage.setItem(key, JSON.stringify({ data, timestamp }));
    } catch (err) {
      console.error(`Error saving cache to localStorage (${key}):`, err);
    }
  };

  // Fetch all specialists with optional force refresh
  const fetchSpecialists = async (forceRefresh = false) => {
    // Check if we need to refresh data
    const now = new Date().getTime();
    const cachedData = localStorage.getItem(SPECIALISTS_CACHE_KEY);
    let cachedTimestamp = 0;
    
    if (cachedData) {
      try {
        const { timestamp } = JSON.parse(cachedData);
        cachedTimestamp = timestamp || 0;
      } catch (e) {
        console.error("Error parsing cache timestamp:", e);
      }
    }

    if (
      !forceRefresh &&
      specialists.length > 0 &&
      cachedTimestamp > 0 &&
      now - cachedTimestamp < CACHE_DURATION
    ) {
      // Use cached data
      console.log("Using cached specialists in admin");
      return specialists;
    }

    try {
      setSpecialistsLoading(true);
      setError(null);
      console.log("Loading new specialist data from server in admin");
      const specialistsData = await SpecialistService.getAllSpecialists();
      
      // Update state
      setSpecialists(specialistsData);
      
      // Save to localStorage
      saveToLocalStorage(SPECIALISTS_CACHE_KEY, specialistsData);
      
      return specialistsData;
    } catch (error) {
      console.error("Error loading specialists:", error);
      setError("Could not load specialists list");
      return [];
    } finally {
      setSpecialistsLoading(false);
    }
  };

  // Fetch all categories with optional force refresh
  const fetchCategories = async (forceRefresh = false) => {
    // Check if we need to refresh data
    const now = new Date().getTime();
    const cachedData = localStorage.getItem(CATEGORIES_CACHE_KEY);
    let cachedTimestamp = 0;
    
    if (cachedData) {
      try {
        const { timestamp } = JSON.parse(cachedData);
        cachedTimestamp = timestamp || 0;
      } catch (e) {
        console.error("Error parsing cache timestamp:", e);
      }
    }

    if (
      !forceRefresh &&
      categories.length > 0 &&
      cachedTimestamp > 0 &&
      now - cachedTimestamp < CACHE_DURATION
    ) {
      // Use cached data
      console.log("Using cached specialist categories in admin");
      return categories;
    }

    try {
      setCategoriesLoading(true);
      setError(null);
      console.log("Loading new specialist category data from server in admin");
      const categoriesData = await SpecialistCategoryService.getAllCategories();
      
      // Update state
      setCategories(categoriesData);
      
      // Save to localStorage
      saveToLocalStorage(CATEGORIES_CACHE_KEY, categoriesData);
      
      return categoriesData;
    } catch (error) {
      console.error("Error loading specialist categories:", error);
      setError("Could not load specialist categories list");
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Invalidate cache for specialists (called after create/update/delete operations)
  const invalidateSpecialistsCache = () => {
    localStorage.removeItem(SPECIALISTS_CACHE_KEY);
    setSpecialists([]);
    return fetchSpecialists(true);
  };

  // Invalidate cache for categories (called after create/update/delete operations)
  const invalidateCategoriesCache = () => {
    localStorage.removeItem(CATEGORIES_CACHE_KEY);
    setCategories([]);
    return fetchCategories(true);
  };

  // Load specialists and categories on first render if cache is empty
  useEffect(() => {
    if (specialists.length === 0) {
      fetchSpecialists();
    }
    
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  // Context value
  const value = {
    specialists,
    categories,
    specialistsLoading,
    categoriesLoading,
    error,
    fetchSpecialists,
    fetchCategories,
    invalidateSpecialistsCache,
    invalidateCategoriesCache
  };

  return (
    <AdminSpecialistCacheContext.Provider value={value}>
      {children}
    </AdminSpecialistCacheContext.Provider>
  );
};  