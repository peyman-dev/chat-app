import axios from "axios";

const baseURL = process.env.BASE_URL?.trim() || "http://192.168.200.27:8000/api/v1";

export const request = axios.create({
  baseURL,
  proxy: false,
});

request.interceptors.request.use(
  (config) => config,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error("[Axios Request Error]", {
        method: error.config?.method,
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.error("[Axios Request Error]", error);
    }

    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error("[Axios Response Error]", {
        method: error.config?.method,
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    } else {
      console.error("[Axios Response Error]", error);
    }

    return Promise.reject(error);
  },
);
