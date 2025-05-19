import { GetResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { httpClient } from "@/shared/utils/api";
import { TUser } from "@/shared/types/common-type/user-type";

interface IUserService {
  getMe(): Promise<GetResponse<TUser>>;
  getUserByUuid(uuid: string): Promise<GetResponse<TUser>>;
}

export class UserService implements IUserService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: UserService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }
  public async getUserByUuid(uuid: string): Promise<GetResponse<TUser>> {
    return await httpClient.get<TUser>({
      url: this.requestBuilder.buildUrl(`${uuid}`),
    });
  }

  public static getInstance(requestBuilder: IRequestBuilder): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(requestBuilder);
    }
    return UserService.instance;
  }

  /**
   * Tạo một bài đăng mới với nội dung văn bản và các tệp hình ảnh/video đính kèm
   * @param content Nội dung văn bản của bài đăng
   * @param files Danh sách các tệp hình ảnh hoặc video đính kèm
   * @returns Promise chứa thông tin phản hồi từ API
   */
  public async getMe(): Promise<GetResponse<TUser>> {
    return await httpClient.get<TUser>({
      url: this.requestBuilder.buildUrl("me"),
    });
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("users");
export const userService = UserService.getInstance(requestBuilder);
