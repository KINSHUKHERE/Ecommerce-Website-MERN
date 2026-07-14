import api from "./api";

export const addReviewApi = (productId, rating, comment) => {
  return api.post("/reviews", { productId, rating, comment });
};

export const getProductReviewsApi = (productId) => {
  return api.get(`/reviews/product/${productId}`);
};

export const getVendorReviewsApi = (vendorId) => {
  return api.get(vendorId ? `/reviews/vendor?vendorId=${vendorId}` : "/reviews/vendor");
};
