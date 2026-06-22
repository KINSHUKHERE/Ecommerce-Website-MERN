import api from "./api";

export const signUpApi = async (data) => {
  return await api.post("/signup", data);
};
export const login = async (data) => {
  return await api.post("/login", data);
};

export const allUsers = async () => {
  return await api.get("/all-users");
};

export const getUserProfile = async (id) => {
  return await api.get(`/user-profile/${id}`);
};

export const updateProfile = async (id, data) => {
  return await api.put(`/update-profile/${id}`, data);
};
