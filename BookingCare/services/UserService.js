import axios from "axios";
import Cookies from "js-cookie";

// Cấu hình mặc định cho axios
axios.defaults.withCredentials = true;
const axiosJWT = axios.create({
  withCredentials: true,
});

const signUpUser = async (data) => {
  try {
    const response = await axios.post(`/api/v1/auth/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (e) {
    throw e;
  }
};

const loginUser = async (data) => {
  try {
    const response = await axios.post(`/api/v1/auth/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (e) {
    throw e;
  }
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

    // The API expects an empty body because it reads from cookies
    const requestBody = {};

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
    console.log("Token refreshed successfully:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error refreshing token:", e);
    throw e;
  }
};

const logoutUser = async () => {
  try {
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
  } catch (e) {
    throw e;
  }
};

const bookingUser = async (data) => {
  try {
    const response = await axios.post(`/api/v1/users/booking`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (e) {
    throw e;
  }
};

export default {
  signUpUser,
  loginUser,
  getDetailUser,
  bookingUser,
  refreshToken,
  logoutUser,
  axiosJWT,
};
