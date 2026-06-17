import axios from "axios";

export const getContact = () => {
  return axios.get("http://localhost:3000/get-contactdetails");
};

export const postContact = (data) => {
  return axios.post("http://localhost:3000/post-contactdetails", data);
};
