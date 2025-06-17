import { TUserShortCut } from "@/shared/types/common-type/user-type";

export type TNotification = {
  uuid: string;
  userUuid: string;
  type: string;
  content: string;
  relatedUuid: string;
  isRead: boolean;
  createdAt: string;
  userRelated?: TUserShortCut;
};
