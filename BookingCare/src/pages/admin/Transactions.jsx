import React, { useState, useEffect } from 'react';
import BookingService from '../../../services/BookingService';
import PaymentService from '../../../services/PaymentService';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import PaymentQRCode from '../../components/Payment/PaymentQRCode';

// Loader component
const Loader = () => (
  <div className="flex justify-center items-center h-full py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Component hiển thị mã QR cho admin
const AdminPaymentQRCode = ({ bookingId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Mã QR thanh toán</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <PaymentQRCode bookingId={bookingId} isProfilePage={false} />
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Quét mã QR hoặc nhập mã xác thực ở trên để xác nhận thanh toán
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
    fetchAllBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Đang lấy dữ liệu booking gần đây...");
      const response = await BookingService.getRecentBookings(20); // Lấy 20 booking gần nhất
      
      // Luôn thiết lập bookings, ngay cả khi response không thành công
      // Để đảm bảo không hiển thị lỗi cho người dùng
      setBookings(response.data || []);
      
      if (!response.success) {
        console.warn("Không thể lấy dữ liệu booking gần đây:", response.message);
        // Không hiển thị lỗi cho người dùng, chỉ ghi log
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Không hiển thị lỗi cho người dùng, chỉ ghi log
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    setBookingsLoading(true);
    
    try {
      console.log("Đang lấy tất cả dữ liệu booking...");
      const response = await BookingService.getAllBookings();
      
      // Luôn thiết lập dữ liệu, ngay cả khi response không thành công
      setAllBookings(response.data || []);
      
      if (!response.success) {
        console.warn("Không thể lấy tất cả dữ liệu booking:", response.message);
        // Không hiển thị lỗi cho người dùng, chỉ ghi log
      }
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      // Không hiển thị lỗi cho người dùng, chỉ ghi log
      setAllBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const openVerificationModal = async (bookingId) => {
    setCurrentBookingId(bookingId);
    setVerificationCode('');
    setVerificationError(null);
    setVerifyingPayment(false);
    
    // Lấy thông tin chi tiết của booking để hiển thị
    try {
      const response = await BookingService.getBookingById(bookingId);
      if (response.success) {
        setCurrentBooking(response.data);
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
    }
    
    setShowVerificationModal(true);
  };

  const openQRModal = (bookingId) => {
    setCurrentBookingId(bookingId);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setCurrentBookingId(null);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setVerifyingPayment(true);
    
    try {
      // Làm sạch mã xác thực (loại bỏ khoảng trắng và chuyển sang chữ hoa)
      const cleanCode = verificationCode.trim().toUpperCase();
      setVerificationCode(cleanCode);
      
      // Ghi log để debug
      console.log(`Đang xác thực booking ID: ${currentBookingId} với mã: ${cleanCode}`);
      
      // Gọi API để xác thực mã
      const response = await PaymentService.verifyPaymentByCode(currentBookingId, cleanCode);
      
      if (response.success) {
        toast.success("Xác thực thanh toán thành công!");
        setVerificationError(null);
        closeVerificationModal();
        
        // Đảm bảo cập nhật UI và lưu thông tin thanh toán mới
        fetchBookings();
        
        // Kiểm tra xem có toàn bộ booking không và cập nhật nếu cần
        if (showAllBookings) {
          fetchAllBookings();
        }
      } else {
        // Hiển thị thông báo lỗi cụ thể từ API
        setVerificationError(response.message || "Mã xác thực không hợp lệ");
        console.error("Lỗi xác thực:", response.message);
        
        // Kiểm tra các mã lỗi phổ biến để cung cấp thông báo hữu ích
        if (response.status === 404) {
          setVerificationError("Không tìm thấy thông tin thanh toán. Vui lòng kiểm tra lại.");
        } else if (response.status === 400) {
          setVerificationError("Mã xác thực không hợp lệ hoặc đã hết hạn.");
        } else if (response.status === 403) {
          setVerificationError("Bạn không có quyền xác thực thanh toán này.");
        }
      }
    } catch (error) {
      console.error("Lỗi khi xác thực mã:", error);
      
      // Thêm thông tin lỗi chi tiết hơn
      let errorMessage = "Không thể xác thực thanh toán";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Kiểm tra các loại lỗi cụ thể
      if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy thông tin thanh toán hoặc đặt lịch.";
      } else if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (!navigator.onLine) {
        errorMessage = "Không có kết nối internet. Vui lòng kiểm tra kết nối mạng.";
      }
      
      setVerificationError(errorMessage);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const formatDateTime = (bookingDate, startTime) => {
    if (!bookingDate) return 'N/A';
    
    const date = new Date(bookingDate);
    const formattedDate = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (!startTime) return formattedDate;
    
    return `${formattedDate} ${startTime}`;
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setCurrentBookingId(null);
    setVerificationCode('');
    setVerificationError(null);
    setCurrentBooking(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Lọc bookings dựa trên tìm kiếm và filter
  const getFilteredBookings = () => {
    let filtered = showAllBookings ? allBookings : bookings;
    
    // Lọc theo trạng thái nếu không phải "all"
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    
    // Lọc theo trạng thái thanh toán nếu không phải "all"
    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter(booking => 
        filterPaymentStatus === 'UNPAID' 
          ? (!booking.paymentStatus || booking.paymentStatus === 'UNPAID')
          : booking.paymentStatus === filterPaymentStatus
      );
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        (booking.id && booking.id.toLowerCase().includes(query)) ||
        (booking.customerName && booking.customerName.toLowerCase().includes(query)) ||
        (booking.customerPhone && booking.customerPhone.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Modal xác nhận thanh toán
  const VerificationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h3 className="text-lg font-medium">Xác nhận thanh toán</h3>
          <p className="text-sm opacity-80">Nhập mã xác thực để hoàn tất thanh toán</p>
        </div>
        
        {currentBooking && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Khách hàng:</span>
              <span className="text-sm font-semibold">{currentBooking.customerName}</span>
            </div>
            {currentBooking.customerPhone && (
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Số điện thoại:</span>
                <span className="text-sm">{currentBooking.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Ngày đặt:</span>
              <span className="text-sm">{formatDateTime(currentBooking.bookingDate, currentBooking.startTime)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-sm text-gray-600">Tổng tiền:</span>
              <span className="text-sm text-blue-600">{formatCurrency(currentBooking.totalPrice || 0)}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleVerificationSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
              Mã xác thực
            </label>
            <input
              id="verification-code"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md font-mono tracking-wider text-center uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mã xác thực"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              autoFocus
              maxLength={10}
            />
            {verificationError && (
              <p className="mt-1 text-xs text-red-500">{verificationError}</p>
            )}
          </div>
          
          <div className="mb-4 text-center">
            <button
              type="button"
              className="text-blue-600 text-sm underline hover:text-blue-800"
              onClick={() => {
                closeVerificationModal();
                openQRModal(currentBookingId);
              }}
            >
              <i className="fas fa-qrcode mr-1"></i> Xem QR code và mã xác thực
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={closeVerificationModal}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={verifyingPayment}
            >
              {verifyingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Đang xác thực...
                </>
              ) : 'Xác thực thanh toán'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const filteredBookings = getFilteredBookings();

  return (
    <div className="transactions-container p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý giao dịch</h1>
      
      {/* Tìm kiếm và bộ lọc */}
      <div className="mb-4 bg-white p-3 rounded shadow">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm theo ID, tên khách hàng hoặc số điện thoại"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          
          <div>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả TT thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="COMPLETED">Đã thanh toán</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={() => setShowAllBookings(!showAllBookings)}
              className={`px-3 py-2 rounded-md ${
                showAllBookings 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showAllBookings ? 'Xem gần đây' : 'Xem tất cả'}
            </button>
          </div>
        </div>
      </div>
      
      {isLoading || (showAllBookings && bookingsLoading) ? (
        <div className="loading-container bg-white p-10 rounded shadow flex justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="error-message bg-red-50 p-6 rounded shadow text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={fetchBookings}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="bookings-section bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-4">Danh sách lịch hẹn {showAllBookings ? '' : 'gần đây'}</h2>
          
          {filteredBookings.length === 0 ? (
            <p className="text-center py-4 text-gray-500">Không có lịch hẹn nào phù hợp</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="bookings-table w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Khách hàng</th>
                    <th className="p-2 text-left">Thời gian</th>
                    <th className="p-2 text-left">Tổng giá</th>
                    <th className="p-2 text-left">Trạng thái</th>
                    <th className="p-2 text-left">Thanh toán</th>
                    <th className="p-2 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{booking.id.substring(0, 8)}...</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{booking.customerName || 'N/A'}</div>
                          {booking.customerPhone && <div className="text-xs text-gray-500">{booking.customerPhone}</div>}
                        </div>
                      </td>
                      <td className="p-2">{formatDateTime(booking.bookingDate, booking.startTime)}</td>
                      <td className="p-2">{formatCurrency(booking.totalPrice || 0)}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          booking.paymentStatus === 'UNPAID' || !booking.paymentStatus ? 'bg-yellow-100 text-yellow-800' :
                          booking.paymentStatus === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.paymentStatus || 'UNPAID'}
                        </span>
                      </td>
                      <td className="p-2">
                        {booking.status === 'COMPLETED' && (booking.paymentStatus === 'UNPAID' || !booking.paymentStatus) && (
                          <div className="flex space-x-2">
                            <button 
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
                              onClick={() => openVerificationModal(booking.id)}
                              title="Nhập mã xác thực từ khách hàng"
                            >
                              <i className="fas fa-keyboard mr-1"></i> Xác thực
                            </button>
                            <button 
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 flex items-center"
                              onClick={() => openQRModal(booking.id)}
                              title="Xem mã QR và mã xác thực"
                            >
                              <i className="fas fa-qrcode mr-1"></i> QR
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Verification Modal */}
      {showVerificationModal && <VerificationModal />}
      
      {/* QR Code Modal */}
      {showQRModal && <AdminPaymentQRCode bookingId={currentBookingId} onClose={closeQRModal} />}
    </div>
  );
};

export default Transactions;
