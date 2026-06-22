import axios from "axios";

export const createOrder = async (data) => {
  return await axios.post("http://localhost:3000/orders", data);
};

export const getAllOrders = async () => {
  return await axios.get("http://localhost:3000/orders");
};

export const getUserOrders = async (userId) => {
  return await axios.get(`http://localhost:3000/orders/user/${userId}`);
};

export const updateOrderStatus = async (orderId, status) => {
  return await axios.put(`http://localhost:3000/orders/${orderId}`, {
    orderStatus: status,
  });
};
