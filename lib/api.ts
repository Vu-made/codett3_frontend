import axios from "axios";
import { toast } from "sonner";
import { EventEmitter } from "events";

export const apiEvents = new EventEmitter();

const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];
let activeRequests = 0;

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

function handleRefreshFailure(error: unknown) {
  refreshSubscribers = [];
  isRefreshing = false;
  toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", {
    position: "top-center",
    duration: 1000,
  });
  return Promise.reject(error);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  activeRequests++;
  apiEvents.emit("loading", true);
  return config;
});

api.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests <= 0) apiEvents.emit("loading", false);
    return response;
  },
  async (error) => {
    activeRequests--;
    if (activeRequests <= 0) apiEvents.emit("loading", false);
    const originalRequest = error.config;
    if (!error.response) {
      toast.error("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", {
        position: "top-center",
        duration: 1000,
      });
      return Promise.reject(error);
    }
    if (originalRequest.url.includes("/auth/refresh")) {
      return handleRefreshFailure(error);
    }
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
          isRefreshing = false;
          onRefreshed();
          return api(originalRequest);
        } catch (refreshError) {
          return handleRefreshFailure(refreshError);
        }
      }
      return new Promise((resolve) => {
        refreshSubscribers.push(() => resolve(api(originalRequest)));
      });
    }
    const detail = error.response.data?.detail;
    if (typeof detail === "string") {
      toast.error(detail, {
        position: "top-center",
        duration: 1000,
      });
    } else if (detail?.message) {
      toast.error(detail.message, {
        position: "top-center",
        duration: 1000,
      });
    } else if (error.response.status >= 500) {
      toast.error("Lỗi hệ thống. Vui lòng thử lại sau.", {
        position: "top-center",
        duration: 1000,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
