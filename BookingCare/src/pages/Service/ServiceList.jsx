import React, { useState, useEffect } from 'react';
import ServiceService from '../../../services/ServiceService';
import CardService from '../../components/Card/CardService';
import { Link } from 'react-router-dom';

function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Danh sách các danh mục dịch vụ, có thể lấy từ API trong tương lai
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'facial', name: 'Chăm sóc da mặt' },
    { id: 'body', name: 'Chăm sóc cơ thể' },
    { id: 'nail', name: 'Chăm sóc móng' },
    { id: 'hair', name: 'Chăm sóc tóc' },
    { id: 'makeup', name: 'Trang điểm' }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Tạo tham số tìm kiếm
        const params = {};
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        
        // Gọi API sử dụng service mới
        const data = await ServiceService.getAllServices(params);
        setServices(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchTerm]);

  // Lọc dịch vụ theo tìm kiếm và danh mục
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Hiển thị skeleton khi đang tải dữ liệu
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <div key={index} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Dịch vụ của chúng tôi</h1>
        <p className="text-gray-600">Khám phá các dịch vụ chăm sóc da và làm đẹp chất lượng cao</p>
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
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div className="flex-1">
            <label htmlFor="category" className="block mb-2 font-medium">Danh mục</label>
            <select
              id="category"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
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
      
      {/* Danh sách dịch vụ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          renderSkeletons()
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <CardService key={service.id} service={service} />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <i className="fa fa-search text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy dịch vụ</h3>
            <p className="text-gray-600 mb-4">Không có dịch vụ nào phù hợp với tìm kiếm của bạn</p>
            <button 
              className="text-[var(--primary-color)] font-semibold"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
      
      {/* Đường dẫn tới đặt lịch */}
      <div className="text-center mt-12">
        <p className="text-xl mb-4">Bạn muốn đặt lịch ngay?</p>
        <Link to="/booking">
          <button className="bg-[var(--primary-color)] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[var(--primary-color-dark)] transition duration-300">
            Đặt lịch ngay
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ServiceList; 