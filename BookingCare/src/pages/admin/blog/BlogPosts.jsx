import React, { useState, useEffect, useContext, useRef } from "react";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";
import BlogService from "../../../../services/BlogService";
import { useSelector } from "react-redux";
import Modal from "react-modal";

// Modal styles
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "90%",
    maxHeight: "90%",
    overflow: "hidden",
    borderRadius: "8px",
    padding: "20px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const BlogPosts = () => {
  // Context for showing messages/notifications
  const message = useContext(MessageContext);

  // Lấy thông tin người dùng từ Redux store
  const user = useSelector((state) => state.user);

  // State for blog posts data
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload state
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
    status: "ACTIVE",
    thumbnailUrl: "",
  });

  // Fetch blog posts on component mount
  useEffect(() => {
    fetchBlogPosts();
    fetchCategories();
  }, []);

  // Function to fetch blog posts
  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getAllBlogs();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      message.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch blog categories
  const fetchCategories = async () => {
    try {
      const data = await BlogService.getBlogCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      message.error("Không thể tải danh mục bài viết");
    }
  };

  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle thumbnail file upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleThumbnailFile(file);
    }
  };

  // Handle thumbnail file processing
  const handleThumbnailFile = (file) => {
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag over event for thumbnail
  const handleThumbnailDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  // Handle drag leave event for thumbnail
  const handleThumbnailDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  // Handle drop event for thumbnail
  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleThumbnailFile(e.dataTransfer.files[0]);
    }
  };

  // Open modal for adding new blog
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      categoryId: "",
      status: "ACTIVE",
      thumbnailUrl: "",
    });
    setThumbnail(null);
    setThumbnailPreview("");
    setIsModalOpen(true);
  };

  // Open modal for editing blog
  const openEditModal = (blog) => {
    setIsEditing(true);
    setCurrentBlog(blog);
    setFormData({
      title: blog.title || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      categoryId: blog.categoryId || "",
      status: blog.status || "ACTIVE",
      thumbnailUrl: blog.thumbnailUrl || "",
    });
    setThumbnailPreview(blog.thumbnailUrl || "");
    setIsModalOpen(true);
  };

  // Open modal for viewing blog details
  const openViewModal = (blog) => {
    setCurrentBlog(blog);
    setIsViewModalOpen(true);
  };

  // Open confirmation modal for deleting blog
  const openDeleteModal = (blog) => {
    setCurrentBlog(blog);
    setIsDeleteModalOpen(true);
  };

  // Close modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    // Reset form data
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      categoryId: "",
      status: "ACTIVE",
      thumbnailUrl: "",
    });
    setThumbnail(null);
    setThumbnailPreview("");
    setCurrentBlog(null);
  };

  // Handle form submission for creating/updating blog
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title || !formData.content) {
      message.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    if (!formData.categoryId) {
      message.error("Vui lòng chọn danh mục");
      return;
    }

    try {
      setIsSubmitting(true);

      // Handle thumbnail upload if exists
      let thumbnailUrl = formData.thumbnailUrl;
      if (thumbnail) {
        console.log("Đang tải lên ảnh đại diện...");
        try {
          thumbnailUrl = await BlogService.uploadBlogImage(thumbnail);
          console.log("Ảnh đại diện đã tải lên:", thumbnailUrl);
        } catch (uploadError) {
          console.error("Lỗi khi tải ảnh đại diện:", uploadError);
          message.error(`Lỗi khi tải ảnh đại diện: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Create final form data with thumbnail URL
      console.log("Đang tạo bài viết với user ID:", user.id);
      const finalFormData = {
        ...formData,
        thumbnailUrl,
      };

      console.log("Dữ liệu bài viết trước khi gửi:", finalFormData);

      if (isEditing && currentBlog) {
        // Update existing blog post
        await BlogService.updateBlog(currentBlog.id, finalFormData);
        message.success("Cập nhật bài viết thành công");
      } else {
        // Create new blog post
        await BlogService.createBlog(finalFormData);
        message.success("Thêm bài viết thành công");
      }

      // Close modal and refresh blog list
      closeModal();
      fetchBlogPosts();
    } catch (error) {
      console.error("Error saving blog post:", error);
      message.error(`Lỗi khi lưu bài viết: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle blog deletion
  const handleDelete = async () => {
    if (!currentBlog) return;

    try {
      setIsSubmitting(true);
      await BlogService.deleteBlog(currentBlog.id);
      message.success("Xóa bài viết thành công");
      closeModal();
      fetchBlogPosts();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      message.error(`Lỗi khi xóa bài viết: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter posts by search term
  const filteredPosts = posts.filter(
    (post) =>
      searchTerm === "" ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  /**
   * Tính thời gian đọc dựa trên số từ trong nội dung
   */
  const getReadTime = (content) => {
    if (!content) return "1 phút";
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} phút`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-start">
        <h1 className="text-xl font-bold mb-6">Quản lý bài viết</h1>
        <span
          onClick={openAddModal}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm bài viết
        </span>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hidden">
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-pink-500"></i>
              <p className="mt-2">Đang tải danh sách bài viết...</p>
            </div>
          ) : (
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
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không tìm thấy bài viết nào
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {post.thumbnailUrl ? (
                              <img
                                className="h-10 w-14 object-cover rounded"
                                src={post.thumbnailUrl}
                                alt={post.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/150?text=Image+Error";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-14 bg-gray-200 rounded flex items-center justify-center">
                                <i className="fas fa-image text-gray-400"></i>
                              </div>
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
                        <div className="text-sm text-gray-900">
                          {post.authorName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {post.categoryName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <i className="fas fa-calendar mr-1 h-4 w-4"></i>
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <i className="fas fa-clock mr-1 h-4 w-4"></i>
                          {getReadTime(post.content)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <span
                            onClick={() => openViewModal(post)}
                            className="text-cyan-500 hover:text-cyan-700 bg-cyan-100 hover:bg-cyan-200 p-1.5 rounded"
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </span>
                          <span
                            onClick={() => openEditModal(post)}
                            className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1.5 rounded"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </span>
                          <span
                            onClick={() => openDeleteModal(post)}
                            className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1.5 rounded"
                            title="Xóa"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Blog Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="p-6 max-h-[90vh] overflow-y-auto scrollbar-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {isEditing ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
            </h2>
            <span
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="block w-full pr-10 border-gray-300 rounded-md shadow-sm py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className="fas fa-heading text-gray-400"></i>
                </div>
              </div>
            </div>

            {/* Two-column layout for Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Trạng thái
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option value="ACTIVE">Đã xuất bản</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                  </select>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.status === "ACTIVE"
                    ? "Bài viết sẽ được xuất bản công khai ngay sau khi lưu."
                    : formData.status === "DRAFT"
                    ? "Bài viết sẽ được lưu dưới dạng bản nháp."
                    : "Bài viết sẽ được lưu nhưng không hiển thị."}
                </p>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700"
              >
                Tóm tắt
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={10}
                  className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Nhập tóm tắt ngắn gọn về bài viết..."
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Tóm tắt ngắn sẽ hiển thị ở trang chủ và danh sách bài viết.
              </p>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ảnh đại diện
              </label>
              <div
                className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  isDraggingOver
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-300"
                }`}
                onDragOver={handleThumbnailDragOver}
                onDragLeave={handleThumbnailDragLeave}
                onDrop={handleThumbnailDrop}
              >
                <div className="space-y-2 text-center">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="mx-auto h-60 w-full object-cover rounded"
                      />
                      <span
                        type="span"
                        onClick={() => {
                          setThumbnailPreview("");
                          setThumbnail(null);
                          setFormData({ ...formData, thumbnailUrl: "" });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                      >
                        <i className="fas fa-times"></i>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="thumbnail-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500"
                        >
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m4 0H20"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="mt-2 block">
                            Kéo và thả ảnh vào đây hoặc nhấp để tải lên
                          </span>
                          <input
                            id="thumbnail-upload"
                            name="thumbnail-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleThumbnailChange}
                            ref={fileInputRef}
                            accept="image/*"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF tối đa 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Author Information */}
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Tác giả</p>
                  <p className="text-sm text-gray-500">
                    {user.fullName} ({user.username || user.email})
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Nội dung <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={10}
                  className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Nhập nội dung bài viết..."
                  required
                />
              </div>
              {formData.content && (
                <div className="mt-1 text-sm text-gray-500">
                  Thời gian đọc: {getReadTime(formData.content)}
                </div>
              )}
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end space-x-3">
              <span
                type="span"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Hủy
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : isEditing
                  ? "Cập nhật"
                  : "Thêm bài viết"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* View Blog Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {currentBlog && (
          <div className="p-6 h-[90vh] overflow-y-auto scrollbar-hidden">
            <div className="flex justify-between items-center mb-4  pb-4">
              <h2 className="text-xl font-bold">Chi tiết bài viết</h2>
              <span
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </span>
            </div>

            <div className="space-y-6">
              {/* Thumbnail */}
              {currentBlog.thumbnailUrl && (
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={currentBlog.thumbnailUrl}
                    alt={currentBlog.title}
                    className="w-full h-72 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/800x400?text=No+Image";
                    }}
                  />
                </div>
              )}

              {/* Title and Meta Information */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {currentBlog.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <i className="fas fa-user mr-2 text-pink-500"></i>
                    <span>{currentBlog.authorName || "Không có tác giả"}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-folder mr-2 text-pink-500"></i>
                    <span>
                      {currentBlog.categoryName || "Không có danh mục"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-calendar mr-2 text-pink-500"></i>
                    <span>{formatDate(currentBlog.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock mr-2 text-pink-500"></i>
                    <span>{getReadTime(currentBlog.content)} đọc</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        currentBlog.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : currentBlog.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {currentBlog.status === "ACTIVE"
                        ? "Đã đăng"
                        : currentBlog.status === "DRAFT"
                        ? "Bản nháp"
                        : "Ẩn"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              {currentBlog.excerpt && (
                <div className="italic text-gray-600 border-l-4 border-pink-300 pl-4 py-2 bg-pink-50 rounded-r">
                  {currentBlog.excerpt}
                </div>
              )}

              {/* Content */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <i className="fas fa-file-alt mr-2 text-pink-500"></i>
                  Nội dung bài viết
                </h4>
                <div
                  className="prose max-w-none bg-white p-4 rounded-md shadow-sm border border-gray-100"
                  dangerouslySetInnerHTML={{ __html: currentBlog.content }}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <span
                  onClick={() => {
                    closeModal();
                    openEditModal(currentBlog);
                  }}
                  className="flex items-center px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color)] transition-colors cursor-pointer"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Chỉnh sửa
                </span>
                <span
                  onClick={closeModal}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <i className="fas fa-times mr-2"></i>
                  Đóng
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeModal}
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            maxWidth: "450px",
          },
        }}
      >
        {currentBlog && (
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa bài viết{" "}
                <span className="font-semibold">"{currentBlog.title}"</span>{" "}
                không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-center space-x-3 mt-6">
              <span
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </span>
              <span
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Xóa"
                )}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlogPosts;
