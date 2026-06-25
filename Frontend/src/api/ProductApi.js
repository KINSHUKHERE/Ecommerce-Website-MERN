import api from "./api";

export const getProduct = () => {
  return api.get("/get-product-data");
};

export const postProduct = (data) => {
  return api.post("/product-data-send", data);
};

export const deleteProduct = (id) => {
  return api.delete(`/product-delete/${id}`);
};

export const updateProduct = (id, data) => {
  return api.patch(`/product-update/${id}`, data);
};

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
