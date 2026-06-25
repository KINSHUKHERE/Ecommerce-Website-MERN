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

export const getUserProfile = async () => {
  return await api.get("/user-profile");
};

export const updateProfile = async (data) => {
  return await api.put("/update-profile", data);
};

export const googleLogin = async (data) => {
  return await api.post("/google", data);
};

export const completeProfile = async (data) => {
  return await api.put("/complete-profile", data);
};