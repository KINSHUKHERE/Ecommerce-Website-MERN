import api from "./api";

export const getProduct = (vendorId, isAdminPanel = false, ids = null) => {
  let url = "/get-product-data";
  const params = [];
  if (vendorId) params.push(`vendorId=${vendorId}`);
  if (isAdminPanel) params.push(`isAdminPanel=true`);
  if (ids) params.push(`ids=${ids}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return api.get(url);
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

export const bulkActionProducts = (data) => {
  return api.patch("/product-bulk-action", data);
};
