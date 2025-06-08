import { TMediaUrl } from "@/shared/types/common-type/file-type";
import { TUserShortCut } from "./user-type";
import { TPost } from "./post-type";
export type TComment = {
  uuid: string;
  content: string;
  createdAt: string;
  parentUuid: string;
  postUuid: string;
  mediaUrl: CommentMedia;
  user: TUserShortCut;
  post: TPost;
  childrenCount: number;
};

interface CommentMedia {
  images: TMediaUrl[];
  videos: TMediaUrl[];
}
