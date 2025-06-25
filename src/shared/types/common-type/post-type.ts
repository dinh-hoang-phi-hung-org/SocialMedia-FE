import { DefaultItemType } from "@/shared/types/common-type/default-item-type";
import { TMediaUrl } from "./file-type";

interface PostMedia {
  images: TMediaUrl[];
  videos: TMediaUrl[];
}

interface PostUser {
  uuid: string;
  username: string;
  profilePictureUrl: string | null;
}

export type TPost = DefaultItemType & {
  uuid: string;
  content: string;
  mediaUrl: PostMedia;
  createdAt: string;
  user: PostUser;

  // Optional fields for post stats
  reactionsCount?: number;
  commentsCount?: number;
  isReacted?: boolean;
  isSaved?: boolean;
  // Optional fields for post status
  isActive?: boolean;
  isHidden?: boolean;
  isReported?: boolean;

  // Optional fields for advanced features
  tags?: string[];
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };

  // Optional metadata
  updatedAt?: string;
};

export type TPostCreate = {
  content: string;
  mediaUrl: PostMedia;
};
