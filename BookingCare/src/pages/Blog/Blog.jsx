import React, { useState, useEffect } from "react";
import Filter from "../../components/Filter";
import CardBlog from "../../components/Card/CardBlog";
import BlogService from "../../../services/BlogService";
import Pagination from "../../components/Pagination";

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [categories, setCategories] = useState([{ name: "Tất cả" }]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6); // 6 items per page for grid layout

  // Fetch categories and blogs on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setCategoryLoading(true);

        const [categoriesData, blogsData] = await Promise.all([
          BlogService.getAllBlogCategories(),
          BlogService.getAllBlogs(),
        ]);

        if (Array.isArray(categoriesData)) {
          setCategories([{ name: "Tất cả" }, ...categoriesData]);
        }

        setBlogs(blogsData || []);
        setFilteredBlogs(blogsData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Filter blogs when category or search query changes
  useEffect(() => {
    const filterData = () => {
      let result = blogs;

      if (selectedCategory !== "Tất cả") {
        const category = categories.find(
          (cat) => cat.name === selectedCategory
        );
        if (category?.id) {
          result = result.filter((blog) => blog.categoryId === category.id);
        }
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        result = result.filter((blog) =>
          blog.title?.toLowerCase().includes(searchLower)
        );
      }

      setFilteredBlogs(result);
    };

    filterData();
  }, [selectedCategory, searchQuery, blogs, categories]);

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const categoryNames = categories.map((cat) => cat.name);

  // Pagination
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <div>
          {loading || categoryLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div>
              <Filter
                serviceType={categoryNames}
                title="Blog"
                desc="Khám phá những bài viết mới nhất về chăm sóc da và làm đẹp"
                onCategoryChange={handleFilterChange}
                selectedCategory={selectedCategory}
                onSearchChange={handleSearchChange}
                loading={loading}
              />
              {currentItems.length === 0 ? (
                <div className="text-center py-10 mb-20 text-gray-500 font-semibold">
                  <p>Không tìm thấy bài viết nào phù hợp.</p>
                </div>
              ) : (
                <div>
                  <div
                    className={`flex ${
                      currentItems.length > 2
                        ? "justify-between"
                        : "justify-start"
                    } flex-wrap my-10 gap-6`}
                  >
                    {currentItems.map((blog) => (
                      <CardBlog key={blog.id} blog={blog} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredBlogs.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Blog;
