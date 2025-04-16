import UserService from './UserService';
import BookingService from './BookingService';

const axiosJWT = UserService.axiosJWT;

/**
 * Get access token from localStorage
 */
const getAccessToken = () => {
    return localStorage.getItem("access_token") || null;
};

/**
 * Get user role from localStorage
 */
const getUserRole = () => {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user?.role || null;
    } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        return null;
    }
};

/**
 * Check if user has admin or staff role
 */
const hasAdminOrStaffRole = () => {
    const role = getUserRole();
    return role === 'ADMIN' || role === 'STAFF';
};

/**
 * Log API errors with context
 */
const logApiError = (functionName, error, additionalInfo = {}) => {
    console.error(`PaymentService.${functionName} Error:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        ...additionalInfo
    });

    // Return a consistent error format
    return {
        success: false,
        message: error.response?.data?.message || error.message || "Đã xảy ra lỗi",
        status: error.response?.status,
        error: error
    };
};

/**
 * Lấy thông tin thanh toán cho đặt lịch
 */
const getPaymentByBookingId = async (bookingId) => {
    try {
        // Directly make the call without requiring authorization
        // This allows anyone (even unauthenticated users) to view the QR code
        const response = await axiosJWT.get(`/api/v1/payments/booking/${bookingId}`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        // Trường hợp không tìm thấy thanh toán cho booking này
        if (error.response?.status === 404) {
            return {
                success: false,
                message: "Chưa có thông tin thanh toán cho lịch hẹn này",
                status: 404
            };
        }
        
        return logApiError("getPaymentByBookingId", error, { bookingId });
    }
};

/**
 * Lấy thông tin thanh toán theo mã thanh toán
 */
const getPaymentByCode = async (paymentCode) => {
    try {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            console.warn("PaymentService.getPaymentByCode: No access token available");
            return { success: false, message: "Bạn cần đăng nhập để xem thông tin thanh toán" };
        }

        const response = await axiosJWT.get(`/api/v1/payments/code/${paymentCode}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return logApiError("getPaymentByCode", error, { paymentCode });
    }
};

/**
 * Xác nhận thanh toán
 */
const confirmPayment = async (paymentData) => {
    try {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            console.warn("PaymentService.confirmPayment: No access token available");
            return { success: false, message: "Bạn cần đăng nhập để xác nhận thanh toán" };
        }

        // Kiểm tra dữ liệu cần thiết
        if (!paymentData.bookingId) {
            return { success: false, message: "Thiếu thông tin đặt lịch" };
        }
        
        if (!paymentData.paymentMethod) {
            return { success: false, message: "Vui lòng chọn phương thức thanh toán" };
        }

        const response = await axiosJWT.put('/api/v1/payments/confirm', paymentData, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            success: true,
            message: response.data.message || "Xác nhận thanh toán thành công",
            data: response.data.data
        };
    } catch (error) {
        return logApiError("confirmPayment", error, { paymentData });
    }
};

/**
 * Lấy tất cả các thanh toán (Admin/Staff)
 */
const getAllPayments = async () => {
    try {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            // Instead of a warning, return a more specific error for admin routes
            return { 
                success: false, 
                message: "Bạn cần đăng nhập để xem thông tin thanh toán",
                status: 401
            };
        }
        
        // Check if user has admin/staff role
        if (!hasAdminOrStaffRole()) {
            return {
                success: false,
                message: "Bạn không có quyền truy cập thông tin này",
                status: 403
            };
        }

        const response = await axiosJWT.get('/api/v1/payments', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        // Trường hợp không đủ quyền
        if (error.response?.status === 403) {
            return {
                success: false,
                message: "Bạn không có quyền truy cập thông tin này",
                status: 403
            };
        }
        
        return logApiError("getAllPayments", error);
    }
};

/**
 * Lấy thanh toán theo trạng thái (Admin/Staff)
 */
