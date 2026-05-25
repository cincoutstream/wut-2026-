import request from "../utils/request";

export const getProfile = () => request.get("/user/profile");
export const updateProfile = (data) => request.put("/user/profile", data);
