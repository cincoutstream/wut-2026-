import request from "../utils/request";

export const createTransaction = (productId, data) =>
  request.post(`/products/${productId}/transactions`, data);
export const getBuyTransactions = () => request.get("/my/buy-transactions");
export const getSellTransactions = () => request.get("/my/sell-transactions");
export const acceptTransaction = (id) => request.put(`/transactions/${id}/accept`);
export const rejectTransaction = (id) => request.put(`/transactions/${id}/reject`);
export const completeTransaction = (id) => request.put(`/transactions/${id}/complete`);
