import api from "./api";

export const createOrder = async (data) => {
  return await api.post("/orders", data);
};

export const getAllOrders = async () => {
  return await api.get("/orders");
};

export const getUserOrders = async () => {
  return await api.get("/orders/user");
};

export const updateOrderStatus = async (orderId, status) => {
  return await api.put(`/orders/${orderId}`, {
    orderStatus: status,
  });
};

export const cancelOrderApi = async (orderId) => {
  return await api.put(`/orders/${orderId}/cancel`);
};

export const buyAgainApi = async (orderId) => {
  return await api.post(`/orders/${orderId}/buy-again`);
};
