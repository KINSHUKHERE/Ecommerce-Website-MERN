import axios from "axios";

export const signUpApi = async (data) => {
  return await axios.post("http://localhost:3000/signup", data);
};
export const login = async (data) => {
  return await axios.post("http://localhost:3000/login", data);
};

export const allUsers = async () => {
  return await axios.get("http://localhost:3000/all-users");
};

export const getUserProfile = async (id) => {
  return await axios.get(`http://localhost:3000/user-profile/${id}`);
};

export const updateProfile = async (id, data) => {
  return await axios.put(`http://localhost:3000/update-profile/${id}`, data);
};
