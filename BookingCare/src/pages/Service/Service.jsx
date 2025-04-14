import { useState, useEffect } from "react";
import CardService from "../../components/Card/CardService";
import Filter from "../../components/Filter";
import ServiceService from "../../../services/ServiceService";
import ServiceCategoryService from "../../../services/ServiceCategoryService";

function Service() {
  const [categories, setCategories] = useState([{ name: "Tất cả" }]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and all services
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setCategoryLoading(true);

        const [categoryData, allServices] = await Promise.all([
          ServiceCategoryService.getActiveCategories(),
          ServiceService.getAllServices(),
        ]);

        if (Array.isArray(categoryData)) {
          setCategories([{ name: "Tất cả" }, ...categoryData]);
        }

        setServices(allServices || []);
        setFilteredServices(allServices || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filter services when category or searchQuery changes
  useEffect(() => {
    const filterData = async () => {
      try {
        setLoading(true);
        let result = services;

        if (selectedCategory !== "Tất cả") {
          const selected = categories.find(
            (cat) => cat.name === selectedCategory
          );
          if (selected?.id) {
            result = await ServiceService.getAllServices({
              category: selected.id,
            });
          }
        }

        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          result = result.filter((service) =>
            service.name?.toLowerCase().includes(searchLower)
          );
        }

        setFilteredServices(result);
        setError(null);
      } catch (err) {
        console.error("Error filtering services:", err);
        setError("Không thể lọc dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    filterData();
  }, [selectedCategory, searchQuery]);

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const categoryNames = categories.map((cat) => cat.name);

  return (
    <div className="flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <Filter
          serviceType={categoryNames}
          title="Dịch Vụ Của Chúng Tôi"
          desc="Khám phá các dịch vụ chăm sóc da chuyên nghiệp được thiết kế riêng cho làn da của bạn"
          onCategoryChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          loading={categoryLoading}
          selectedCategory={selectedCategory}
        />

        {loading || categoryLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded  "
            >
              Thử lại
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-semibold">
            <p>Không tìm thấy dịch vụ nào phù hợp.</p>
          </div>
        ) : (
          <div
            className={`flex ${
              filteredServices.length > 2 ? "justify-between" : "justify-start"
            } flex-wrap my-10 gap-6`}
          >
            {filteredServices.map((service) => (
              <CardService key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Service;
