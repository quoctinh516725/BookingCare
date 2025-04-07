import React, { useState, useEffect } from 'react';
import UserService from '../../../services/UserService';
import CardBlog from '../../components/Card/CardBlog';
import { Link } from 'react-router-dom';

function BlogList() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  
  // Danh sách tags, có thể lấy từ API trong tương lai
  const tags = [
    { id: 'all', name: 'Tất cả' },
    { id: 'skincare', name: 'Chăm sóc da' },
    { id: 'beauty', name: 'Làm đẹp' },
    { id: 'health', name: 'Sức khỏe' },
    { id: 'tips', name: 'Mẹo hay' },
    { id: 'treatment', name: 'Phương pháp điều trị' }
  ];

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        // Lấy tất cả bài viết, cung cấp limit lớn hơn nếu có nhiều bài viết
        const data = await UserService.getBlogPosts(100);
        setBlogPosts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Lọc bài viết theo tìm kiếm và tag
  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || 
                       (post.tags && post.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  // Hiển thị skeleton khi đang tải dữ liệu
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600">Tin tức, mẹo hay và kiến thức về chăm sóc da và làm đẹp</p>
      </div>
      
      {/* Tìm kiếm và lọc */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block mb-2 font-medium">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div className="flex-1">
            <label htmlFor="tag" className="block mb-2 font-medium">Chủ đề</label>
            <select
              id="tag"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Hiển thị thông báo lỗi */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <i className="fa fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}
      
      {/* Danh sách bài viết */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          renderSkeletons()
        ) : filteredBlogPosts.length > 0 ? (
          filteredBlogPosts.map((blog) => (
            <CardBlog key={blog.id} blog={blog} />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <i className="fa fa-newspaper text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-600 mb-4">Không có bài viết nào phù hợp với tìm kiếm của bạn</p>
            <button 
              className="text-[var(--primary-color)] font-semibold"
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('all');
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
      
      {/* Phân trang - Thêm khi số lượng bài viết nhiều */}
      {filteredBlogPosts.length > 0 && (
        <div className="mt-10 flex justify-center">
          <nav className="flex items-center">
            <button className="px-4 py-2 border rounded-l-lg hover:bg-gray-100 disabled:opacity-50" disabled>
              <i className="fa fa-chevron-left"></i>
            </button>
            <button className="px-4 py-2 border-t border-b bg-[var(--primary-color)] text-white">1</button>
            <button className="px-4 py-2 border-t border-b hover:bg-gray-100">2</button>
            <button className="px-4 py-2 border-t border-b hover:bg-gray-100">3</button>
            <button className="px-4 py-2 border rounded-r-lg hover:bg-gray-100">
              <i className="fa fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      )}
      
      {/* Đăng ký nhận bản tin */}
      <div className="mt-16 bg-[var(--primary-color-light)] p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Đăng ký nhận bản tin</h2>
        <p className="mb-6 max-w-2xl mx-auto">Nhận thông tin cập nhật về các bài viết mới, mẹo hay và khuyến mãi đặc biệt từ chúng tôi.</p>
        <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="email"
            className="flex-1 p-3 border border-gray-300 rounded-lg"
            placeholder="Email của bạn"
          />
          <button className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--primary-color-dark)] transition duration-300">
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlogList; 