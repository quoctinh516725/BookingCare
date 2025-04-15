import UserService from './UserService';

const axiosJWT = UserService.axiosJWT;

/**
 * Lấy access token từ local storage
 */
const getAccessToken = () => {
  const tokenString = localStorage.getItem("access_token");
  return tokenString ? JSON.parse(tokenString) : null;
};

/**
 * Log lỗi API với thông tin chi tiết
 */
const logApiError = (functionName, error, additionalInfo = {}) => {
  console.error(`Error in FeedbackService.${functionName}:`, error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  }
  if (Object.keys(additionalInfo).length > 0) {
    console.error('Additional info:', additionalInfo);
  }
};

/**
 * Tạo feedback mới cho một booking
 * @param {Object} feedbackData - Dữ liệu feedback
 * @param {string} feedbackData.bookingId - ID của booking cần đánh giá (UUID)
 * @param {string} feedbackData.customerId - ID của khách hàng (UUID)
 * @param {number} feedbackData.rating - Điểm đánh giá (1-5)
 * @param {string} feedbackData.comment - Nhận xét (không bắt buộc)
 * @returns {Promise<Object>} Kết quả tạo feedback
 */
const createFeedback = async (feedbackData) => {
  try {
    const token = getAccessToken();
    
    if (!feedbackData.bookingId || !feedbackData.rating) {
      return {
        success: false,
        error: "Thiếu thông tin bắt buộc: ID đặt lịch và điểm đánh giá"
      };
    }

    // Lấy customerId từ local storage nếu không được cung cấp
    if (!feedbackData.customerId) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      feedbackData.customerId = userData.id;
    }

    // Đảm bảo rating là số và nằm trong khoảng 1-5
    const rating = parseInt(feedbackData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Điểm đánh giá phải là số nguyên từ 1 đến 5"
      };
    }

    const response = await axiosJWT.post('/api/v1/feedbacks', feedbackData, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    return {
      success: true,
      data: response.data,
      message: "Đánh giá đã được gửi thành công!"
    };
  } catch (error) {
    logApiError('createFeedback', error, { feedbackData });
    
    let errorMessage = "Đã xảy ra lỗi khi gửi đánh giá.";
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data.message || "Dữ liệu đánh giá không hợp lệ.";
      } else if (error.response.status === 404) {
        errorMessage = error.response.data.message || "Không tìm thấy thông tin đặt lịch.";
      } else if (error.response.status === 403) {
        errorMessage = "Bạn không có quyền gửi đánh giá cho lịch đặt này.";
      } else if (error.response.status === 409) {
        errorMessage = "Bạn đã đánh giá lịch đặt này trước đó.";
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy thông tin feedback cho một booking
 * @param {string} bookingId - ID của booking cần xem đánh giá
 * @returns {Promise<Object>} Thông tin feedback
 */
const getFeedbackByBooking = async (bookingId) => {
  try {
    const token = getAccessToken();
    
    const response = await axiosJWT.get(`/api/v1/feedbacks/booking/${bookingId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logApiError('getFeedbackByBooking', error, { bookingId });
    
    if (error.response && error.response.status === 404) {
      return {
        success: false,
        error: "Chưa có đánh giá nào cho lịch đặt này."
      };
    }
    
    return {
      success: false,
      error: "Không thể tải thông tin đánh giá."
    };
  }
};

/**
 * Cập nhật feedback đã tồn tại
 * @param {string} feedbackId - ID của feedback cần cập nhật
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
const updateFeedback = async (feedbackId, updateData) => {
  try {
    const token = getAccessToken();
    
    // Đảm bảo rating là số và nằm trong khoảng 1-5 nếu được cung cấp
    if (updateData.rating) {
      const rating = parseInt(updateData.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return {
          success: false,
          error: "Điểm đánh giá phải là số nguyên từ 1 đến 5"
        };
      }
    }

    const response = await axiosJWT.put(`/api/v1/feedbacks/${feedbackId}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    return {
      success: true,
      data: response.data,
      message: "Đánh giá đã được cập nhật thành công!"
    };
  } catch (error) {
    logApiError('updateFeedback', error, { feedbackId, updateData });
    
    let errorMessage = "Đã xảy ra lỗi khi cập nhật đánh giá.";
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "Không tìm thấy đánh giá.";
      } else if (error.response.status === 403) {
        errorMessage = "Bạn không có quyền cập nhật đánh giá này.";
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy tất cả feedback của người dùng hiện tại
 * @returns {Promise<Object>} Danh sách feedback
 */
const getMyFeedbacks = async () => {
  try {
    const token = getAccessToken();
    
    const response = await axiosJWT.get('/api/v1/feedbacks/my-feedbacks', {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logApiError('getMyFeedbacks', error);
    
    return {
      success: false,
      error: "Không thể tải danh sách đánh giá của bạn."
    };
  }
};

/**
 * Xóa một feedback
 * @param {string} feedbackId - ID của feedback cần xóa
 * @returns {Promise<Object>} Kết quả xóa
 */
const deleteFeedback = async (feedbackId) => {
  try {
    const token = getAccessToken();
    
    await axiosJWT.delete(`/api/v1/feedbacks/${feedbackId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    return {
      success: true,
      message: "Đánh giá đã được xóa thành công!"
    };
  } catch (error) {
    logApiError('deleteFeedback', error, { feedbackId });
    
    let errorMessage = "Đã xảy ra lỗi khi xóa đánh giá.";
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "Không tìm thấy đánh giá.";
      } else if (error.response.status === 403) {
        errorMessage = "Bạn không có quyền xóa đánh giá này.";
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy tất cả feedback cho một chuyên viên
 * @param {string} specialistId - ID của chuyên viên
 * @returns {Promise<Object>} Danh sách feedback
 */
const getFeedbacksBySpecialist = async (specialistId) => {
  try {
    const token = getAccessToken();
    
    const response = await axiosJWT.get(`/api/v1/feedbacks/specialist/${specialistId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logApiError('getFeedbacksBySpecialist', error, { specialistId });
    
    return {
      success: false,
      error: "Không thể tải danh sách đánh giá cho chuyên viên này."
    };
  }
};

export default {
  createFeedback,
  getFeedbackByBooking,
  updateFeedback,
  getMyFeedbacks,
  deleteFeedback,
  getFeedbacksBySpecialist
}; 