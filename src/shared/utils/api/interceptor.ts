import type { ApiFailureResponse } from "@/shared/types/common-type/api-type";
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { authProvider } from "@/shared/utils/middleware/auth-provider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdaptAxiosRequestConfig = AxiosRequestConfig & InternalAxiosRequestConfig<any>;

// const resetAccessTokenPromise: Promise<AuthResponse> | null = null;
// const apiUsingRefresh: string[] = [];

export const onRequest = async (config: AdaptAxiosRequestConfig): Promise<AdaptAxiosRequestConfig> => {
  if (config.url?.includes("/auth/refresh")) {
    return config;
  }

  const accessToken = authProvider.getToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken || ""}`;

    try {
      await authProvider.checkAuth();

      // if (tokenInfo.exp && tokenInfo.exp < Date.now() / 1000) {
      //   try {
      //     if (apiUsingRefresh.length === 0) {
      //       resetAccessTokenPromise = authProvider.resetAccessToken();
      //       apiUsingRefresh.push(config.url!);
      //     } else {
      //       apiUsingRefresh.push(config.url!);
      //     }

      //     const response = await resetAccessTokenPromise;

      //     if (response?.token) {
      //       config.headers.Authorization = `Bearer ${response.token}`;
      //     } else if (response?.path === "/auth") {
      //       throw new Error("Auth redirect");
      //     }
      //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
      //   } catch (error) {
      //     resetAccessTokenPromise = null;
      //     apiUsingRefresh = [];

      //     await handleLogout();

      //     throw new Error("Auth redirect");
      //   } finally {
      //     if (apiUsingRefresh.includes(config.url!)) {
      //       apiUsingRefresh.splice(apiUsingRefresh.indexOf(config.url!), 1);
      //     }

      //     if (apiUsingRefresh.length === 0) {
      //       resetAccessTokenPromise = null;
      //     }
      //   }
      // }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await handleLogout();
      throw new Error("Invalid token format");
    }
  }

  return config;
};

export const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  if (error.message === "Auth redirect" || error.message === "Invalid token format") {
    return Promise.resolve({} as AxiosError);
  }
  return Promise.reject(error);
};

export const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const onResponseError = async (error: AxiosError<ApiFailureResponse>) => {
  const errorData: ApiFailureResponse | undefined = error?.response?.data;

  if (errorData && errorData.errorType === "ACCESS_TOKEN_EXPIRED") {
    // !Todo: Get new access token from refresh token
  } else if (errorData && errorData.errorType === "REFRESH_TOKEN_EXPIRED") {
    console.log(`REFRESH_TOKEN_EXPIRED`);
    // !Todo: Logout
    await handleLogout();
  } else if (errorData && errorData.message) {
    // !Todo:Notification Error
    if (Array.isArray(errorData.message) && errorData?.message?.length > 0) {
      console.log(errorData.message[0]);
    } else {
      console.log(errorData.message);
    }
  } else {
    console.log(error?.message);
  }
  return Promise.reject(error);
};

// Helper function to handle logout
const handleLogout = async () => {
  try {
    // Clear tokens
    authProvider.clearTokens();

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {}
};

export function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
}
