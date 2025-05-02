import { AxiosRequestConfig } from "axios";
import { ParseParams, SafeParseReturnType } from "zod";
import { PaginatedListType } from "./paginated-list-type";

export type GlobalError = {
  messages?: string[];
};

// Request Types

export type ApiRequest = {
  url: string;
  typeCheck?: (data: unknown, params?: Partial<ParseParams>) => SafeParseReturnType<unknown, unknown>;
  config?: AxiosRequestConfig;
};

export type GetRequestProps = ApiRequest;

export type DeleteRequestProps = ApiRequest;

export type PostRequestProps<T> = ApiRequest & {
  body: T;
};

export type PutRequestProps<T> = PostRequestProps<T>;

export type PatchRequestProps<T> = PostRequestProps<T>;

export type DeleteBodyRequestProps<T> = PostRequestProps<T>;

// Response Types

export type ApiSuccessResponse<T> = {
  success: true;
  payload: T;
  timestamp: number;
};

export type ApiFailureResponse = {
  success: false;
  errorType: string | string[];
  message: string;
  statusCode: number | string;
  timestamp: number;
};

export type ApiResponse<T> = ApiSuccessResponse<T>;

export type GetListResponse<T> = ApiResponse<PaginatedListType<T>>;

export type GetOneResponse<T> = ApiResponse<T>;

export type GetResponse<T> = GetOneResponse<T> | GetListResponse<T>;

export type PostResponse<T> = ApiResponse<T>;

export type PutResponse<T> = ApiResponse<T>;

export type PatchResponse<T> = ApiResponse<T>;

export type DeleteResponse<T = null> = ApiResponse<T>;
