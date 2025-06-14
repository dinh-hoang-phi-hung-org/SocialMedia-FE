import { DefaultItemType } from "@/shared/types/common-type/default-item-type";
import { TUserShortCut } from "@/shared/types/common-type/user-type";
import { TMessage } from "@/shared/types/common-type/message-type";
export type TConversation = DefaultItemType & {
  conversationUuid: string;
  conversationTitle: string;
  conversationUrl: string;
  user: TUserShortCut;
  users: TUserShortCut[];
  lastMessage: TMessage;
  isGroupChat: boolean;
  adminUuid: string;
};
