import request from "../utils/request";

const silentConfig = { silentError: true };

export const getNotifications = () => request.get("/notifications", silentConfig);
export const getUnreadNotificationCount = () => request.get("/notifications/unread-count", silentConfig);
export const markNotificationRead = (id) => request.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => request.put("/notifications/read-all");
