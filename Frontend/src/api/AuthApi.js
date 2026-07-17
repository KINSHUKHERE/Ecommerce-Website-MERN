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

export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return await api.post("/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const becomeSellerApi = async (data) => {
  return await api.post("/become-seller", data);
};

export const getVendorsApi = async () => {
  return await api.get("/vendors");
};

export const getPublicVendorApi = async (vendorId) => {
  return await api.get(`/vendors/public/${vendorId}`);
};

export const createVendorApi = async (data) => {
  return await api.post("/vendors", data);
};

export const updateVendorStatusApi = async (vendorId, status) => {
  return await api.put(`/vendors/${vendorId}/status`, { vendorStatus: status });
};

export const updateVendorSettingsApi = async (vendorId, minWalletBalance) => {
  return await api.put(`/vendors/${vendorId}/settings`, { minWalletBalance });
};

export const deleteVendorApi = async (vendorId) => {
  return await api.delete(`/vendors/${vendorId}`);
};

export const deleteUserApi = async (userId) => {
  return await api.delete(`/users/${userId}`);
};

export const toggleUserSuspensionApi = async (userId) => {
  return await api.put(`/users/${userId}/suspend`);
};

export const forgotPassword = async (email) => {
  return await api.post("/forgot-password", { email });
};

export const resetPassword = async (token, password) => {
  return await api.post(`/reset-password/${token}`, { password });
};