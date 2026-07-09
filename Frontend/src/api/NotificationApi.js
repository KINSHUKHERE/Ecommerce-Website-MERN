import api from "./api";

export const getNotifications = () => {
  return api.get("/notifications");
};

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put("/notifications/read-all");
};

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};
