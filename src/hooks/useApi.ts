import axios, { AxiosInstance } from "axios";
import { useMemo } from "react";
import { getApiEndpoint } from "../utils/api";

const useUnauthenticatedApi: () => AxiosInstance = () => {
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: `${getApiEndpoint()}`,
    });
  }, []);

  return axiosInstance;
};

const useAuthenticatedApi: () => AxiosInstance | null = () => {
  const apiKey = localStorage.getItem("apikey");

  const axiosInstance = useMemo(() => {
    return apiKey
      ? axios.create({
          baseURL: `${getApiEndpoint()}`,
          headers: {
            "Content-Type": "application/json",
            apiKey: apiKey,
          },
        })
      : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  return axiosInstance;
};

export { useUnauthenticatedApi, useAuthenticatedApi };
