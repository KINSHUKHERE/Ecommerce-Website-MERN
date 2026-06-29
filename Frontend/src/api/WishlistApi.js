import api from "./api";

export const toggleWishlist = async (productId, variantId = null) => {
  return await api.post("/wishlist/toggle", { productId, variantId });
};

export const getWishlist = async () => {
  return await api.get("/wishlist");
};

export const removeFromWishlist = async (productId) => {
  return await api.delete(`/wishlist/${productId}`);
};
