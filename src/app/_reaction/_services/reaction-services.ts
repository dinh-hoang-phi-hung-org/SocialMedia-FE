import { PostResponse, DeleteResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { httpClient } from "@/shared/utils/api";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TUser } from "@/shared/types/common-type/user-type";
import { TReactionCreate } from "@/shared/types/common-type/reaction-type";

interface IReactionService {
  react(reaction: TReactionCreate): Promise<PostResponse<{ message: string }>>;
  unReact(reaction: TReactionCreate): Promise<DeleteResponse<{ message: string }>>;
}

export class ReactionService implements IReactionService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: ReactionService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): ReactionService {
    if (!ReactionService.instance) {
      ReactionService.instance = new ReactionService(requestBuilder);
    }
    return ReactionService.instance;
  }

  public react(reaction: TReactionCreate): Promise<PostResponse<{ message: string }>> {
    return httpClient.post<{ message: string }, TReactionCreate>({
      url: this.requestBuilder.buildUrl(),
      body: reaction,
    });
  }

  public unReact(reaction: TReactionCreate): Promise<DeleteResponse<{ message: string }>> {
    return httpClient.deleteBody<{ message: string }, TReactionCreate>({
      url: this.requestBuilder.buildUrl(),
      body: reaction,
    });
  }
}
const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("reactions");
export const reactionService = ReactionService.getInstance(requestBuilder);
