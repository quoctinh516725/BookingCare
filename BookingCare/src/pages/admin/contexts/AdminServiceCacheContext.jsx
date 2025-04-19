import React, { createContext, useState, useContext, useEffect } from "react";
import ServiceService from "../../../../services/ServiceService";
import ServiceCategoryService from "../../../../services/ServiceCategoryService";

const AdminServiceCacheContext = createContext();

export const useAdminServiceCache = () => useContext(AdminServiceCacheContext);

// Constants for cache configuration
const SERVICES_CACHE_KEY = "admin_services_cache";
const CATEGORIES_CACHE_KEY = "admin_categories_cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const AdminServiceCacheProvider = ({ children }) => {
  // Initialize services state from localStorage if available
  const [services, setServices] = useState(() => {
    try {
      const cachedData = localStorage.getItem(SERVICES_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        // Check if cache is still valid
        if (data && timestamp && now - timestamp < CACHE_DURATION) {
          console.log("Using cached services from localStorage in admin");
          return data;
        }
      }
      return [];
    } catch (err) {
      console.error("Error reading services cache from localStorage:", err);
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
          console.log("Using cached categories from localStorage in admin");
          return data;
        }
      }
      return [];
    } catch (err) {
      console.error("Error reading categories cache from localStorage:", err);
      return [];
    }
  });

  const [servicesLoading, setServicesLoading] = useState(services.length === 0);
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

  // Fetch all services with optional force refresh
  const fetchServices = async (forceRefresh = false) => {
    // Check if we need to refresh data
    const now = new Date().getTime();
    const cachedData = localStorage.getItem(SERVICES_CACHE_KEY);
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
      services.length > 0 &&
      cachedTimestamp > 0 &&
      now - cachedTimestamp < CACHE_DURATION
    ) {
      // Use cached data
      console.log("Using cached services in admin");
      return services;
    }

    try {
      setServicesLoading(true);
      setError(null);
      console.log("Loading new service data from server in admin");
      const servicesData = await ServiceService.getAllServices();
      
      // Update state
      setServices(servicesData);
      
      // Save to localStorage
      saveToLocalStorage(SERVICES_CACHE_KEY, servicesData);
      
      return servicesData;
    } catch (error) {
      console.error("Error loading services:", error);
      setError("Could not load services list");
      return [];
    } finally {
      setServicesLoading(false);
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
      console.log("Using cached categories in admin");
      return categories;
    }

    try {
      setCategoriesLoading(true);
      setError(null);
      console.log("Loading new category data from server in admin");
      const categoriesData = await ServiceCategoryService.getAllCategories();
      
      // Update state
      setCategories(categoriesData);
      
      // Save to localStorage
      saveToLocalStorage(CATEGORIES_CACHE_KEY, categoriesData);
      
      return categoriesData;
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("Could not load categories list");
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Invalidate cache for services (called after create/update/delete operations)
  const invalidateServicesCache = () => {
    localStorage.removeItem(SERVICES_CACHE_KEY);
    setServices([]);
    return fetchServices(true);
  };

  // Invalidate cache for categories (called after create/update/delete operations)
  const invalidateCategoriesCache = () => {
    localStorage.removeItem(CATEGORIES_CACHE_KEY);
    setCategories([]);
    return fetchCategories(true);
  };

  // Load services and categories on first render if cache is empty
  useEffect(() => {
    if (services.length === 0) {
      fetchServices();
    }
    
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  // Context value
  const value = {
    services,
    categories,
    servicesLoading,
    categoriesLoading,
    error,
    fetchServices,
    fetchCategories,
    invalidateServicesCache,
    invalidateCategoriesCache
  };

  return (
    <AdminServiceCacheContext.Provider value={value}>
      {children}
    </AdminServiceCacheContext.Provider>
  );
}; 