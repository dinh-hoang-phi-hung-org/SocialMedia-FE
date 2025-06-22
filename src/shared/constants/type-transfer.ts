import { LoginRequest, RegisterFormData } from "@/shared/types/common-type/auth-type";
import { TransferType, TypeTransferEntry } from "../types/common-type/shared-types";
import { autherizeService } from "@/app/auth/_services/auth-services";
import { postService } from "@/app/post/_services/post-services";
import { messageService } from "@/app/message/_services/message-services";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { userService } from "@/app/_user/_services/user-services";
import { followService } from "@/app/_follow/_services/follow-services";
import { commentService } from "@/app/_comment/_services/comment-service";
import { TReport } from "../types/common-type/report-type";
import { reportService } from "@/app/_report/_services/report-service";
import { aiService } from "@/app/_AI/_services/AI-service";
import { TReactionCreate } from "@/shared/types/common-type/reaction-type";
import { reactionService } from "@/app/_reaction/_services/reaction-services";
import { analystService } from "@/app/_analytics/analytics-services";
import { notificationService } from "@/app/_notification/_services/notification-services";

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
      getPostByUuid: (uuid: string) => entry.repository.getPostByUuid(uuid),
      getHomeFeed: (params: PaginationParamsType) => entry.repository.getHomeFeed(params),
    },
  };
};

const createMessageTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getConversations: (params: PaginationParamsType) => entry.repository.getConversations(params),
      getMessages: (
        conversationUuid: string | undefined,
        receiverUuid: string | undefined,
        params: PaginationParamsType,
      ) => entry.repository.getMessages(conversationUuid, receiverUuid, params),
      sendMessage: (
        conversationUuid: string,
        receiverUuid: string,
        content: string,
        type: string | undefined,
        files?: File[],
      ) => entry.repository.sendMessage(conversationUuid, receiverUuid, content, type, files),
      markMessageAsSeen: (messageUuid: string) => entry.repository.markMessageAsSeen(messageUuid),
      createGroup: (formData: FormData) => entry.repository.createGroup(formData),
      addMembersToGroup: (conversationUuid: string, participantUuids: string[]) =>
        entry.repository.addMembersToGroup(conversationUuid, participantUuids),
      removeMembersFromGroup: (conversationUuid: string, participantUuid: string) =>
        entry.repository.removeMembersFromGroup(conversationUuid, participantUuid),
      leaveConversation: (conversationUuid: string) => entry.repository.leaveConversation(conversationUuid),
    },
  };
};

const createUserTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    headers: entry.headers,
    detailFields: entry.detailFields,
    repository: entry.repository,
    otherAPIs: {
      getMe: () => entry.repository.getMe(),
      getUserByUuid: (uuid: string) => entry.repository.getUserByUuid(uuid),
      getUsers: (params: PaginationParamsType) => entry.repository.getUsers(params),
      editUser: (uuid: string, data: FormData) => entry.repository.editUser(uuid, data),
    },
  };
};

const createFollowTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getFollowers: (userUuid: string, params: PaginationParamsType) => entry.repository.getFollowers(userUuid, params),
      getFollowing: (userUuid: string, params: PaginationParamsType) => entry.repository.getFollowing(userUuid, params),
      followUser: (userUuid: string) => entry.repository.followUser(userUuid),
      unfollowUser: (userUuid: string) => entry.repository.unfollowUser(userUuid),
    },
  };
};

const createCommentTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getComments: (postUuid: string, params: PaginationParamsType) => entry.repository.getComments(postUuid, params),
      postComment: (content: string, postUuid: string, files?: File[], parentUuid?: string) =>
        entry.repository.postComment(content, postUuid, files, parentUuid),
      getCommentByUuid: (commentUuid: string) => entry.repository.getCommentByUuid(commentUuid),
      getCommentsByUuidParent: (postUuid: string, parentUuid: string, params: PaginationParamsType) =>
        entry.repository.getCommentsByUuidParent(postUuid, parentUuid, params),
    },
  };
};

const createReportTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      createReport: (report: TReport) => entry.repository.createReport(report),
      getReportsByType: (params: PaginationParamsType, type: string) => entry.repository.getReportsByType(params, type),
      getReportByUuid: (type: string, reportUuid: string) => entry.repository.getReportByUuid(type, reportUuid),
      updateReport: (reportUuid: string, status: string, type: string) =>
        entry.repository.updateReport(reportUuid, status, type),
    },
  };
};

const createAITransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      checkLevelToxicOfComment: (content: string) => entry.repository.checkLevelToxicOfComment(content),
    },
  };
};

const createReactionTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      react: (reaction: TReactionCreate) => entry.repository.react(reaction),
      unReact: (reaction: TReactionCreate) => entry.repository.unReact(reaction),
    },
  };
};

const createAnalyticsTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getDashboardStats: () => entry.repository.getDashboardStats(),
      getUserRegistrations: (dateRange: { startDate: string; endDate: string; period: "day" | "week" | "month" }) =>
        entry.repository.getUserRegistrations(dateRange),
      getPostsCreation: (dateRange: { startDate: string; endDate: string; period: "day" | "week" | "month" }) =>
        entry.repository.getPostsCreation(dateRange),
      getReportsData: (dateRange: { startDate: string; endDate: string; period: "day" | "week" | "month" }) =>
        entry.repository.getReportsData(dateRange),
    },
  };
};

const createNotificationTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      getNotifications: (query: PaginationParamsType) => entry.repository.getNotifications(query),
      markAsRead: (uuid: string) => entry.repository.markAsRead(uuid),
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
  Comment: createCommentTypeTransferEntry({
    repository: commentService,
  } as TypeTransferEntry),
  Report: createReportTypeTransferEntry({
    repository: reportService,
  } as TypeTransferEntry),
  AI: createAITransferEntry({
    repository: aiService,
  } as TypeTransferEntry),
  Reaction: createReactionTypeTransferEntry({
    repository: reactionService,
  } as TypeTransferEntry),
  Analytics: createAnalyticsTypeTransferEntry({
    repository: analystService,
  } as TypeTransferEntry),
  Notification: createNotificationTypeTransferEntry({
    repository: notificationService,
  } as TypeTransferEntry),
};
