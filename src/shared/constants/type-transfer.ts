import { LoginRequest, RegisterFormData } from "@/shared/types/common-type/auth-type";
import { TransferType, TypeTransferEntry } from "../types/common-type/shared-types";
import { autherizeService } from "@/app/auth/_services/auth-services";
import { postService } from "@/app/_post/_services/post-services";
import { messageService } from "@/app/message/_services/message-services";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { userService } from "@/app/_user/_services/user-services";
import { followService } from "@/app/_follow/_services/follow-services";

const createAuthTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      login: (loginRequest: LoginRequest) => entry.repository.login(loginRequest),
      register: (data: RegisterFormData) => entry.repository.register(data),
      refreshToken: (refreshToken: string) => entry.repository.refreshToken(refreshToken),
      getCurrentUser: () => entry.repository.getCurrentUser(),
      logout: () => entry.repository.logout(),
      verifyEmail: (token: string) => entry.repository.verifyEmail(token),
    },
  };
};

const createPostTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      createPost: (content: string, files?: File[]) => entry.repository.createPost(content, files),
      getPosts: (userUuid: string, params: PaginationParamsType) => entry.repository.getPosts(userUuid, params),
    },
  };
};

const createMessageTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getConversations: (params: PaginationParamsType) => entry.repository.getConversations(params),
      getMessages: (receiverUuid: string, params: PaginationParamsType) =>
        entry.repository.getMessages(receiverUuid, params),
      sendMessage: (conversationUuid: string, receiverUuid: string, content: string, files?: File[]) =>
        entry.repository.sendMessage(conversationUuid, receiverUuid, content, files),
    },
  };
};

const createUserTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getMe: () => entry.repository.getMe(),
      getUserByUuid: (uuid: string) => entry.repository.getUserByUuid(uuid),
    },
  };
};

const createFollowTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getFollowers: (userUuid: string, params: PaginationParamsType) => entry.repository.getFollowers(userUuid, params),
      getFollowing: (userUuid: string, params: PaginationParamsType) => entry.repository.getFollowing(userUuid, params),
    },
  };
};
export const TypeTransfer: Record<string, TransferType> = {
  Auth: createAuthTypeTransferEntry({
    repository: autherizeService,
  } as TypeTransferEntry),
  Post: createPostTypeTransferEntry({
    repository: postService,
  } as TypeTransferEntry),
  Message: createMessageTypeTransferEntry({
    repository: messageService,
  } as TypeTransferEntry),
  User: createUserTypeTransferEntry({
    repository: userService,
  } as TypeTransferEntry),
  Follow: createFollowTypeTransferEntry({
    repository: followService,
  } as TypeTransferEntry),
};
