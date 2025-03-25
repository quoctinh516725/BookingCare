import axios from "axios";
const signUpUser = async (data) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BACKEND}/api/v1/users/auth/register`,
      data
    );
    return response.data;
  } catch (e) {
    throw e;
  }
};
const loginUser = async (data) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BACKEND}/api/v1/users/auth/login`,
      data
    );
    return response.data;
  } catch (e) {
    throw e;
  }
};
const getDetailUser = async (id, token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BACKEND}/api/v1/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (e) {
    throw e;
  }
};
export default { signUpUser, loginUser, getDetailUser };
