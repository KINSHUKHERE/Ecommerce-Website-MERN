import api from "./api";

export const createOrder = async (data) => {
  return await api.post("/orders", data);
};

export const getAllOrders = async () => {
  return await api.get("/orders");
};

export const getUserOrders = async (userId) => {
  return await api.get(`/orders/user/${userId}`);
};

export const updateOrderStatus = async (orderId, status) => {
  return await api.put(`/orders/${orderId}`, {
    orderStatus: status,
  });
};
