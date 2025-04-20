import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import SpecialistService from "../../../../services/SpecialistService";
import { MessageContext } from "../../../contexts/MessageProvider";

// Create the context
const SpecialistContext = createContext();

// Custom hook to use the specialist context
export const useSpecialists = () => useContext(SpecialistContext);

// Cache constants
const SPECIALISTS_CACHE_KEY = "admin_specialists_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const SpecialistProvider = ({ children }) => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const message = useContext(MessageContext);

  // Get cached specialists
  const getCachedSpecialists = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(SPECIALISTS_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (data && timestamp && (now - timestamp < CACHE_DURATION)) {
          console.log("Using cached specialists");
          return data;
        }
      }
      return null;
    } catch (err) {
      console.error("Error reading specialists cache:", err);
      return null;
    }
  }, []);

  // Save to cache
  const saveToCache = useCallback((data) => {
    try {
      const timestamp = new Date().getTime();
      localStorage.setItem(
        SPECIALISTS_CACHE_KEY,
        JSON.stringify({ data, timestamp })
      );
    } catch (err) {
      console.error("Error saving specialists to cache:", err);
    }
  }, []);

  // Fetch all specialists
  const fetchSpecialists = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedSpecialists = getCachedSpecialists();
        if (cachedSpecialists) {
          setSpecialists(cachedSpecialists);
          setLoading(false);
          return cachedSpecialists;
        }
      }

      // Fetch from API
      const data = await SpecialistService.getAllSpecialists();

      // Sort by created date (newest first)
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      }) : [];

      // Update state and cache
      setSpecialists(sortedData);
      saveToCache(sortedData);
      return sortedData;
    } catch (error) {
      console.error("Error fetching specialists:", error);
      setError("Không thể tải danh sách chuyên viên. Vui lòng thử lại sau!");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getCachedSpecialists, saveToCache]);

  // Create specialist
  const createSpecialist = useCallback(async (specialistData) => {
    try {
      const result = await SpecialistService.createSpecialist(specialistData);
      
      // Invalidate cache and refresh data
      localStorage.removeItem(SPECIALISTS_CACHE_KEY);
      await fetchSpecialists(true);
      
      message.success("Thêm chuyên viên thành công");
      return result;
    } catch (error) {
      console.error("Error creating specialist:", error);
      message.error("Có lỗi xảy ra khi thêm chuyên viên");
      throw error;
    }
  }, [fetchSpecialists, message]);

  // Update specialist
  const updateSpecialist = useCallback(async (id, specialistData) => {
    try {
      const result = await SpecialistService.updateSpecialist(id, specialistData);
      
      // Update the local state immediately for better UX
      setSpecialists(prev => 
        prev.map(specialist => 
          specialist.id === id ? { ...specialist, ...specialistData } : specialist
        )
      );
      
      // Invalidate cache
      localStorage.removeItem(SPECIALISTS_CACHE_KEY);
      
      message.success("Cập nhật chuyên viên thành công");
      return result;
    } catch (error) {
      console.error("Error updating specialist:", error);
      message.error("Có lỗi xảy ra khi cập nhật chuyên viên");
      throw error;
    }
  }, [message]);

  // Delete specialist
  const deleteSpecialist = useCallback(async (id) => {
    try {
      await SpecialistService.deleteSpecialist(id);
      
      // Update local state immediately
      setSpecialists(prev => prev.filter(specialist => specialist.id !== id));
      
      // Invalidate cache
      localStorage.removeItem(SPECIALISTS_CACHE_KEY);
      
      message.success("Xóa chuyên viên thành công");
      return true;
    } catch (error) {
      console.error("Error deleting specialist:", error);
      message.error("Có lỗi xảy ra khi xóa chuyên viên");
      throw error;
    }
  }, [message]);

  // Upload specialist image
  const uploadSpecialistImage = useCallback(async (imageFile) => {
    try {
      return await SpecialistService.uploadSpecialistImage(imageFile);
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Có lỗi xảy ra khi tải lên ảnh");
      throw error;
    }
  }, [message]);

  // Load specialists when component mounts
  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  // Value object to be provided by context
  const value = {
    specialists,
    loading,
    error,
    selectedSpecialist,
    setSelectedSpecialist,
    fetchSpecialists,
    createSpecialist,
    updateSpecialist,
    deleteSpecialist,
    uploadSpecialistImage
  };

  return (
    <SpecialistContext.Provider value={value}>
      {children}
    </SpecialistContext.Provider>
  );
};

export default SpecialistContext; 