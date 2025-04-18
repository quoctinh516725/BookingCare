import { useState, useEffect, useCallback, useMemo } from "react";
import ServiceService from "../../../../services/ServiceService";
import ServiceCategoryService from "../../../../services/ServiceCategoryService";

// Biến lưu trữ ở mức module để cache dữ liệu
let cachedServices = null;
let cachedCategories = null;
let lastFetchTime = 0;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 phút

export default function useServiceData(pageSize = 6) {
  const [categories, setCategories] = useState(cachedCategories || [{ name: "Tất cả" }]);
  const [services, setServices] = useState(cachedServices || []);
  const [filteredServices, setFilteredServices] = useState(cachedServices || []);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(!cachedServices);
  const [categoryLoading, setCategoryLoading] = useState(!cachedCategories);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Kiểm tra cache còn hiệu lực không
  const isCacheValid = useMemo(() => {
    const now = Date.now();
    return cachedServices && cachedCategories && (now - lastFetchTime < CACHE_EXPIRY);
  }, []);

  // Tải danh mục dịch vụ
  useEffect(() => {
    const fetchCategories = async () => {
      // Nếu có cache hợp lệ, sử dụng ngay và không gọi API
      if (isCacheValid && cachedCategories) {
        setCategories(cachedCategories);
        setCategoryLoading(false);
        return;
      }

      try {
        setCategoryLoading(true);
        const categoryData = await ServiceCategoryService.getActiveCategories();
        
        if (Array.isArray(categoryData)) {
          const newCategories = [{ name: "Tất cả" }, ...categoryData];
          setCategories(newCategories);
          // Cập nhật cache
          cachedCategories = newCategories;
          lastFetchTime = Date.now();
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh mục dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [isCacheValid]);

  // Tải tất cả dịch vụ
  useEffect(() => {
    const fetchAllServices = async () => {
      // Nếu có cache hợp lệ, sử dụng ngay và không gọi API
      if (isCacheValid && cachedServices) {
        setServices(cachedServices);
        setFilteredServices(cachedServices);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allServices = await ServiceService.getAllServices();
        setServices(allServices || []);
        setFilteredServices(allServices || []);
        setError(null);
        
        // Cập nhật cache
        cachedServices = allServices || [];
        lastFetchTime = Date.now();
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllServices();
  }, [isCacheValid]);

  // Reset current page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Filter logic (client-side)
  useEffect(() => {
    // Đánh dấu đang tải cho phân trang
    setPaginationLoading(true);
    
    // Sử dụng timeout để tránh blocking UI khi filter nhiều dữ liệu
    const filterTimeout = setTimeout(() => {
      let result = [...services];

      if (selectedCategory !== "Tất cả") {
        const selected = categories.find((cat) => cat.name === selectedCategory);
        if (selected?.id) {
          result = result.filter((service) => service.categoryId === selected.id);
        }
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        result = result.filter((service) =>
          service.name?.toLowerCase().includes(searchLower)
        );
      }

      setFilteredServices(result);
      setPaginationLoading(false);
    }, 100);

    return () => clearTimeout(filterTimeout);
  }, [selectedCategory, searchQuery, services, categories]);

  const handleFilterChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handlePageChange = useCallback((page) => {
    // Scroll lên đầu để tạo trải nghiệm tốt hơn
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Đánh dấu đang tải khi chuyển trang
    setPaginationLoading(true);
    
    // Giảm thời gian delay vì đã có cache
    setTimeout(() => {
      setCurrentPage(page);
      setPaginationLoading(false);
    }, 100);
  }, []);

  // Get current page items - chỉ lấy các items cần thiết cho trang hiện tại
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  
  // Get category names for filter
  const categoryNames = categories.map((cat) => cat.name);

  return {
    categories,
    services,
    filteredServices,
    selectedCategory,
    searchQuery,
    loading,
    categoryLoading,
    paginationLoading, // Trạng thái đang tải của phân trang
    error,
    currentPage,
    pageSize,
    currentItems,
    categoryNames,
    handleFilterChange,
    handleSearchChange,
    handlePageChange
  };
} 