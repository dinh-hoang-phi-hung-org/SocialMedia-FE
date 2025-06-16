import { PostResponse, GetResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { httpClient } from "@/shared/utils/api";
import { TPost } from "@/shared/types/common-type/post-type";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";

interface IPostService {
  createPost(content: string, files?: File[]): Promise<PostResponse<{ message: string; postUuid: string }>>;
  getPosts(userUuid: string, params: PaginationParamsType): Promise<GetResponse<TPost[]>>;
  getPostByUuid(uuid: string): Promise<GetResponse<TPost>>;
}

export class PostService implements IPostService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: PostService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService(requestBuilder);
    }
    return PostService.instance;
  }

  /**
   * Tạo một bài đăng mới với nội dung văn bản và các tệp hình ảnh/video đính kèm
   * @param content Nội dung văn bản của bài đăng
   * @param files Danh sách các tệp hình ảnh hoặc video đính kèm
   * @returns Promise chứa thông tin phản hồi từ API
   */
  public async createPost(
    content: string,
    files?: File[],
  ): Promise<
    PostResponse<{
      message: string;
      postUuid: string;
    }>
  > {
    try {
      const formData = new FormData();

      formData.append("content", content);
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      return await httpClient.post<{ message: string; postUuid: string }, FormData>({
        url: this.requestBuilder.buildUrl(),
        body: formData,
        // QUAN TRỌNG: KHÔNG cần set Content-Type cho FormData
        // Browser sẽ tự động thiết lập multipart/form-data với boundary
        // Nếu tự đặt Content-Type, boundary sẽ bị mất
      });
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  public async getPosts(userUuid: string, params: PaginationParamsType): Promise<GetResponse<TPost[]>> {
    return await httpClient.get<TPost[]>({
      url: this.requestBuilder.buildUrl(`user/${userUuid}`),
      config: { params },
    });
  }
  public async getPostByUuid(uuid: string): Promise<GetResponse<TPost>> {
    return await httpClient.get<TPost>({
      url: this.requestBuilder.buildUrl(`${uuid}`),
    });
  }

  public async getHomeFeed(params: PaginationParamsType): Promise<GetResponse<TPost[]>> {
    return await httpClient.get<TPost[]>({
      url: this.requestBuilder.buildUrl("home"),
      config: { params },
    });
  }
}
const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("posts");
export const postService = PostService.getInstance(requestBuilder);
