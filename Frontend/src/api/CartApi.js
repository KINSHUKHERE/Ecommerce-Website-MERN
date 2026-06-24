import api from "./api";

export const sentToCart = async (data) => {
  return await api.post("/add-items-cart", data);
};

export const getDataCart = async () => {
  return await api.get("/get-items-cart");
};

export const increaseCart = async (cartId) => {
  return await api.put(`/increase-cart/${cartId}`);
};

export const decreaseCart = async (cartId) => {
  return await api.put(`/decrease-cart/${cartId}`);
};

export const deleteCart = async (cartId) => {
  return await api.delete(`/delete-cart/${cartId}`);
};