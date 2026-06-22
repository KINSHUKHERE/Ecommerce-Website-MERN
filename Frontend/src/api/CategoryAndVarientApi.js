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

// VARIANT APIs

export const addVariant = async (data) => {
  return await api.post("/add-variant", data);
};

export const getVariants = async () => {
  return await api.get("/get-variants");
};

export const getVariantsByCategory = async (categoryId) => {
  return await api.get(`/get-variants/${categoryId}`);
};

export const updateVariant = async (id, data) => {
  return await api.put(`/update-variant/${id}`, data);
};

export const deleteVariant = async (id) => {
  return await api.delete(`/delete-variant/${id}`);
};