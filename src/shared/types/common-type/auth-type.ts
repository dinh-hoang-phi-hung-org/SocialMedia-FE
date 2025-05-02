import { ValidatorResult } from "@/shared/types/common-type/shared-types";
import { TUser } from "@/shared/types/common-type/user-type";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginFormType {
  setToRegister: (toRegister: boolean) => void;
}

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: Partial<TUser>;
};

export interface ApiResponse {
  message: string;
  statusCode: number;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  phoneNumber?: string;
  // Add other fields that your backend returns
}

export interface ApiError {
  message?: string;
  code?: string;
  status?: number;
}

export interface RegisterFormErrors {
  username?: ValidatorResult;
  email?: ValidatorResult;
  password?: ValidatorResult;
  confirmPassword?: ValidatorResult;
  phoneNumber?: ValidatorResult;
}

export interface JwtPayload {
  sub: string;
  sessionId?: string;
  iat: number;
  exp: number;
}

export interface RefreshResponse {
  payload: {
    accessToken: string;
    refreshToken?: string;
    tokenExpires: number;
  };
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
  tokenExpires: number;
};

export interface RegisterFormValues extends RegisterFormData {
  confirmPassword: string;
}
