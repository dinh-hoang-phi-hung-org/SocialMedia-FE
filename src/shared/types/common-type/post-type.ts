import { DefaultItemType } from "@/shared/types/common-type/default-item-type";

// Interface for media items within a post
interface MediaItem {
  url: string;
  type: "image" | "video";
}

// Interface for all media within a post
interface PostMedia {
  images: MediaItem[];
  videos: MediaItem[];
}

// Interface for the minimal user information shown with a post
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
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLiked?: boolean;

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
