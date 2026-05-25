import request from "../utils/request";

export const getMessages = (productId) => request.get(`/products/${productId}/messages`);
export const createMessage = (productId, data) => request.post(`/products/${productId}/messages`, data);
export const replyMessage = (productId, messageId, data) =>
  request.post(`/products/${productId}/messages/${messageId}/replies`, data);
export const deleteMessage = (messageId) => request.delete(`/messages/${messageId}`);
