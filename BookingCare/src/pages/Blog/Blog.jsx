import React, { useState, useEffect } from "react";
import Filter from "../../components/Filter";
import CardBlog from "../../components/Card/CardBlog";
import BlogService from "../../../services/BlogService";

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  
  const blogCategories = [
    "Tất cả",
    "Chăm sóc da",
    "Trẻ hóa da",
    "Trị mụn",
    "Bảo vệ da",
    "Dinh dưỡng",
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Prepare params for API call
        const params = { limit: 10, page: 1 };
        
        // Only add category filter if not "Tất cả"
        if (selectedCategory !== "Tất cả") {
          // Note: You may need to map the category name to an ID if your API expects category IDs
          params.categoryName = selectedCategory;
        }
        
        // Add search query if it exists
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const data = await BlogService.getAllBlogs(params);
        setBlogs(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory, searchQuery]);

  // Handler for category selection from Filter component
  const handleFilterChange = (category) => {
    setSelectedCategory(category);
  };

  // Handler for search input from Filter component
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <>
      <div className="flex flex-col mt-[100px]">
        <div className="container mx-auto">
          <div className="">
            <Filter
              serviceType={blogCategories}
              title="Blog làm đẹp & Chăm sóc da"
              desc="Khám phá những bài viết chuyên sâu về chăm sóc da, bí quyết làm đẹp và cách điều trị các vấn đề về da từ các chuyên gia hàng đầu"
              onCategoryChange={handleFilterChange}
              onSearchChange={handleSearchChange}
            />
            
            {loading ? (
              <div className="flex justify-center my-10">
                <p className="text-lg">Đang tải bài viết...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center my-10">
                <p className="text-red-500">{error}</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="flex justify-center my-10">
                <p className="text-lg">Không tìm thấy bài viết phù hợp</p>
              </div>
            ) : (
              <div className="flex justify-between flex-wrap my-10">
                {blogs.map((blog) => (
                  <CardBlog key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Blog;