const getPaymentsByStatus = async (status) => {
    try {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            return { 
                success: false, 
                message: "Bạn cần đăng nhập để xem thông tin thanh toán",
                status: 401
            };
        }
        
        // Check if user has admin/staff role
        if (!hasAdminOrStaffRole()) {
            return {
                success: false,
                message: "Bạn không có quyền truy cập thông tin này",
                status: 403
            };
        }

        const response = await axiosJWT.get(`/api/v1/payments/status/${status}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return logApiError("getPaymentsByStatus", error, { status });
    }
};

/**
 * Tạo thanh toán mới cho đặt lịch (Admin/Staff)
 */
const createPaymentForBooking = async (bookingId) => {
    try {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            console.warn("PaymentService.createPaymentForBooking: No access token available");
            return { success: false, message: "Bạn cần đăng nhập để tạo thanh toán" };
        }

        // Kiểm tra dữ liệu đầu vào
        if (!bookingId) {
            return { success: false, message: "ID đặt lịch không hợp lệ" };
        }

        console.log(`Creating payment for booking ID: ${bookingId}`);
        const response = await axiosJWT.post(`/api/v1/payments/create/${bookingId}`, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            success: true,
            message: response.data.message || "Tạo thanh toán thành công",
            data: response.data
        };
    } catch (error) {
        // Xử lý các lỗi cụ thể
        if (error.response?.status === 400) {
            return {
                success: false,
                message: error.response.data.message || "Dữ liệu không hợp lệ để tạo thanh toán",
                status: 400
            };
        }
        
        if (error.response?.status === 403) {
            return {
                success: false,
                message: "Bạn không có quyền tạo thanh toán",
                status: 403
            };
        }
        
        if (error.response?.status === 404) {
            return {
                success: false,
                message: "Không tìm thấy lịch đặt để tạo thanh toán",
                status: 404
            };
        }
        
        if (error.response?.status === 409) {
            return {
                success: false,
                message: "Đã tồn tại thông tin thanh toán cho lịch đặt này",
                status: 409
            };
        }
        
        return logApiError("createPaymentForBooking", error, { bookingId });
    }
};

/**
 * Cập nhật trạng thái thanh toán (Admin/Staff)
 */
const updatePaymentStatus = async (paymentId, status) => {
    try {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            console.warn("PaymentService.updatePaymentStatus: No access token available");
            return { success: false, message: "Bạn cần đăng nhập để cập nhật trạng thái thanh toán" };
        }

        const response = await axiosJWT.put(`/api/v1/payments/${paymentId}/status/${status}`, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            success: true,
            message: response.data.message || "Cập nhật trạng thái thanh toán thành công",
            data: response.data.data
        };
    } catch (error) {
        return logApiError("updatePaymentStatus", error, { paymentId, status });
    }
};

/**
 * Hoàn tiền thanh toán (Admin)
 */
const refundPayment = async (paymentId) => {
    try {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            console.warn("PaymentService.refundPayment: No access token available");
            return { success: false, message: "Bạn cần đăng nhập để hoàn tiền" };
        }

        const response = await axiosJWT.put(`/api/v1/payments/${paymentId}/refund`, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return {
            success: true,
            message: response.data.message || "Hoàn tiền thành công",
            data: response.data.data
        };
    } catch (error) {
        return logApiError("refundPayment", error, { paymentId });
    }
};

/**
 * Xác thực mã thanh toán từ mã QR
 * @param {string} bookingId ID của đặt lịch
 * @param {string} verificationCode Mã xác thực từ khách hàng
 * @returns {Promise<Object>} Kết quả xác thực
 */
const verifyPaymentByCode = async (bookingId, verificationCode) => {
  console.log(`[PaymentService.verifyPaymentByCode] Đang xác thực thanh toán cho booking: ${bookingId} với mã: ${verificationCode}`);
  
  if (!bookingId) {
    console.error('[PaymentService.verifyPaymentByCode] Thiếu ID đặt lịch');
    return {
      success: false,
      message: 'Thiếu thông tin đặt lịch',
      status: 400
    };
  }
  
  if (!verificationCode || verificationCode.trim().length < 4) {
    console.error('[PaymentService.verifyPaymentByCode] Mã xác thực không hợp lệ');
    return {
      success: false,
      message: 'Mã xác thực không hợp lệ',
      status: 400
    };
  }
  
  // Chuẩn hóa mã xác thực nhập vào
  const normalizedVerificationCode = verificationCode.trim().toUpperCase();
  
  // Lấy thông tin thanh toán từ server
  try {
    // Bước 1: Lấy thông tin thanh toán
    const paymentResponse = await getPaymentByBookingId(bookingId);
    
    // Kiểm tra xem đã có thanh toán cho booking này chưa
    if (!paymentResponse.success || !paymentResponse.data) {
      console.error('[PaymentService.verifyPaymentByCode] Không tìm thấy thông tin thanh toán');
      return {
        success: false,
        message: 'Không tìm thấy thông tin thanh toán cho lịch hẹn này',
        status: 404
      };
    }
    
    // Kiểm tra trạng thái thanh toán
    if (paymentResponse.data.status === 'COMPLETED') {
      console.warn('[PaymentService.verifyPaymentByCode] Đặt lịch này đã được thanh toán');
      return {
        success: false,
        message: 'Lịch hẹn này đã được thanh toán rồi',
        status: 400
      };
    }
    
    // Lấy dữ liệu QR từ thanh toán
    let qrData;
    try {
      qrData = JSON.parse(paymentResponse.data.qrData || '{}');
    } catch (e) {
      console.error('[PaymentService.verifyPaymentByCode] Lỗi phân tích dữ liệu QR', e);
      qrData = {};
    }
    
    // Lấy mã xác thực từ dữ liệu QR (hỗ trợ cả tên cũ và tên mới)
    let storedVerificationCode = qrData.maXacThuc || qrData.verificationCode;
    
    // Không tìm thấy mã xác thực trong dữ liệu QR
    if (!storedVerificationCode) {
      console.warn('[PaymentService.verifyPaymentByCode] Không tìm thấy mã xác thực trong dữ liệu QR, kiểm tra localStorage');
      
      // Thử kiểm tra mã xác thực từ localStorage
      const localStorageCode = localStorage.getItem(`payment_code_${bookingId}`);
      
      if (localStorageCode) {
        console.log('[PaymentService.verifyPaymentByCode] Tìm thấy mã xác thực trong localStorage');
        storedVerificationCode = localStorageCode;
      } else {
        console.error('[PaymentService.verifyPaymentByCode] Không tìm thấy mã xác thực trong localStorage');
        return {
          success: false,
          message: 'Mã xác thực không tồn tại hoặc không hợp lệ',
          status: 404
        };
      }
    }
    
    // Chuẩn hóa mã đã lưu trữ
    const normalizedStoredCode = storedVerificationCode.trim().toUpperCase();
    
    // So sánh mã xác thực
    if (normalizedStoredCode !== normalizedVerificationCode) {
      console.error(`[PaymentService.verifyPaymentByCode] Mã xác thực không khớp: ${normalizedStoredCode} != ${normalizedVerificationCode}`);
      return {
        success: false,
        message: 'Mã xác thực không chính xác',
        status: 400
      };
    }
    
    console.log('[PaymentService.verifyPaymentByCode] Mã xác thực khớp, tiến hành xác nhận thanh toán');
    
    // Bước 2: Xác nhận thanh toán
    // Chuẩn bị dữ liệu thanh toán
    const paymentConfirmationData = {
      bookingId: bookingId,
      paymentMethod: 'QR_CODE',
      transactionId: `QR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    
    // Gọi API xác nhận thanh toán
    const confirmResponse = await confirmPayment(paymentConfirmationData);
    
    if (!confirmResponse.success) {
      console.error('[PaymentService.verifyPaymentByCode] Lỗi khi xác nhận thanh toán:', confirmResponse.message);
      return {
        success: false,
        message: confirmResponse.message || 'Lỗi khi xác nhận thanh toán',
        status: confirmResponse.status || 500
      };
    }
    
    // Xóa mã xác thực khỏi localStorage sau khi xác nhận thành công
    console.log('[PaymentService.verifyPaymentByCode] Xóa mã xác thực khỏi localStorage');
    localStorage.removeItem(`payment_code_${bookingId}`);
    
    // Bước 3: Cập nhật trạng thái đặt lịch nếu cần
    try {
      // Chỉ cập nhật trạng thái nếu đặt lịch đang ở trạng thái CONFIRMED
      const bookingResponse = await BookingService.getBookingById(bookingId);
      if (bookingResponse.success && bookingResponse.data.status === 'CONFIRMED') {
        console.log('[PaymentService.verifyPaymentByCode] Cập nhật trạng thái đặt lịch thành COMPLETED');
        await BookingService.updateBookingStatus(bookingId, 'COMPLETED');
      }
    } catch (error) {
      console.warn('[PaymentService.verifyPaymentByCode] Lỗi khi cập nhật trạng thái đặt lịch:', error);
      // Không ảnh hưởng đến việc xác nhận thanh toán, chỉ ghi log
    }
    
    return {
      success: true,
      message: 'Xác nhận thanh toán thành công',
      data: confirmResponse.data
    };
  } catch (error) {
    logApiError('verifyPaymentByCode', error, { bookingId, verificationCode });
    
    // Xác định mã lỗi HTTP từ lỗi để cung cấp thông báo tốt hơn
    let errorStatus = 500;
    if (error.response) {
      errorStatus = error.response.status;
    }
    
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi xác thực mã thanh toán',
      status: errorStatus
    };
  }
};

const PaymentService = {
    getPaymentByBookingId,
    getPaymentByCode,
    confirmPayment,
    getAllPayments,
    getPaymentsByStatus,
    createPaymentForBooking,
    updatePaymentStatus,
    refundPayment,
    verifyPaymentByCode
};

export default PaymentService;