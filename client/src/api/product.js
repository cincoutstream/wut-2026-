import request from "../utils/request";

export const getProducts = (params) => request.get("/products", { params });
export const getProductDetail = (id) => request.get(`/products/${id}`);
export const createProduct = (data) => request.post("/products", data);
export const updateProduct = (id, data) => request.put(`/products/${id}`, data);
export const getMyProducts = () => request.get("/my/products");
export const offShelfProduct = (id) => request.put(`/products/${id}/off-shelf`);
