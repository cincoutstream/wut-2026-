import request from "../utils/request";

export const createReview = (transactionId, data) =>
  request.post(`/transactions/${transactionId}/reviews`, data);

export const getProductReviews = (productId) => request.get(`/products/${productId}/reviews`);

export const getUserReviews = (userId) => request.get(`/users/${userId}/reviews`);

export const updateReview = (reviewId, data) => request.put(`/reviews/${reviewId}`, data);
