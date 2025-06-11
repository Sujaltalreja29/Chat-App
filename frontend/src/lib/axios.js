import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "https://chat-app-g6hy.onrender.com" : "https://chat-app-g6hy.onrender.com",
  withCredentials: true,
});
