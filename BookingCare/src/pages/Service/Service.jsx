import { useState, useEffect } from "react";
import CardService from "../../components/Card/CardService";
import Filter from "../../components/Filter";
import ServiceService from "../../../services/ServiceService";
import ServiceCategoryService from "../../../services/ServiceCategoryService";

function Service() {
  // Will be populated from API
  const [categories, setCategories] = useState([{ name: "Tất cả" }]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await ServiceCategoryService.getActiveCategories();
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Add "Tất cả" to the beginning of the categories list
          const categoriesWithAll = [{ name: "Tất cả" }, ...data];
          setCategories(categoriesWithAll);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // If categories fail to load, we still have the default "Tất cả" option
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch services based on selected category and search query
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Prepare params for API call
        const params = {};
        
        // Only add category filter if not "Tất cả"
        if (selectedCategory !== "Tất cả") {
          // Find the category ID by name
          const category = categories.find(cat => cat.name === selectedCategory);
          if (category && category.id) {
            params.category = category.id;
          }
        }
        
        // Add search query if it exists
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const data = await ServiceService.getAllServices(params);
        setServices(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchQuery, categories]);

  // Handler for category selection from Filter component
  const handleFilterChange = (category) => {
    setSelectedCategory(category);
  };

  // Handler for search input from Filter component
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Extract category names for the Filter component
  const categoryNames = categories.map(category => category.name);

  return (
    <div className="flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <div className="">
          <Filter
            serviceType={categoryNames}
            title="Dịch Vụ Của Chúng Tôi"
            desc="Khám phá các dịch vụ chăm sóc da chuyên nghiệp được thiết kế riêng cho làn da của bạn"
            onCategoryChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            loading={categoryLoading}
          />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:bg-[var(--primary-color-dark)]"
              >
                Thử lại
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-10">
              <p>Không tìm thấy dịch vụ nào phù hợp.</p>
            </div>
          ) : (
            <div className="flex justify-between flex-wrap my-10 gap-6">
              {services.map((service) => (
                <CardService key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Service;
