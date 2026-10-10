import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios, { type AxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API}`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  async (response) => response,
  async (error) => {
    console.log(error);
    const originalRequest = error.config;
    if (!originalRequest) return error;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.get(`${originalRequest.baseURL}/auth/refresh`, {
          withCredentials: true,
        });
        return axiosInstance(originalRequest);
      } catch (err: any) {
        console.log(err.response);
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

export const axiosBaseQuery =
  (): BaseQueryFn<{
    url: string;
    method: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
    params?: AxiosRequestConfig["params"];
  }> =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return {
        data: result?.data,
      };
    } catch (error) {
      console.log("Axios Error: ", error);
      return { error: error };
    }
  };

export default axiosInstance;
