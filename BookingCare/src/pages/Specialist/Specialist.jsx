import { useState, useEffect } from "react";
import Filter from "../../components/Filter";
import CardSpecialist from "../../components/Card/CardSpecialist";
import SpecialistService from "../../../services/SpecialistService";

function Specialist() {
  // Will be populated from API
  const [specialties, setSpecialties] = useState([{ name: "Tất cả" }]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialtyLoading, setSpecialtyLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch specialties when component mounts
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setSpecialtyLoading(true);
        const data = await SpecialistService.getSpecialistSpecialties();

        if (data && Array.isArray(data) && data.length > 0) {
          // Add "Tất cả" to the beginning of the specialties list
          const specialtiesWithAll = [{ name: "Tất cả" }, ...data];
          setSpecialties(specialtiesWithAll);
        }
      } catch (err) {
        console.error("Error fetching specialties:", err);
        // If specialties fail to load, we still have the default "Tất cả" option
      } finally {
        setSpecialtyLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  // Fetch specialists based on selected specialty and search query
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setLoading(true);
        let data;

        if (selectedCategory === "Tất cả") {
          data = await SpecialistService.getAllSpecialists();
        } else {
          // Find the specialty object from the specialties array
          const specialty = specialties.find(
            (spec) => spec.name === selectedCategory
          );

          // If we have a specialty object with an ID, use it for the API call
          if (specialty && specialty.id) {
            data = await SpecialistService.getSpecialistsBySpecialty(
              specialty.id
            );
          } else {
            // If no specialty ID is found, fallback to using the specialty name
            data = await SpecialistService.getSpecialistsBySpecialty(
              selectedCategory
            );
          }
        }

        // If search query exists, filter the data client-side
        if (searchQuery && data && data.length > 0) {
          const searchLower = searchQuery.toLowerCase();
          data = data.filter(
            (specialist) =>
              specialist.firstName?.toLowerCase().includes(searchLower) ||
              specialist.lastName?.toLowerCase().includes(searchLower) ||
              specialist.description?.toLowerCase().includes(searchLower)
          );
        }

        setSpecialists(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching specialists:", err);
        setError("Không thể tải danh sách chuyên viên. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, [selectedCategory, searchQuery, specialties]);

  // Handler for category selection from Filter component
  const handleFilterChange = (category) => {
    setSelectedCategory(category);
  };

  // Handler for search input from Filter component
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Extract specialty names for the Filter component
  const specialtyNames = specialties.map((specialty) => specialty.name);

  return (
    <div className="flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <div className="">
          {loading || specialtyLoading ? (
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
          ) : (
            <div>
              <Filter
                serviceType={specialtyNames}
                title="Đội Ngũ Chuyên Viên"
                desc="Gặp gỡ đội ngũ chuyên viên giàu kinh nghiệm của chúng tôi, những người sẽ chăm sóc làn da của bạn"
                onCategoryChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                loading={specialtyLoading}
              />
              {specialists.length === 0 ? (
                <div className="text-center py-10 mb-20 text-gray-500 font-semibold">
                  <p>Không tìm thấy chuyên viên nào phù hợp.</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between flex-wrap my-10 gap-6">
                    {specialists.map((specialist) => (
                      <CardSpecialist
                        key={specialist.id}
                        specialist={specialist}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Specialist;
