import { Folder, User, Color, ColorMap } from "@/store/user/types";
import {
  arrayToHex,
  decrypt,
  encrypt,
  generateSHA256,
} from "./cryptographic-utils";
import { safeParse } from "./utils";

const VERSION = "1" as const;

export type CryptophileData = {
  version: "1";
  users: CryptophileUsers;
};

export type CryptophileUsers = {
  [key: string]: CryptophileUserData;
};

export type CryptophileUserData =
  | ["1", string, `0x${string}`, string, string, string]
  | ["0", string, `0x${string}`, string];

export const defaultCryptophileData = {
  version: VERSION,
  users: {},
} as CryptophileData;

export const defaultCryptophileDataString = JSON.stringify(
  defaultCryptophileData
);

export const INITIAL_DIRECTORY = (): Folder => {
  return {
    title: "Home",
    id: "home",
    description: "",
    contents: [
      {
        title: "Websites",
        id: "websites",
        contents: [],
        description: "Store all the passwords to be used in websites here.",
        created: new Date(),
        lastModified: new Date(),
        isFavourite: false,
      },
      {
        title: "Wi-Fi",
        id: "wi-fi",
        contents: [],
        description: "Store all Wi-Fi passwords to be used in websites here.",
        created: new Date(),
        lastModified: new Date(),
        isFavourite: false,
      },
      {
        title: "Banks",
        id: "banks",
        contents: [],
        description:
          "Store all the passwords associated to bank accounts here.",
        created: new Date(),
        lastModified: new Date(),
        isFavourite: false,
      },
      {
        title: "Crypto",
        id: "crypto",
        contents: [],
        description:
          "Store all the passwords and keys associated to crypto wallets here.",
        created: new Date(),
        lastModified: new Date(),
        isFavourite: false,
      },
    ],
    created: new Date(),
    lastModified: new Date(),
    isFavourite: false,
  };
};

type ColorTagsForStorage = {
  [K in keyof User["userData"]["tagged"]]: Array<string>;
};
type UserDataForStorage = Omit<User["userData"], "tagged"> & {
  tagged: ColorTagsForStorage;
};

export const INITIAL_USER_DATA = (): User["userData"] => {
  const directory = INITIAL_DIRECTORY();
  type ColorTags = User["userData"]["tagged"];
  const data = {
    directory,
    favourites: [],
    tagged: Object.keys(ColorMap).reduce<ColorTags>((acc, color) => {
      acc[color as Color] = new Set();
      return acc;
    }, {} as ColorTags),
  };
  return data;
};

export const INITIAL_USER_DATA_FOR_STORAGE = (): UserDataForStorage => {
  const userData = INITIAL_USER_DATA();
  type ColorTags = { [key in keyof typeof userData.tagged]: Array<string> };
  const taggedSetsToArrays = Object.keys(ColorMap).reduce<ColorTags>(
    (acc, color) => {
      acc[color as Color] = [];
      return acc;
    },
    {} as ColorTags
  );
  const data = { ...userData, tagged: taggedSetsToArrays };
  return data;
};

export const createUserWithPassword = async (
  username: string,
  displayName: string,
  avatarHex: string,
  privateKey: string,
  password: string
) => {
  let cryptophileDataString = localStorage.getItem("cryptophile-data");
  if (!cryptophileDataString || cryptophileDataString === "") {
    cryptophileDataString = defaultCryptophileDataString;
    localStorage.setItem("cryptophile-data", defaultCryptophileDataString);
  }

  let cryptophileData;
  try {
    cryptophileData = safeParse(cryptophileDataString) as CryptophileData;
  } catch {
    throw new Error(
      "There was an error creating the account. Try clearing the cookies."
    );
  }

  if (username in cryptophileData.users)
    throw new Error("User already exists.");
  if (password.length > 256)
    throw new Error("Password cannot be greater than 256 characters.");

  const SHAedPassword = generateSHA256(password);
  const SHAedSHAedPassword = generateSHA256(SHAedPassword);

  const encryptedPrivateKey = await encrypt(privateKey, SHAedSHAedPassword);
  const encryptedDisplayName = await encrypt(displayName, privateKey);
  const data = INITIAL_USER_DATA_FOR_STORAGE();
  const encryptedData = await encrypt(JSON.stringify(data), privateKey);

  const userAuthType = "1";
  const userData = [
    userAuthType,
    encryptedDisplayName,
    avatarHex,
    encryptedPrivateKey,
    SHAedPassword,
    encryptedData,
  ] as CryptophileUserData;

  cryptophileData.users[username] = userData;

  cryptophileDataString = JSON.stringify(cryptophileData);
  localStorage.setItem("cryptophile-data", cryptophileDataString);
};

