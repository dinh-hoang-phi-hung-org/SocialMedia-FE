import { PostResponse, GetListResponse, GetResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { httpClient } from "@/shared/utils/api";
import { TPost } from "@/shared/types/common-type/post-type";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TUser } from "@/shared/types/common-type/user-type";

interface IFollowService {
  getFollowers(userUuid: string, params: PaginationParamsType): Promise<GetResponse<GetListResponse<TUser>>>;
  getFollowing(userUuid: string, params: PaginationParamsType): Promise<GetResponse<GetListResponse<TUser>>>;
  followUser(userUuid: string): Promise<PostResponse<{ message: string; postUuid: string }>>;
  unfollowUser(userUuid: string): Promise<PostResponse<{ message: string; postUuid: string }>>;
}

export class FollowService implements IFollowService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: FollowService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }
  getFollowers(userUuid: string, params: PaginationParamsType): Promise<GetResponse<GetListResponse<TUser>>> {
    return httpClient.get<GetListResponse<TUser>>({
      url: this.requestBuilder.buildUrl(`followers/${userUuid}`),
      config: {
        params,
      },
    });
  }
  getFollowing(userUuid: string, params: PaginationParamsType): Promise<GetResponse<GetListResponse<TUser>>> {
    return httpClient.get<GetListResponse<TUser>>({
      url: this.requestBuilder.buildUrl(`following/${userUuid}`),
      config: {
        params,
      },
    });
  }
  followUser(userUuid: string): Promise<PostResponse<{ message: string; postUuid: string }>> {
    throw new Error("Method not implemented.");
  }
  unfollowUser(userUuid: string): Promise<PostResponse<{ message: string; postUuid: string }>> {
    throw new Error("Method not implemented.");
  }

  public static getInstance(requestBuilder: IRequestBuilder): FollowService {
    if (!FollowService.instance) {
      FollowService.instance = new FollowService(requestBuilder);
    }
    return FollowService.instance;
  }
}
const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("follow");
export const followService = FollowService.getInstance(requestBuilder);
