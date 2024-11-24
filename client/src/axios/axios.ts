import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import { BASE_URLS } from "@/env/server.env";

function createAxiosInstance(baseUrlIndex: number): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: BASE_URLS[baseUrlIndex],
    withCredentials: true,
  });

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      if (error.response?.data && typeof error.response.data === "object") {
        const data = error.response.data as {
          message?: string | { message: string };
        };
        const errorMessage =
          typeof data.message === "object"
            ? data.message.message
            : (data.message ?? "An error occurred");
        return Promise.reject(new Error(errorMessage));
      } else if (error.response) {
        console.error(
          `Response error: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      } else if (error.request) {
        console.error(`Request error: ${error.request}`);
      } else {
        console.error(`Error: ${error.message}`);
      }
      return Promise.reject(error);
    },
  );

  return axiosInstance;
}

export default createAxiosInstance;
