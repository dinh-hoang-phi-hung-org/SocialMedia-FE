import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { GetResponse, PostResponse } from "@/shared/types/common-type/api-type";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TComment } from "@/shared/types/common-type/comment-type";
import { httpClient } from "@/shared/utils/api";
interface ICommentService {
  getComments(postUuid: string, params: PaginationParamsType): Promise<GetResponse<TComment[]>>;
  postComment(
    content: string,
    postUuid: string,
    files?: File[],
    parentUuid?: string,
  ): Promise<PostResponse<{ message: string; commentUuid: string }>>;
}

export class CommentService implements ICommentService {
  private readonly requestBuilder: IRequestBuilder;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  /**
   * Tạo một bài đăng mới với nội dung văn bản và các tệp hình ảnh/video đính kèm
   * @param content Nội dung văn bản của bài đăng
   * @param files Danh sách các tệp hình ảnh hoặc video đính kèm
   * @returns Promise chứa thông tin phản hồi từ API
   */
  public async postComment(
    content: string,
    postUuid: string,
    files?: File[],
    parentUuid?: string,
  ): Promise<PostResponse<{ message: string; commentUuid: string }>> {
    try {
      const formData = new FormData();

      formData.append("postUuid", postUuid);

      formData.append("content", content);
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      if (parentUuid) {
        formData.append("parentUuid", parentUuid);
      }

      return await httpClient.post<{ message: string; commentUuid: string }, FormData>({
        url: this.requestBuilder.buildUrl(),
        body: formData,
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  public async getComments(postUuid: string, params: PaginationParamsType): Promise<GetResponse<TComment[]>> {
    return httpClient.get<TComment[]>({
      url: this.requestBuilder.buildUrl(`${postUuid}`),
      config: { params },
    });
  }

  public static getInstance(requestBuilder: IRequestBuilder): CommentService {
    return new CommentService(requestBuilder);
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("comments");
export const commentService = CommentService.getInstance(requestBuilder);