export const createUserWithPrivateKey = async (
  username: string,
  displayName: string,
  avatarHex: string,
  privateKey: string
) => {
  let cryptophileDataString = localStorage.getItem("cryptophile-data");
  if (!cryptophileDataString || cryptophileDataString === "") {
    cryptophileDataString = JSON.stringify({
      version: VERSION,
      users: {},
    } as CryptophileData);
    localStorage.setItem("cryptophile-data", cryptophileDataString);
  }

  let cryptophileData;
  try {
    cryptophileData = safeParse(cryptophileDataString) as CryptophileData;
  } catch {
    throw new Error(
      "There was an error creating the account. Try clearing the cookies."
    );
  }

  if (username in cryptophileData.users)
    throw new Error("User already exists.");

  const encryptedDisplayName = await encrypt(displayName, privateKey);
  const data = INITIAL_USER_DATA_FOR_STORAGE();
  const encryptedData = await encrypt(JSON.stringify(data), privateKey);

  const userAuthType = "0";
  const userData = [
    userAuthType,
    encryptedDisplayName,
    avatarHex,
    encryptedData,
  ] as CryptophileUserData;

  cryptophileData.users[username] = userData;

  cryptophileDataString = JSON.stringify(cryptophileData);
  localStorage.setItem("cryptophile-data", cryptophileDataString);
};

export const authenticateUserWithPassword = async (
  username: string,
  password: string
) => {
  let cryptophileDataString = localStorage.getItem("cryptophile-data");
  if (!cryptophileDataString || cryptophileDataString === "") {
    cryptophileDataString = defaultCryptophileDataString;
    localStorage.setItem("cryptophile-data", defaultCryptophileDataString);
  }

  let cryptophileData;
  try {
    cryptophileData = safeParse(cryptophileDataString) as CryptophileData;
  } catch {
    throw new Error("There was an error authenticating. Try refreshing.");
  }
  if (!(username in cryptophileData.users))
    throw new Error("User does not exist.");

  const user = cryptophileData.users[username];

  if (user[0] === "0")
    throw new Error("Password encryption does not exist on this user.");

  const SHAedPassword = generateSHA256(password);
  if (SHAedPassword !== user[4])
    throw new Error("Password is incorrect. Please try again.");

  const SHAedSHAedPassword = generateSHA256(SHAedPassword);
  const privateKey = await decrypt(user[3], SHAedSHAedPassword);
  const displayName = await decrypt(user[1], privateKey);
  const data = await decrypt(user[5], privateKey);
  console.log("Dec", data);
  return [displayName, data];
};

export const authenticateUserWithPrivateKey = async (
  username: string,
  privateKey: string
) => {
  let cryptophileDataString = localStorage.getItem("cryptophile-data");
  if (!cryptophileDataString || cryptophileDataString === "") {
    cryptophileDataString = defaultCryptophileDataString;
    localStorage.setItem("cryptophile-data", defaultCryptophileDataString);
  }

  let cryptophileData;
  try {
    cryptophileData = safeParse(cryptophileDataString) as CryptophileData;
  } catch {
    throw new Error("There was an error authenticating. Try refreshing.");
  }
  if (!(username in cryptophileData.users))
    throw new Error("User does not exist.");

  const user = cryptophileData.users[username];

  if (user[0] === "1")
    throw new Error("Private Key encryption does not exist on this user.");

  const displayName = await decrypt(user[1], privateKey);
  const data = await decrypt(user[3], privateKey);

  return [displayName, data];
};

export const generateAvatarHex = (): `0x${string}` => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return arrayToHex(array) as `0x${string}`;
};
