export const ColorMap = {
  GREEN: "34 197 94",
  RED: "239 68 68",
  AMBER: "245 158 11",
  BLUE: "59 130 246",
  VIOLET: "99 102 241",
} as const;

export type Color = keyof typeof ColorMap;

// Utility Types

type UpdateVersion<T, Version extends number> = Omit<T, "version"> & {
  version: Version;
};

// V1

type FolderV1 = {
  title: string;
  id: string;
  contents: Array<FolderV1 | PasswordItemV1>;
  description: string;
  created: Date;
  lastModified: Date;
  tag?: Color;
  isFavourite: boolean;
};

type PasswordItemV1 = {
  title: string;
  id: string;
  website?: string;
  username: string;
  password: string;
  description: string;
  created: Date;
  lastModified: Date;
  tag?: Color;
  isFavourite: boolean;
};

type UserDataV1 = {
  directory: FolderV1;
  favourites: string[];
  tagged: {
    [K in Color]: Set<string>;
  };
};

export type UserV1 = {
  displayName: string;
  username: string;
  usesPassword: boolean;
  userData: UserDataV1;
  credential: string;
  avatarHex: `0x${string}`;
  version?: never;
};

// V2

export type FolderV2 = FolderV1;
export type PasswordItemV2 = PasswordItemV1;
export type UserDataV2 = UserDataV1;

export type UserV2 = UpdateVersion<UserV1, 2>;

// V3

export const PasswordTypePairs: {
  [key: string]: string;
} = {
  EMAIL: "Email",
  WEB: "Website",
  WIFI: "WiFi",
  USER_KEY_PAIR: "User",
  CRYPTO_WALLET_KEY: "Crypto Wallet Keys",
  OTHER: "Other",
  UNKOWN: "Unknown",
};

export type PasswordTypeEnums = keyof typeof PasswordTypePairs;

export type FolderV3 = Omit<FolderV2, "contents"> & {
  contents: Array<FolderV3 | PasswordItemV3>;
};

export type PasswordItemV3 = Omit<PasswordItemV2, "username"> & {
  type: PasswordTypeEnums;
  userId: string;
};

export type UserDataV3 = Omit<UserDataV2, "directory"> & {
  directory: FolderV3;
};

type UserV2ToUserV3 = Omit<UserV2, "userData"> & {
  userData: UserDataV3;
};

export type UserV3 = UpdateVersion<UserV2ToUserV3, 3>;

// Final Types

export type Folder = FolderV3;
export type PasswordItem = PasswordItemV3;
export type UserData = UserDataV3;
export type UserAllVersions = UserV1 | UserV2 | UserV3;
export type User = UserV3;
