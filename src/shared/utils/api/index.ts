import type {
  ApiSuccessResponse,
  DeleteBodyRequestProps,
  DeleteRequestProps,
  DeleteResponse,
  GetRequestProps,
  GetResponse,
  PatchRequestProps,
  PatchResponse,
  PostRequestProps,
  PostResponse,
  PutRequestProps,
  PutResponse,
} from "@/shared/types/common-type/api-type";
import axios, { type AxiosInstance, type AxiosRequestConfig, isAxiosError } from "axios";
import { isSafeParseError } from "@/shared/utils/validation";
import { setupInterceptorsTo } from "@/shared/utils/api/interceptor";
import { ErrorMessages } from "@/shared/utils/exception/error-message";
import { API_URL } from "@/shared/constants/auth.constant";

interface IHttpClient {
  get<T>(props: GetRequestProps): Promise<GetResponse<T>>;
  post<T, U>(props: PostRequestProps<U>): Promise<PostResponse<T>>;
  put<T, U>(props: PutRequestProps<U>): Promise<PutResponse<T>>;
  patch<T, U>(props: PatchRequestProps<U>): Promise<PatchResponse<T>>;
  delete<T>(props: DeleteRequestProps): Promise<DeleteResponse<T>>;
}

type ApiRequestProps<U> =
  | {
      method: "get";
      options: GetRequestProps;
    }
  | {
      method: "post";
      options: PostRequestProps<U>;
    }
  | {
      method: "put";
      options: PutRequestProps<U>;
    }
  | {
      method: "patch";
      options: PatchRequestProps<U>;
    }
  | {
      method: "delete";
      options: DeleteRequestProps;
    };

class HttpClient implements IHttpClient {
  private static instance: HttpClient | null = null;
  private axiosInstance: AxiosInstance;

  private constructor() {
    // Create instance with interceptors
    this.axiosInstance = setupInterceptorsTo(
      axios.create({
        baseURL: API_URL,
        withCredentials: true,
      }),
    );
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  // Reset the instance (useful for logout)
  public static resetInstance(): void {
    HttpClient.instance = null;
  }

  public get instance(): AxiosInstance {
    return this.axiosInstance;
  }

  private extractErrorMessages(error: unknown) {
    if (Array.isArray(error) && error.length > 0) {
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      return error.flatMap((error: any) => (error?.errors?.field ? error?.errors : error));
    }
    return "common:message.unknown-error";
  }

  private handleError(error: unknown) {
    if (isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData) {
        const errorMessage =
          typeof errorData.message === "string"
            ? ErrorMessages.get(errorData.message) || errorData.message
            : this.extractErrorMessages(errorData.message);
        return errorMessage || "common:message.network-error";
      } else {
        return "common:message.network-error";
      }
    }
    return "common:message.network-error";
  }

  private async request<T, U>(params: ApiRequestProps<U>): Promise<ApiSuccessResponse<T>> {
    return new Promise(async (resolve, reject) => {
      try {
        const { method, options } = params;

        const requestConfig: AxiosRequestConfig = {
          ...(options?.config || {}),
        };

        const response = await this.instance[method]<ApiSuccessResponse<T>>(
          options.url,
          method === "get" || method === "delete" ? requestConfig : options.body,
          requestConfig,
        );

        const result = response.data;

        if (options?.typeCheck) {
          const isValid = options.typeCheck(result?.payload);
          if (isSafeParseError(isValid)) {
            throw new Error(isValid?.error?.issues.map((issue) => issue.message).join("\n"));
          }
        }
        resolve(result);
      } catch (error) {
        reject(new Error(this.handleError(error)));
      }
    });
  }

  public get<T>(props: GetRequestProps): Promise<GetResponse<T>> {
    return this.request<T, unknown>({ method: "get", options: props });
  }

  public post<T, U>(props: PostRequestProps<U>): Promise<PostResponse<T>> {
    return this.request<T, U>({ method: "post", options: props });
  }

  public put<T, U>(props: PutRequestProps<U>): Promise<PutResponse<T>> {
    return this.request<T, U>({ method: "put", options: props });
  }

  public patch<T, U>(props: PatchRequestProps<U>): Promise<PatchResponse<T>> {
    return this.request<T, U>({ method: "patch", options: props });
  }

  public delete<T>(props: DeleteRequestProps): Promise<DeleteResponse<T>> {
    return this.request<T, unknown>({ method: "delete", options: props });
  }

  public deleteBody<T, U>(props: DeleteBodyRequestProps<U>): Promise<DeleteResponse<T>> {
    return this.request<T, U>({
      method: "delete",
      options: {
        ...props,
        config: {
          ...props.config,
          data: props.body,
        },
      },
    });
  }
}

// Export the singleton instance
export const httpClient = HttpClient.getInstance();

// Helper function to reset the HTTP client (useful for logout)
export const resetHttpClient = (): void => {
  HttpClient.resetInstance();
};
