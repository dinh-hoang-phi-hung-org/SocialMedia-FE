import { TConversation } from "@/shared/types/common-type/conversation-type";
import { TMediaUrl } from "@/shared/types/common-type/file-type";
import { TUserShortCut } from "@/shared/types/common-type/user-type";

export type TMessage = {
  conversationUuid: string;
  messageUuid: string;
  user: TUserShortCut;
  isMyMessage: boolean;
  content: string;
  mediaUrl: MessageMedia;
  createdAt: Date;
};

export type THistoryMessage = {
  conversationUuid: TConversation;
  messages: TMessage[];
};

interface MessageMedia {
  images: TMediaUrl[];
  videos: TMediaUrl[];
}
