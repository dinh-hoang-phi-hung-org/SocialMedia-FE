import { PostResponse, GetListResponse, GetResponse, DeleteResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { httpClient } from "@/shared/utils/api";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TUser } from "@/shared/types/common-type/user-type";

interface IFollowService {
  getFollowers(userUuid: string, params: PaginationParamsType): Promise<GetResponse<GetListResponse<TUser>>>;
  getFollowing(userUuid: string, params: PaginationParamsType): Promise<GetResponse<GetListResponse<TUser>>>;
  followUser(userUuid: string): Promise<PostResponse<{ message: string }>>;
  unfollowUser(userUuid: string): Promise<DeleteResponse<{ message: string }>>;
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

  followUser(userUuid: string): Promise<PostResponse<{ message: string }>> {
    return httpClient.post<{ message: string }, null>({
      url: this.requestBuilder.buildUrl(`?followingUuid=${userUuid}`),
      body: null,
    });
  }

  unfollowUser(userUuid: string): Promise<DeleteResponse<{ message: string }>> {
    return httpClient.delete<{ message: string }>({
      url: this.requestBuilder.buildUrl(`?followingUuid=${userUuid}`),
    });
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
