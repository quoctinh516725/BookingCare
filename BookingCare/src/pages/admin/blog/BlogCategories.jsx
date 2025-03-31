import React from "react";

const BlogCategories = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh mục bài viết</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Thêm danh mục
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {/* Blog categories content will go here */}
      </div>
    </div>
  );
};

export default BlogCategories;
