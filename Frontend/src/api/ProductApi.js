import React from "react";
import axios from "axios";
import { useEffect } from "react";

export const getProduct = () => {
  return axios.get("http://localhost:3000/get-product-data");
};

export const postProduct = (data) => {
  return axios.post("http://localhost:3000/product-data-send", data);
};

export const deleteProduct = (id) => {
  return axios.delete(`http://localhost:3000/product-delete/${id}`);
};

export const updateProduct = (id, data) => {
  return axios.patch(`http://localhost:3000/product-update/${id}`, data);
};

// export const getSingleProduct = (id) => {
//   return axios.get(`http://localhost:3000/product/${id}`);
// };
