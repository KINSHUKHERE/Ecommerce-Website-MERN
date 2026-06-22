import api from "./api";

export const getContact = () => {
  return api.get("/get-contactdetails");
};

export const postContact = (data) => {
  return api.post("/post-contactdetails", data);
};
