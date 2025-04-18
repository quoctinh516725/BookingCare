import { useState, useEffect, useCallback } from "react";
import ServiceService from "../../../services/ServiceService";
import SpecialistService from "../../../services/SpecialistService";
import BlogService from "../../../services/BlogService";

// Hook lấy dữ liệu dịch vụ
export function useServiceData() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const servicesData = await ServiceService.getAllServices({ limit: 3 });
      console.log("Services data received:", servicesData);
      
      if (!servicesData || !Array.isArray(servicesData) || servicesData.length === 0) {
        setError("Không có dữ liệu dịch vụ");
        setServices([]);
      } else {
        // Kiểm tra dữ liệu có đủ trường cần thiết không
        const validatedServices = servicesData
          .filter(service => service && service.id)
          .slice(0, 3); // Chỉ lấy 3 dịch vụ đầu tiên
        
        setServices(validatedServices);
        
        if (validatedServices.length === 0) {
          setError("Không có dữ liệu dịch vụ hợp lệ");
        }
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Không thể tải dữ liệu dịch vụ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetchServices: fetchServices };
}

// Hook lấy dữ liệu chuyên viên
export function useSpecialistData() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSpecialists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const specialistsData = await SpecialistService.getTopRatedSpecialists(3);
      console.log("Specialists data received:", specialistsData);
      
      if (!specialistsData || !Array.isArray(specialistsData) || specialistsData.length === 0) {
        setError("Không có dữ liệu chuyên viên");
        setSpecialists([]);
      } else {
        // Kiểm tra dữ liệu có đủ trường cần thiết không
        const validatedSpecialists = specialistsData
          .filter(specialist => specialist && specialist.id)
          .slice(0, 3); // Chỉ lấy 3 chuyên viên đầu tiên
        
        setSpecialists(validatedSpecialists);
        
        if (validatedSpecialists.length === 0) {
          setError("Không có dữ liệu chuyên viên hợp lệ");
        }
      }
    } catch (err) {
      console.error("Error fetching specialists:", err);
      setError("Không thể tải dữ liệu chuyên viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  return { specialists, loading, error, refetchSpecialists: fetchSpecialists };
}

// Hook lấy dữ liệu blog
export function useBlogData() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blogsData = await BlogService.getAllBlogs({ limit: 3 });
      console.log("Blogs data received:", blogsData);
      
      if (!blogsData || !Array.isArray(blogsData) || blogsData.length === 0) {
        setError("Không có dữ liệu bài viết");
        setBlogs([]);
      } else {
        // Kiểm tra dữ liệu có đủ trường cần thiết không
        const validatedBlogs = blogsData.filter(blog => blog && blog.id);
        
        setBlogs(validatedBlogs);
        
        if (validatedBlogs.length === 0) {
          setError("Không có dữ liệu bài viết hợp lệ");
        }
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Không thể tải dữ liệu bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { blogs, loading, error, refetchBlogs: fetchBlogs };
} 