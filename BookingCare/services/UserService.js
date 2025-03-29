import axios from "axios";
import Cookies from "js-cookie";

// Cấu hình mặc định cho axios
axios.defaults.withCredentials = true;
const axiosJWT = axios.create({
  withCredentials: true,
});

const signUpUser = async (data) => {
  const response = await axios.post(`/api/v1/auth/register`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

const loginUser = async (data) => {
  const response = await axios.post(`/api/v1/auth/login`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

const getDetailUser = async (id, token) => {
  try {
    const response = await axiosJWT.get(`/api/v1/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    return response.data;
  } catch (e) {
    console.log("Error in getDetailUser:", e);
    throw e;
  }
};

const updateUserInfo = async (id, data, token) => {
  try {
    console.log("Updating user info with data:", data);
    const response = await axiosJWT.put(`/api/v1/users/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    console.log("Update user response:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error in updateUserInfo:", e);
    throw e;
  }
};

const changePassword = async (id, data, token) => {
  try {
    const response = await axiosJWT.post(`/api/v1/users/${id}/change-password`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (e) {
    console.log("Error in changePassword:", e);
    throw e;
  }
};

const refreshToken = async () => {
  try {
    console.log("Refreshing token...");

    // Try to get the refresh token from cookies
    let refreshTokenValue = null;
    try {
      refreshTokenValue = Cookies.get("refresh_token");
      console.log(
        "Found refresh token in cookies:",
        refreshTokenValue ? "yes" : "no"
      );
    } catch (e) {
      console.error("Error reading cookies:", e);
    }

    const requestBody = {};
    if (!refreshTokenValue) {
      console.log("No refresh token in cookies, trying to use stored token...");
    }

    const response = await axios.post(
      `/api/v1/auth/refresh-token`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    
    if (response.data && response.data.token) {
      console.log("Token refreshed successfully");
      // Lưu token mới vào localStorage
      localStorage.setItem("access_token", JSON.stringify(response.data.token));
    } else {
      console.warn("Token refresh response didn't contain expected token");
    }
    
    return response.data;
  } catch (e) {
    console.error("Error refreshing token:", e);
    // Xử lý lỗi cụ thể
    if (e.response && e.response.status === 401) {
      console.log("Unauthorized - clearing local storage");
      localStorage.removeItem("access_token");
      // Có thể chuyển hướng về trang login ở đây nếu cần
      window.location.href = "/login";
    }
    throw e;
  }
};

const logoutUser = async () => {
  const response = await axios.post(
    `/api/v1/auth/logout`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  return response.data;
};

const bookingUser = async (data) => {
  const response = await axios.post(`/api/v1/users/booking`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

export default {
  signUpUser,
  loginUser,
  getDetailUser,
  bookingUser,
  refreshToken,
  logoutUser,
  updateUserInfo,
  changePassword,
  axiosJWT,
};
