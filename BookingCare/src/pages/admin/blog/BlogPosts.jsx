import React from "react";

const BlogPosts = () => {
  // Mock blog post data
  const posts = [
    {
      id: 1,
      title: "Bí quyết chăm sóc da mùa hanh khô",
      author: "Bác sĩ Nguyễn Thị A",
      category: "Chăm sóc da",
      publishDate: "15/11/2023",
      readTime: "5 phút",
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPqva1dbvJkauVbZA2IVVgi1GNRt-DSw8o8Q&s",
    },
    {
      id: 2,
      title: "Top 5 liệu trình chống lão hóa hiệu quả nhất",
      author: "Chuyên gia Trần Văn B",
      category: "Trẻ hóa da",
      publishDate: "20/10/2023",
      readTime: "7 phút",
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPqva1dbvJkauVbZA2IVVgi1GNRt-DSw8o8Q&s",
    },
    {
      id: 3,
      title: "Cách trị mụn hiệu quả tại nhà",
      author: "Dược sĩ Phạm Thị C",
      category: "Trị mụn",
      publishDate: "05/09/2023",
      readTime: "6 phút",
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPqva1dbvJkauVbZA2IVVgi1GNRt-DSw8o8Q&s",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bài viết</h1>
          <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Thêm bài viết
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5 ">
            <h2 className="text-lg font-medium text-gray-800">
              Danh sách bài viết
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý tất cả các bài viết trên blog
            </p>
          </div>

          <div className="p-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Tìm kiếm theo tiêu đề..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tiêu đề
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tác giả
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Danh mục
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ngày đăng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thời gian đọc
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
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {post.thumbnail ? (
                            <img
                              className="h-10 w-14 object-cover rounded"
                              src={post.thumbnail}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-14 bg-gray-200 rounded"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{post.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {post.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-calendar mr-1 h-4 w-4"></i>
                        {post.publishDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-clock mr-1 h-4 w-4"></i>
                        {post.readTime}
                      </div>
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
  );
};

export default BlogPosts;
