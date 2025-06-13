import { httpClient } from "@/shared/utils/api";
import { RequestBuilder } from "@/shared/utils/api/request-builder";
import { GetResponse, PostResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder } from "@/shared/utils/api/request-builder";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TConversation } from "@/shared/types/common-type/conversation-type";
import { THistoryMessage } from "@/shared/types/common-type/message-type";

interface IMessageService {
  getConversations(params: PaginationParamsType): Promise<GetResponse<TConversation[]>>;
  createGroup(formData: FormData): Promise<PostResponse<{ conversationUuid: string; message: string }>>;
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
    conversationUuid: string | undefined,
    receiverUuid: string | undefined,
    params: PaginationParamsType,
  ): Promise<GetResponse<THistoryMessage[]>> {
    const queryParams = new URLSearchParams();

    if (conversationUuid) {
      queryParams.append("conversationUuid", conversationUuid);
    }
    if (receiverUuid) {
      queryParams.append("receiverUuid", receiverUuid);
    }

    return httpClient.get<THistoryMessage[]>({
      url: this.requestBuilder.buildUrl(`conversation?${queryParams.toString()}`),
      config: { params },
    });
  }

  public async sendMessage(
    conversationUuid: string | undefined,
    receiverUuid: string,
    content: string,
    type: string | undefined,
    files?: File[],
  ): Promise<PostResponse<{ message: string }>> {
    try {
      const formData = new FormData();

      if (conversationUuid) {
        formData.append("conversationUuid", conversationUuid);
      }
      if (type) {
        formData.append("type", type);
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

  public async createGroup(formData: FormData): Promise<PostResponse<{ conversationUuid: string; message: string }>> {
    try {
      return await httpClient.post<{ conversationUuid: string; message: string }, FormData>({
        url: this.requestBuilder.buildUrl("conversation/create"),
        body: formData,
      });
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  public async markMessageAsSeen(messageUuid: string): Promise<PostResponse<{ message: string }>> {
    return await httpClient.post<{ message: string }, { messageUuid: string }>({
      url: this.requestBuilder.buildUrl(`conversation/seen?messageUuid=${messageUuid}`),
      body: { messageUuid },
    });
  }

  public async addMembersToGroup(
    conversationUuid: string,
    participantUuids: string[],
  ): Promise<PostResponse<{ message: string }>> {
    return await httpClient.post<{ message: string }, { conversationUuid: string; participantUuids: string[] }>({
      url: this.requestBuilder.buildUrl(`conversation/add-members`),
      body: { conversationUuid, participantUuids },
    });
  }

  public async removeMembersFromGroup(
    conversationUuid: string,
    memberUuid: string,
  ): Promise<PostResponse<{ message: string }>> {
    return await httpClient.deleteBody<{ message: string }, { conversationUuid: string; memberUuid: string }>({
      url: this.requestBuilder.buildUrl(`conversation/remove-members`),
      body: { conversationUuid, memberUuid },
    });
  }

  public async leaveConversation(conversationUuid: string): Promise<PostResponse<{ message: string }>> {
    return await httpClient.deleteBody<{ message: string }, { conversationUuid: string }>({
      url: this.requestBuilder.buildUrl(`conversation/leave`),
      body: { conversationUuid },
    });
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("messages");
export const messageService = MessageService.getInstance(requestBuilder);
