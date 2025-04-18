import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import SpecialistService from "../../../../services/SpecialistService";

// Biến lưu trữ ở mức module để cache dữ liệu tại client
let cachedSpecialties = null;
let cachedSpecialists = null;
let cachedSpecialistsBySpecialty = {};
let lastFetchTimeSpecialties = 0;
let lastFetchTimeSpecialists = 0;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 phút

export default function useSpecialistData(pageSize = 6) {
  const [specialties, setSpecialties] = useState(cachedSpecialties || [{ name: "Tất cả" }]);
  const [specialists, setSpecialists] = useState(cachedSpecialists || []);
  const [filteredSpecialists, setFilteredSpecialists] = useState(cachedSpecialists || []);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(!cachedSpecialists);
  const [specialtyLoading, setSpecialtyLoading] = useState(!cachedSpecialties);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  // Track if we're waiting for a background data load
  const backgroundLoadingRef = useRef(false);

  // Kiểm tra cache còn hiệu lực không
  const isSpecialtiesCacheValid = useMemo(() => {
    const now = Date.now();
    return cachedSpecialties && (now - lastFetchTimeSpecialties < CACHE_EXPIRY);
  }, []);

  const isSpecialistsCacheValid = useMemo(() => {
    const now = Date.now();
    return cachedSpecialists && (now - lastFetchTimeSpecialists < CACHE_EXPIRY);
  }, []);

  // Tải danh sách chuyên môn
  useEffect(() => {
    const fetchSpecialties = async () => {
      // Nếu có cache hợp lệ, sử dụng ngay và không gọi API
      if (isSpecialtiesCacheValid) {
        console.log("Using cached specialties data");
        setSpecialties(cachedSpecialties);
        setSpecialtyLoading(false);
        return;
      }

      try {
        setSpecialtyLoading(true);
        const data = await SpecialistService.getSpecialistSpecialties();
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Add "Tất cả" to the beginning of the specialties list
          const specialtiesWithAll = [{ name: "Tất cả" }, ...data];
          setSpecialties(specialtiesWithAll);
          
          // Cập nhật cache
          cachedSpecialties = specialtiesWithAll;
          lastFetchTimeSpecialties = Date.now();
        }
      } catch (err) {
        console.error("Error fetching specialties:", err);
        // Nếu có lỗi, vẫn giữ "Tất cả" làm lựa chọn mặc định
      } finally {
        setSpecialtyLoading(false);
      }
    };

    fetchSpecialties();
  }, [isSpecialtiesCacheValid]);

  // Tải danh sách chuyên gia dựa trên chuyên môn đã chọn và tìm kiếm
  useEffect(() => {
    let isMounted = true; // Prevent updating state after unmount
    
    const fetchSpecialists = async () => {
      // Reset trang khi thay đổi lựa chọn danh mục hoặc tìm kiếm
      if (isMounted) {
        setCurrentPage(1);
        setLoading(true);
      }

      try {
        let data;
        const cacheKey = selectedCategory;

        // Kiểm tra cache cho chuyên môn đã chọn
        if (selectedCategory === "Tất cả" && isSpecialistsCacheValid) {
          console.log("Using cached specialists data");
          data = cachedSpecialists;
        } else if (
          selectedCategory !== "Tất cả" && 
          cachedSpecialistsBySpecialty[cacheKey] && 
          Date.now() - cachedSpecialistsBySpecialty[cacheKey].timestamp < CACHE_EXPIRY
        ) {
          console.log(`Using cached specialists for ${cacheKey}`);
          data = cachedSpecialistsBySpecialty[cacheKey].data;
        } else {
          // Không có cache hoặc cache đã hết hạn, gọi API
          if (selectedCategory === "Tất cả") {
            data = await SpecialistService.getAllSpecialists();
            
            if (data && data.length > 0) {
              // Cập nhật cache cho tất cả chuyên gia
              cachedSpecialists = data;
              lastFetchTimeSpecialists = Date.now();
            }
          } else {
            // Tìm đối tượng chuyên môn từ mảng specialties
            const specialty = specialties.find(spec => spec.name === selectedCategory);
            
            // Nếu có ID chuyên môn, sử dụng cho API call
            if (specialty && specialty.id) {
              data = await SpecialistService.getSpecialistsBySpecialty(specialty.id);
            } else {
              // Nếu không tìm thấy ID, dùng tên chuyên môn
              data = await SpecialistService.getSpecialistsBySpecialty(selectedCategory);
            }
            
            // Cập nhật cache cho chuyên môn cụ thể
            cachedSpecialistsBySpecialty[cacheKey] = {
              data: data || [],
              timestamp: Date.now()
            };
          }
        }

        if (isMounted) {
          setSpecialists(data || []);
          
          // Lọc dữ liệu nếu có tìm kiếm
          if (searchQuery && data && data.length > 0) {
            filterSpecialists(data, searchQuery);
          } else {
            setFilteredSpecialists(data || []);
          }
          
          setError(null);
          setLoading(false);
        }
        
        // Sau khi hiển thị dữ liệu ban đầu, kiểm tra xem có phải dữ liệu mẫu hay không
        if (data && data.length === 6 && !backgroundLoadingRef.current) {
          // Có thể là dữ liệu mẫu, đặt cờ để theo dõi
          backgroundLoadingRef.current = true;
          
          // Đợi 500ms để không chặn hiển thị UI ban đầu
          setTimeout(() => {
            // Kiểm tra lại cache sau thời gian chờ
            const cacheUpdated = 
              selectedCategory === "Tất cả" 
                ? cachedSpecialists?.length > 6 
                : cachedSpecialistsBySpecialty[cacheKey]?.data?.length > 6;
                
            if (cacheUpdated && isMounted) {
              // Cache đã được cập nhật với dữ liệu API thực, cập nhật UI
              if (selectedCategory === "Tất cả") {
                setSpecialists(cachedSpecialists);
                setFilteredSpecialists(
                  searchQuery ? filterSpecialistsData(cachedSpecialists, searchQuery) : cachedSpecialists
                );
              } else if (cachedSpecialistsBySpecialty[cacheKey]) {
                const realData = cachedSpecialistsBySpecialty[cacheKey].data;
                setSpecialists(realData);
                setFilteredSpecialists(
                  searchQuery ? filterSpecialistsData(realData, searchQuery) : realData
                );
              }
              backgroundLoadingRef.current = false;
            }
          }, 500);
        }
      } catch (err) {
        console.error("Error fetching specialists:", err);
        if (isMounted) {
          setError("Không thể tải danh sách chuyên viên. Vui lòng thử lại sau.");
          setLoading(false);
        }
      }
    };

    fetchSpecialists();
    
    return () => {
      isMounted = false; // Clean up to prevent memory leaks
    };
  }, [selectedCategory, isSpecialistsCacheValid, specialties]);

  // Thực hiện lọc khi thay đổi tìm kiếm
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSpecialists(specialists);
      return;
    }
    
    setPaginationLoading(true);
    
    // Sử dụng timeout để tránh blocking UI khi lọc nhiều dữ liệu
    const searchTimeout = setTimeout(() => {
      filterSpecialists(specialists, searchQuery);
      setPaginationLoading(false);
    }, 100); // Giảm từ 300ms xuống 100ms
    
    return () => clearTimeout(searchTimeout);
  }, [searchQuery, specialists]);

  // Hàm lọc chuyên gia theo query
  const filterSpecialistsData = (data, query) => {
    const searchLower = query.toLowerCase();
    return data.filter(specialist => 
      specialist.firstName?.toLowerCase().includes(searchLower) ||
      specialist.lastName?.toLowerCase().includes(searchLower) ||
      specialist.description?.toLowerCase().includes(searchLower) ||
      `${specialist.firstName} ${specialist.lastName}`.toLowerCase().includes(searchLower)
    );
  };
  
  // Hàm lọc và cập nhật state
  const filterSpecialists = (data, query) => {
    setFilteredSpecialists(filterSpecialistsData(data, query));
  };

  // Xử lý thay đổi danh mục
  const handleFilterChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Xử lý thay đổi tìm kiếm
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Xử lý thay đổi trang
  const handlePageChange = useCallback((page) => {
    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setPaginationLoading(true);
    setCurrentPage(page);
    
    // Giảm thời gian delay do đã có cache
    setTimeout(() => {
      setPaginationLoading(false);
    }, 50);
  }, []);

  // Prefetch trang tiếp theo khi hover qua pagination
  const handlePaginationHover = useCallback(() => {
    // Không làm gì, chỉ để tương thích với Pagination component
    // Trong trường hợp này, dữ liệu đã được tải hết và lọc ở client side
  }, []);

  // Lấy các item cho trang hiện tại - sử dụng useMemo để tránh tính toán lại nếu không cần thiết
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    return filteredSpecialists.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, filteredSpecialists, pageSize]);
  
  // Lấy tên chuyên môn cho Filter
  const specialtyNames = useMemo(() => 
    specialties.map(spec => spec.name), [specialties]
  );

  // Tổng số trang
  const totalPages = useMemo(() => 
    Math.ceil(filteredSpecialists.length / pageSize), [filteredSpecialists.length, pageSize]
  );

  return {
    specialties,
    specialists,
    filteredSpecialists,
    selectedCategory,
    searchQuery,
    loading,
    specialtyLoading,
    paginationLoading,
    error,
    currentPage,
    pageSize,
    currentItems,
    specialtyNames,
    totalPages,
    handleFilterChange,
    handleSearchChange,
    handlePageChange,
    handlePaginationHover
  };
} 