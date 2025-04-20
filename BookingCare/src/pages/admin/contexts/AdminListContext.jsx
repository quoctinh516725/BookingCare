import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import AdminService from "../../../../services/AdminService";
import { MessageContext } from "../../../contexts/MessageProvider";

// Create the context
const AdminListContext = createContext();

// Custom hook to use the AdminList context
export const useAdminList = () => useContext(AdminListContext);

// Cache constants
const ADMIN_USERS_CACHE_KEY = "admin_users_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const AdminListProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const message = useContext(MessageContext);

  // Get cached users
  const getCachedUsers = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(ADMIN_USERS_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (data && timestamp && (now - timestamp < CACHE_DURATION)) {
          console.log("Using cached admin users");
          return data;
        }
      }
      return null;
    } catch (err) {
      console.error("Error reading admin users cache:", err);
      return null;
    }
  }, []);

  // Save to cache
  const saveToCache = useCallback((data) => {
    try {
      const timestamp = new Date().getTime();
      localStorage.setItem(
        ADMIN_USERS_CACHE_KEY,
        JSON.stringify({ data, timestamp })
      );
    } catch (err) {
      console.error("Error saving admin users to cache:", err);
    }
  }, []);

  // Fetch all admin users
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedUsers = getCachedUsers();
        if (cachedUsers) {
          setUsers(cachedUsers);
          setLoading(false);
          return cachedUsers;
        }
      }

      // Fetch from API
      const data = await AdminService.getAllAdminUsers();

      // Format and sort data if needed
      const formattedData = Array.isArray(data) ? data.map(user => ({
        ...user,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        formattedCreatedAt: new Date(user.createdAt).toLocaleString('vi-VN')
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      }) : [];

      // Update state and cache
      setUsers(formattedData);
      saveToCache(formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setError("Không thể tải danh sách quản trị viên. Vui lòng thử lại sau!");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getCachedUsers, saveToCache]);

  // Create admin user
  const createUser = useCallback(async (userData) => {
    try {
      const result = await AdminService.createUser(userData);
      
      // Invalidate cache and refresh data
      localStorage.removeItem(ADMIN_USERS_CACHE_KEY);
      await fetchUsers(true);
      
      message.success("Thêm quản trị viên thành công");
      return result;
    } catch (error) {
      console.error("Error creating admin user:", error);
      message.error("Có lỗi xảy ra khi thêm quản trị viên");
      throw error;
    }
  }, [fetchUsers, message]);

  // Update admin user
  const updateUser = useCallback(async (id, userData) => {
    try {
      const result = await AdminService.updateUser(id, userData);
      
      // Update the local state immediately for better UX
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? { 
            ...user, 
            ...userData,
            fullName: `${userData.firstName || user.firstName || ''} ${userData.lastName || user.lastName || ''}`.trim()
          } : user
        )
      );
      
      // Invalidate cache
      localStorage.removeItem(ADMIN_USERS_CACHE_KEY);
      
      message.success("Cập nhật quản trị viên thành công");
      return result;
    } catch (error) {
      console.error("Error updating admin user:", error);
      message.error("Có lỗi xảy ra khi cập nhật quản trị viên");
      throw error;
    }
  }, [message]);

  // Delete admin user
  const deleteUser = useCallback(async (id) => {
    try {
      await AdminService.deleteUser(id);
      
      // Update local state immediately
      setUsers(prev => prev.filter(user => user.id !== id));
      
      // Invalidate cache
      localStorage.removeItem(ADMIN_USERS_CACHE_KEY);
      
      message.success("Xóa quản trị viên thành công");
      return true;
    } catch (error) {
      console.error("Error deleting admin user:", error);
      message.error("Có lỗi xảy ra khi xóa quản trị viên");
      throw error;
    }
  }, [message]);

  // Change user status (active/inactive)
  const changeUserStatus = useCallback(async (id, isActive) => {
    try {
      await AdminService.updateUserStatus(id, isActive);
      
      // Update local state immediately
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? { ...user, isActive } : user
        )
      );
      
      // Invalidate cache
      localStorage.removeItem(ADMIN_USERS_CACHE_KEY);
      
      message.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công`);
      return true;
    } catch (error) {
      console.error("Error changing user status:", error);
      message.error(`Có lỗi xảy ra khi ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
      throw error;
    }
  }, [message]);

  // Load admin users when component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Value object to be provided by context
  const value = {
    users,
    loading,
    error,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus
  };

  return (
    <AdminListContext.Provider value={value}>
      {children}
    </AdminListContext.Provider>
  );
};

export default AdminListContext; 