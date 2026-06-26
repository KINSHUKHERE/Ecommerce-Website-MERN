import api from "./api";

// CATEGORY APIs

export const addCategory = async (data) => {
  return await api.post("/add-category", data);
};

export const getCategories = async () => {
  return await api.get("/get-categories");
};

export const updateCategory = async (id, data) => {
  return await api.put(`/update-category/${id}`, data);
};

export const deleteCategory = async (id) => {
  return await api.delete(`/delete-category/${id}`);
};

// BRAND APIs

export const addBrand = async (data) => {
  return await api.post("/add-brand", data);
};

export const getBrands = async () => {
  return await api.get("/get-brands");
};

export const getBrandsByCategory = async (categoryId) => {
  return await api.get(`/get-brands/${categoryId}`);
};

export const updateBrand = async (id, data) => {
  return await api.put(`/update-brand/${id}`, data);
};

export const deleteBrand = async (id) => {
  return await api.delete(`/delete-brand/${id}`);
};

export const toggleCategoryStatus = async (id) => {
  return await api.put(`/toggle-category-status/${id}`);
};

export const toggleBrandStatus = async (id) => {
  return await api.put(`/toggle-brand-status/${id}`);
};