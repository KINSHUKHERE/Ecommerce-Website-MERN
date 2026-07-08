import api from "./api";

export const getGlobalSaleConfig = () => {
  return api.get("/sale-config");
};

export const updateGlobalSaleConfig = (data) => {
  return api.post("/sale-config", data);
};
