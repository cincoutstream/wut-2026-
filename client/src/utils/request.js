import axios from "axios";
import { message } from "antd";
import { clearAuth, getToken } from "./auth";

const request = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || "请求失败，请稍后重试";
    const silentError = error?.config?.silentError;
    if (status === 401) {
      clearAuth();
      if (window.location.pathname !== "/login") {
        message.warning("登录状态已失效，请重新登录");
        window.location.href = "/login";
      }
    } else if (!silentError) {
      message.error(msg);
    }
    return Promise.reject(error);
  }
);

export default request;
