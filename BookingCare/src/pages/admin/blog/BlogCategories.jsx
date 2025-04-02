import React from "react";

const BlogCategories = () => {
  const categories = [
    {
      id: 1,
      name: "Làm đẹp",
      slug: "lam-dep",
      description: "Các bài viết về làm đẹp và chăm sóc da",
      status: "Hoạt động",
      postCount: 5,
    },
    {
      id: 2,
      name: "Sức khỏe",
      slug: "suc-khoe",
      description: "Các bài viết về sức khỏe và lối sống",
      status: "Hoạt động",
      postCount: 3,
    },
    {
      id: 3,
      name: "Trị liệu",
      slug: "tri-lieu",
      description: "Các bài viết về trị liệu và điều trị",
      status: "Hoạt động",
      postCount: 2,
    },
    {
      id: 4,
      name: "Tin tức",
      slug: "tin-tuc",
      description: "Các tin tức về ngành làm đẹp",
      status: "Hoạt động",
      postCount: 7,
    },
    {
      id: 5,
      name: "Khuyến mãi",
      slug: "khuyen-mai",
      description: "Các bài viết về chương trình khuyến mãi",
      status: "Ẩn",
      postCount: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý danh mục blog
          </h1>
          <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Thêm danh mục
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Danh sách danh mục blog
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tên danh mục
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Slug
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Mô tả
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Số bài viết
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {category.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`min-w-[75px] flex justify-center px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.status === "Hoạt động"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.postCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <span className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer">
                            <i className="fas fa-edit"></i>
                          </span>
                          <span className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer">
                            <i className="fas fa-trash-alt"></i>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCategories;
