import axios from "axios";

export const signUpApi = async (data) => {
  return await axios.post("http://localhost:3000/signup", data);
};
export const login = async (data) => {
  return await axios.post("http://localhost:3000/login", data);
};

export const allUsers = async () => {
  return await axios.get("http://localhost:3000/all-users");
};
