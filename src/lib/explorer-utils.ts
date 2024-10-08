import { Folder, PasswordItem } from "@/store/user/types";

export const generateItemId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const getItemByPath = (
  path: string[],
  homeDirectory: Folder
): Folder | PasswordItem | undefined => {
  if (path.length === 0) return;

  let initialContents: (Folder | PasswordItem)[] = [homeDirectory];
  for (let i = 0; i < path.length; i++) {
    const currentItem = initialContents.find((item) => item.id === path[i]);
    if (!currentItem) return;
    if (i === path.length - 1) return currentItem;
    if (!("contents" in currentItem)) return;
    initialContents = [...currentItem.contents];
  }
};

export const getContentCount = (folder: Folder) => {
  const contents = folder.contents;
  let folders = 0,
    passwords = 0;
  for (let i = 0; i < contents.length; i++) {
    if ("password" in contents[i]) {
      passwords += 1;
    } else {
      folders += 1;
    }
  }
  return {
    folders,
    passwords,
  };
};

export const checkFolderByPath = (path: string[], homeDirectory: Folder) => {
  const item = getItemByPath(path, homeDirectory);
  if (!item) return undefined;
  return checkFolderByData(item);
};

export const checkFolderByData = (
  data: Folder | PasswordItem
): data is Folder => {
  return !("password" in data);
};

export const getIdPathString = (path: string[]) => {
  return path.join("/");
};

export const parseIdPathString = (path: string) => {
  return path.split("/");
};
