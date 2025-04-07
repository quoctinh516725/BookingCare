import React, { useState, useEffect } from 'react';
import UserService from '../../../services/UserService';
import CardSpecialist from '../../components/Card/CardSpecialist';
import { Link } from 'react-router-dom';

function SpecialistList() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');

  // Danh sách các chuyên môn, có thể lấy từ API trong tương lai
  const expertiseOptions = [
    { id: 'all', name: 'Tất cả' },
    { id: 'skincare', name: 'Chăm sóc da' },
    { id: 'facial', name: 'Điều trị da mặt' },
    { id: 'massage', name: 'Massage' },
    { id: 'haircare', name: 'Chăm sóc tóc' },
    { id: 'makeup', name: 'Trang điểm' }
  ];

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setLoading(true);
        const data = await UserService.getStaff();
        setSpecialists(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching specialists:', err);
        setError('Không thể tải danh sách chuyên gia. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  // Lọc chuyên gia theo tìm kiếm và chuyên môn
  const filteredSpecialists = specialists.filter(specialist => {
    const fullName = `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim().toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         specialist.expertise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialist.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = selectedExpertise === 'all' || specialist.expertise === selectedExpertise;
    
    return matchesSearch && matchesExpertise;
  });

  // Hiển thị skeleton khi đang tải dữ liệu
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <div key={index} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Đội ngũ chuyên gia</h1>
        <p className="text-gray-600">Gặp gỡ những chuyên gia chăm sóc da và làm đẹp hàng đầu của chúng tôi</p>
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
                placeholder="Tìm kiếm chuyên gia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div className="flex-1">
            <label htmlFor="expertise" className="block mb-2 font-medium">Chuyên môn</label>
            <select
              id="expertise"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
            >
              {expertiseOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
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
      
      {/* Danh sách chuyên gia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          renderSkeletons()
        ) : filteredSpecialists.length > 0 ? (
          filteredSpecialists.map((specialist) => (
            <CardSpecialist key={specialist.id} specialist={specialist} />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <i className="fa fa-user-slash text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy chuyên gia</h3>
            <p className="text-gray-600 mb-4">Không có chuyên gia nào phù hợp với tìm kiếm của bạn</p>
            <button 
              className="text-[var(--primary-color)] font-semibold"
              onClick={() => {
                setSearchTerm('');
                setSelectedExpertise('all');
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
      
      {/* Đường dẫn tới đặt lịch */}
      <div className="text-center mt-12">
        <p className="text-xl mb-4">Bạn muốn đặt lịch với chuyên gia?</p>
        <Link to="/booking">
          <button className="bg-[var(--primary-color)] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[var(--primary-color-dark)] transition duration-300">
            Đặt lịch ngay
          </button>
        </Link>
      </div>
    </div>
  );
}

export default SpecialistList; 