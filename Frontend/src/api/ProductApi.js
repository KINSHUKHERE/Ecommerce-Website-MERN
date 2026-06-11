import React from "react";
import axios from "axios";
import { useEffect } from "react";

export const getProduct = () => {
  return axios.get("http://localhost:3000/get-product-data");
};

export const postProduct = (data) => {
  return axios.post("http://localhost:3000/product-data-send", data)
};
