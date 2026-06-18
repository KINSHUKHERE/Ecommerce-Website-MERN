import axios from "axios";

export const sentToCart = async (data) => {
  return await axios.post(
    "http://localhost:3000/add-items-cart",
    data
  );
};

export const getDataCart = async (userId) => {
  return await axios.get(
    `http://localhost:3000/get-items-cart/${userId}`
  );
};

export const increaseCart = async (cartId) => {
  return await axios.put(
    `http://localhost:3000/increase-cart/${cartId}`
  );
};

export const decreaseCart = async (cartId) => {
  return await axios.put(
    `http://localhost:3000/decrease-cart/${cartId}`
  );
};

export const deleteCart = async (cartId) => {
  return await axios.delete(
    `http://localhost:3000/delete-cart/${cartId}`
  );
};