import api from "./api";

export const getAddresses = async () => {
  return await api.get("/get-addresses");
};

export const addAddress = async (data) => {
  return await api.post("/add-address", data);
};

export const updateAddress = async (addressId, data) => {
  return await api.put(`/update-address/${addressId}`, data);
};

export const deleteAddress = async (addressId) => {
  return await api.delete(`/delete-address/${addressId}`);
};
