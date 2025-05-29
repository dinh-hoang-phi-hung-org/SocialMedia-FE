import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { GetResponse, PostResponse } from "@/shared/types/common-type/api-type";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TComment } from "@/shared/types/common-type/comment-type";
import { httpClient } from "@/shared/utils/api";
interface IAIService {
  checkLevelToxicOfComment(content: string): Promise<PostResponse<{ is_toxic: boolean }>>;
}

export class AIservice implements IAIService {
  private readonly requestBuilder: IRequestBuilder;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): AIservice {
    return new AIservice(requestBuilder);
  }

  public async checkLevelToxicOfComment(content: string): Promise<PostResponse<{ is_toxic: boolean }>> {
    return await httpClient.post<{ is_toxic: boolean }, { content: string }>({
      url: this.requestBuilder.buildUrlAI("check-toxic"),
      body: { content },
    });
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("AI");
export const aiService = AIservice.getInstance(requestBuilder);
