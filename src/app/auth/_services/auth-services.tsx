import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { httpClient } from "@/shared/utils/api";
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterFormData,
  RegisterResponse,
} from "@/shared/types/common-type/auth-type";
import { PostResponse, GetResponse } from "@/shared/types/common-type/api-type";
import { TUser } from "@/shared/types/common-type/user-type";

interface IAutherizeService {
  login(loginRequest: LoginRequest): Promise<PostResponse<LoginResponse>>;
  register(data: RegisterFormData): Promise<PostResponse<RegisterResponse>>;
  refreshToken(refreshToken: string): Promise<PostResponse<RefreshResponse>>;
  getCurrentUser(): Promise<GetResponse<TUser>>;
  verifyEmail(token: string): Promise<PostResponse<{ message: string }>>;
}

export class AutherizeService implements IAutherizeService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: AutherizeService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): AutherizeService {
    if (!AutherizeService.instance) {
      AutherizeService.instance = new AutherizeService(requestBuilder);
    }
    return AutherizeService.instance;
  }

  public async login(loginRequest: LoginRequest): Promise<PostResponse<LoginResponse>> {
    const response = await httpClient.post<LoginResponse, LoginRequest>({
      url: this.requestBuilder.buildUrl("login"),
      body: loginRequest,
    });
    const payload = response.payload as LoginResponse;
    if (payload.user && payload.user.username) {
      localStorage.setItem("currentUserName", payload.user.username as string);
    }
    return response;
  }

  public async googleLogin(code: string): Promise<PostResponse<LoginResponse>> {
    return httpClient.post<LoginResponse, { code: string }>({
      url: this.requestBuilder.buildUrl("google"),
      body: { code },
    });
  }

  public async register(data: RegisterFormData): Promise<PostResponse<RegisterResponse>> {
    return httpClient.post<RegisterResponse, RegisterFormData>({
      url: this.requestBuilder.buildUrl("signup"),
      body: data,
    });
  }

  public async refreshToken(refreshToken: string): Promise<PostResponse<RefreshResponse>> {
    const response = await httpClient.post<RefreshResponse, { refreshToken: string }>({
      url: this.requestBuilder.buildUrl("refresh-access-token"),
      body: { refreshToken },
    });
    return response;
  }

  public async getCurrentUser(): Promise<GetResponse<TUser>> {
    const response = await httpClient.get<TUser>({
      url: this.requestBuilder.buildUrl("current-user"),
    });
    return response;
  }

  public async verifyEmail(token: string): Promise<PostResponse<{ message: string }>> {
    return httpClient.post<{ message: string }, void>({
      url: this.requestBuilder.buildUrl(`confirm?token=${token}`),
      body: undefined,
    });
  }

  public async logout(): Promise<PostResponse<void>> {
    return httpClient.post<void, void>({
      url: this.requestBuilder.buildUrl("logout"),
      body: undefined,
    });
  }

  public async checkCurrentSession(): Promise<GetResponse<boolean>> {
    return httpClient.get<boolean>({
      url: this.requestBuilder.buildUrl("check-current-session"),
    });
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("auth");
export const autherizeService = AutherizeService.getInstance(requestBuilder);
