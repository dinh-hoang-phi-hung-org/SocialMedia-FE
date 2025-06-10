import { httpClient } from "@/shared/utils/api";
import { RequestBuilder } from "@/shared/utils/api/request-builder";
import { GetResponse, PostResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder } from "@/shared/utils/api/request-builder";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TConversation } from "@/shared/types/common-type/conversation-type";
import { THistoryMessage } from "@/shared/types/common-type/message-type";

interface IMessageService {
  getConversations(params: PaginationParamsType): Promise<GetResponse<TConversation[]>>;
}

export class MessageService implements IMessageService {
  private readonly requestBuilder: IRequestBuilder;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): MessageService {
    return new MessageService(requestBuilder);
  }

  public async getConversations(params: PaginationParamsType): Promise<GetResponse<TConversation[]>> {
    return httpClient.get<TConversation[]>({
      url: this.requestBuilder.buildUrl("conversations"),
      config: { params },
    });
  }

  public async getMessages(
    receiverUuid: string,
    params: PaginationParamsType,
  ): Promise<GetResponse<THistoryMessage[]>> {
    return httpClient.get<THistoryMessage[]>({
      url: this.requestBuilder.buildUrl(`conversation?receiverUuid=${receiverUuid}`),
      config: { params },
    });
  }

  public async sendMessage(
    conversationUuid: string | undefined,
    receiverUuid: string,
    content: string,
    files?: File[],
  ): Promise<PostResponse<{ message: string }>> {
    try {
      const formData = new FormData();

      if (conversationUuid) {
        formData.append("conversationUuid", conversationUuid);
      }
      formData.append("receiverUuid", receiverUuid);
      formData.append("content", content);
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      return await httpClient.post<{ message: string }, FormData>({
        url: this.requestBuilder.buildUrl("send"),
        body: formData,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("messages");
export const messageService = MessageService.getInstance(requestBuilder);
