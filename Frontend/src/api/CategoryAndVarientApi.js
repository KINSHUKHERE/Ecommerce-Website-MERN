import axios from "axios";

// CATEGORY APIs

export const addCategory = async (data) => {
  return await axios.post(
    "http://localhost:3000/add-category",
    data
  );
};

export const getCategories = async () => {
  return await axios.get(
    "http://localhost:3000/get-categories"
  );
};

export const updateCategory = async (id, data) => {
  return await axios.put(
    `http://localhost:3000/update-category/${id}`,
    data
  );
};

export const deleteCategory = async (id) => {
  return await axios.delete(
    `http://localhost:3000/delete-category/${id}`
  );
};

// VARIANT APIs

export const addVariant = async (data) => {
  return await axios.post(
    "http://localhost:3000/add-variant",
    data
  );
};

export const getVariants = async () => {
  return await axios.get(
    "http://localhost:3000/get-variants"
  );
};

export const getVariantsByCategory = async (categoryId) => {
  return await axios.get(
    `http://localhost:3000/get-variants/${categoryId}`
  );
};

export const updateVariant = async (id, data) => {
  return await axios.put(
    `http://localhost:3000/update-variant/${id}`,
    data
  );
};

export const deleteVariant = async (id) => {
  return await axios.delete(
    `http://localhost:3000/delete-variant/${id}`
  );
};