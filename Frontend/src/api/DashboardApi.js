import api from "./api";

export const getDashboardData = async (user, range = "all") => {
  const response = await api.get(`/dashboard/stats?range=${range}`);
  return response.data;
};
