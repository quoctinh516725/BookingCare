import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import UserService from "../../../services/UserService";

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    // Validate ID before making the API call
    if (!id || id === "undefined") {
      setError(
        "ID bài viết không hợp lệ. Vui lòng chọn một bài viết từ danh sách."
      );
      setLoading(false);
      return;
    }

    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const data = await UserService.getBlogPostById(id);
        setBlog(data);

        // Lấy danh sách các bài viết liên quan
        const posts = await UserService.getBlogPosts(3);
        // Lọc ra các bài viết khác không phải bài viết hiện tại
        const filtered = posts.filter((post) => post.id !== parseInt(id));
        setRelatedPosts(filtered);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError("Không thể tải thông tin bài viết. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id, navigate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hiển thị skeleton khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-5"></div>
          <div className="h-80 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Đã xảy ra lỗi
          </h2>
          <p className="mb-4">{error}</p>
          <Link to="/blog" className="text-blue-500  ">
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!blog) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h2>
          <Link to="/blog" className="text-blue-500  ">
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link to="/blog" className="text-blue-500   flex items-center">
          <i className="fa fa-arrow-left mr-2"></i> Quay lại danh sách bài viết
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
        {/* Hình ảnh bài viết */}
        <div className="w-full h-[400px] overflow-hidden">
          <img
            src={
              blog.image ||
              "https://via.placeholder.com/1200x600?text=Blog+Image"
            }
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Tiêu đề bài viết */}
          <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

          {/* Thông tin tác giả và ngày đăng */}
          <div className="flex items-center text-gray-600 mb-6">
            <div className="flex items-center">
              <i className="fa-regular fa-user mr-2"></i>
              <span>{blog.author || "Admin"}</span>
            </div>
            <div className="mx-4">|</div>
            <div className="flex items-center">
              <i className="fa-regular fa-calendar mr-2"></i>
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>

          {/* Nội dung bài viết */}
          <div className="prose max-w-none">
            {/* Sử dụng component markdown-to-jsx nếu có */}
            {blog.content ? (
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <>
                <p className="mb-4">
                  Chăm sóc da là một phần quan trọng trong cuộc sống hàng ngày
                  của chúng ta. Một làn da khỏe mạnh không chỉ giúp bạn trông
                  đẹp hơn mà còn phản ánh tình trạng sức khỏe tổng thể của bạn.
                </p>
                <h2 className="text-2xl font-bold my-4">
                  Tầm quan trọng của việc chăm sóc da
                </h2>
                <p className="mb-4">
                  Da là cơ quan lớn nhất của cơ thể, đóng vai trò quan trọng
                  trong việc bảo vệ cơ thể khỏi các tác nhân bên ngoài như vi
                  khuẩn, virus và các tác nhân gây hại khác. Da cũng giúp điều
                  chỉnh nhiệt độ cơ thể và tham gia vào quá trình trao đổi chất.
                  Chính vì vậy, việc chăm sóc da đúng cách là rất cần thiết để
                  duy trì sức khỏe và vẻ đẹp của làn da.
                </p>
                <p className="mb-4">
                  Một chu trình chăm sóc da cơ bản bao gồm các bước: làm sạch,
                  tẩy tế bào chết, dưỡng ẩm và chống nắng. Tùy thuộc vào loại da
                  và các vấn đề da mà bạn gặp phải, bạn có thể bổ sung thêm các
                  bước như sử dụng toner, serum hay mặt nạ.
                </p>
                <h2 className="text-2xl font-bold my-4">
                  Các lời khuyên cho một làn da khỏe mạnh
                </h2>
                <ol className="list-decimal pl-5 mb-4">
                  <li className="mb-2">
                    <strong>Uống đủ nước:</strong> Nước giúp giải độc cơ thể và
                    duy trì độ ẩm cho da.
                  </li>
                  <li className="mb-2">
                    <strong>Ăn uống lành mạnh:</strong> Một chế độ ăn giàu trái
                    cây, rau xanh và protein giúp cung cấp các dưỡng chất cần
                    thiết cho da.
                  </li>
                  <li className="mb-2">
                    <strong>Ngủ đủ giấc:</strong> Trong khi ngủ, da tự phục hồi
                    và tái tạo.
                  </li>
                  <li className="mb-2">
                    <strong>Tránh căng thẳng:</strong> Stress có thể gây ra các
                    vấn đề về da như mụn, chàm và lão hóa sớm.
                  </li>
                  <li className="mb-2">
                    <strong>Bảo vệ da khỏi ánh nắng:</strong> Sử dụng kem chống
                    nắng hàng ngày để ngăn ngừa tác hại của tia UV.
                  </li>
                </ol>
                <p className="mb-4">
                  Nhớ rằng, mỗi người có một loại da khác nhau, vì vậy không có
                  một phương pháp chăm sóc da nào phù hợp với tất cả mọi người.
                  Hãy tìm hiểu loại da của bạn và lựa chọn các sản phẩm phù hợp
                  để đạt được kết quả tốt nhất.
                </p>
                <h2 className="text-2xl font-bold my-4">Kết luận</h2>
                <p className="mb-4">
                  Chăm sóc da không chỉ là vấn đề về thẩm mỹ mà còn là một phần
                  quan trọng của việc chăm sóc sức khỏe tổng thể. Bằng cách duy
                  trì một chu trình chăm sóc da đều đặn và lành mạnh, bạn không
                  chỉ cải thiện vẻ ngoài mà còn tăng cường sức khỏe của làn da.
                </p>
              </>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chia sẻ bài viết */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Chia sẻ bài viết:</h3>
            <div className="flex space-x-4">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-500"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-900"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href={`mailto:?subject=${blog.title}&body=Xem bài viết này: ${window.location.href}`}
                className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Bài viết liên quan */}
      {relatedPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      post.image ||
                      "https://via.placeholder.com/400x200?text=Blog+Image"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="text-gray-600 text-sm mb-2">
                    <span>{formatDate(post.createdAt)}</span>
                    {post.author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.excerpt ||
                      (post.content &&
                        post.content.substring(0, 120) + "...") ||
                      ""}
                  </p>
                  <Link
                    to={`/blog/${post.id}`}
                    className="text-[var(--primary-color)] font-semibold  "
                  >
                    Đọc tiếp
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogDetail;
