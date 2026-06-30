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