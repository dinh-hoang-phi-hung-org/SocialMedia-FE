import { DetailFields, TableHeaders } from "@/shared/types/common-type/shared-types";
import { DefaultItemType } from "@/shared/types/common-type/default-item-type";
import RoleEnum from "@/shared/enums/role";
export type TUser = DefaultItemType & {
  uuid: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: boolean;
  role?: typeof RoleEnum;
  isActive: boolean;
  createdAt?: Date;
  password?: string;
  lastLogin?: Date;
  followersCount?: number;
  followingsCount?: number;
  postsCount?: number;
  isFollowed?: boolean;
};

export type TUserUpdate = TUser & {
  bio: string;
  avatarUrl: string;
  firstname?: string;
  lastname?: string;
};

export type TUserPassword = {
  oldPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

export type TUserStore = {
  user: Partial<TUser>;
  setUser: (user: Partial<TUser>) => void;
};

export const UserTableHeaders: TableHeaders = {
  username: {
    label: "user-management:fields.username",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  email: {
    label: "user-management:fields.email",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  phoneNumber: {
    label: "user-management:fields.phone-number",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  lastLogin: {
    label: "user-management:fields.last-login",
    sortable: true,
    hidden: false,
  },
  createdAt: {
    label: "user-management:fields.created-at",
    sortable: true,
    hidden: false,
  },
  updatedAt: {
    label: "user-management:fields.updated-at",
    sortable: true,
    hidden: false,
  },
};

export const UserDetailFields: DetailFields = {
  username: {
    label: "user-management:fields.username",
    changable: true,
    placeholder: "JohnDoe",
    required: false,
    detailChangeable: false,
    hidden: false,
  },
  email: {
    label: "user-management:fields.email",
    changable: true,
    placeholder: "john.doe@gmail.com",
    required: false,
    detailChangeable: false,
    hidden: false,
  },
  phoneNumber: {
    label: "user-management:fields.phone-number",
    changable: true,
    placeholder: "+84903999888",
    required: false,
    detailChangeable: true,
    hidden: false,
  },
  password: {
    label: "user-management:fields.password",
    changable: true,
    placeholder: "********",
    required: false,
    detailChangeable: false,
    hidden: true,
  },
  lastLogin: {
    label: "user-management:fields.last-login",
    changable: false,
    detailChangeable: false,
    hidden: false,
  },
  createdAt: {
    label: "user-management:fields.created-at",
    changable: false,
    detailChangeable: false,
    hidden: false,
  },
  updatedAt: {
    label: "user-management:fields.updated-at",
    changable: false,
    detailChangeable: false,
    hidden: false,
  },
  isActive: {
    label: "user-management:fields.is-active",
    changable: true,
    detailChangeable: true,
    required: false,
    inputType: "switch",
  },
};

export const RoleDetailFields: DetailFields = {
  role: {
    label: "role-permission-management:fields.role",
    changable: true,
    detailChangeable: true,
    hidden: false,
    required: true,
  },
  createdAt: {
    label: "role-permission-management:fields.created-at",
    changable: false,
    detailChangeable: false,
    hidden: false,
    required: false,
  },
  updatedAt: {
    label: "role-permission-management:fields.updated-at",
    changable: false,
    detailChangeable: false,
    hidden: false,
    required: false,
  },
};

// profile
export const ProfileTableHeaders: TableHeaders = {
  username: {
    label: "user-management:fields.username",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  fullName: {
    label: "user-management:fields.full-name",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  bio: {
    label: "user-management:fields.bio",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  avatarUrl: {
    label: "user-management:fields.avatar-url",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  socialLinks: {
    label: "user-management:fields.social-links",
    sortable: true,
    searchable: true,
    hidden: false,
  },
};

export const ProfileDetailFields: DetailFields = {
  username: {
    label: "user-management:fields.username",
    changable: true,
    detailChangeable: true,
    hidden: false,
  },
  fullName: {
    label: "user-management:fields.full-name",
    changable: true,
    detailChangeable: true,
    hidden: false,
  },
  bio: {
    label: "user-management:fields.bio",
    changable: true,
    detailChangeable: true,
    hidden: false,
  },
  avatarUrl: {
    label: "user-management:fields.avatar-url",
    changable: true,
    detailChangeable: true,
    hidden: false,
  },
  socialLinks: {
    label: "user-management:fields.social-links",
    changable: true,
    detailChangeable: true,
    hidden: false,
  },
};

// binary file
export const BinaryFileTableHeaders: TableHeaders = {
  uuid: {
    label: "binary-file-management:fields.uuid",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  binary: {
    label: "binary-file-management:fields.binary",
    sortable: true,
    searchable: true,
    hidden: false,
  },
  createdAt: {
    label: "binary-file-management:fields.created-at",
    sortable: true,
    hidden: false,
  },
  updatedAt: {
    label: "binary-file-management:fields.updated-at",
    sortable: true,
    hidden: false,
  },
};

export const BinaryFileDetailFields: DetailFields = {
  uuid: {
    label: "binary-file-management:fields.uuid",
    changable: true,
    detailChangeable: true,
    hidden: false,
  },
  binary: {
    label: "binary-file-management:fields.binary",
    changable: true,
    detailChangeable: true,
    hidden: false,
  },
  createdAt: {
    label: "binary-file-management:fields.created-at",
    changable: false,
    detailChangeable: false,
    hidden: false,
  },
  updatedAt: {
    label: "binary-file-management:fields.updated-at",
    changable: false,
    detailChangeable: false,
    hidden: false,
  },
};
