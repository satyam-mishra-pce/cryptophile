import { create } from "zustand";
import { IdPath } from "../navigation/types";
import { Color, Folder, PasswordItem } from "../user/types";
import useUserStore, { checkIsFolder } from "../user";
import useNavigationStore from "../navigation";
import useSelectionStore from "../selection";
import { DeletedItem, DeletionData } from "./types";

type Action = {
  createFolder: (
    data: Partial<
      Omit<Folder, "id" | "created" | "lastModified" | "isFavourite">
    >,
    path?: IdPath
  ) => string;
  createPasswordItem: (
    data: Partial<
      Omit<PasswordItem, "id" | "created" | "lastModified" | "isFavourite">
    >,
    path?: IdPath
  ) => string;
  modifyItem: (
    data: Partial<Omit<Folder | PasswordItem, "id" | "isFavourite">>,
    path?: IdPath
  ) => void;
  checkFavourites: (path?: IdPath) => boolean;
  setFavourites: (path?: IdPath, value?: boolean) => void;
  renameItem: (value: string, path?: IdPath) => void;
  deleteItems: (path?: IdPath) => DeletionData;
  getItemsTag: (path?: IdPath) => Color | undefined;
  setItemsTag: (value: Color | undefined, path?: IdPath) => void;
  moveItems: (destination: IdPath, source?: IdPath) => void;
  copyItems: (path?: IdPath) => string;
  pasteItems: (copiedItemsData: string, path?: IdPath) => void;
};

export const generateItemId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getCurrentDirIdPath = (): IdPath => {
  return useNavigationStore.getState().currentNavigationPiece.idPath;
};

const getSelectedItemPaths = (): IdPath[] | undefined => {
  const selectedItemIds = useSelectionStore.getState().selectedItemIds;
  if (selectedItemIds.size === 0) return undefined;
  const currentDirIdPath = getCurrentDirIdPath();
  const selectedItemPaths: IdPath[] = [];
  selectedItemIds.forEach((id) => {
    selectedItemPaths.push([...currentDirIdPath, id]);
  });
  return selectedItemPaths;
};

const useOperationStore = create<Action>((set) => {
  return {
    createFolder: (
      data: Partial<
        Omit<Folder, "id" | "created" | "lastModified" | "isFavourite">
      >,
      path?: IdPath
    ): string => {
      path = path ?? getCurrentDirIdPath();
      const id = generateItemId();
      const newFolder: Folder = {
        id,
        title: data.title ?? "New Folder",
        description: data.description ?? "Folder",
        contents: data.contents ?? [],
        created: new Date(),
        lastModified: new Date(),
        isFavourite: false,
      };
      useUserStore.getState().getOrUpdateItem([...path, id], newFolder);
      return id;
    },
    createPasswordItem: (
      data: Partial<
        Omit<PasswordItem, "id" | "created" | "lastModified" | "isFavourite">
      >,
      path?: IdPath
    ): string => {
      path = path ?? getCurrentDirIdPath();
      const id = generateItemId();
      const newPasswordItem: PasswordItem = {
        id,
        title: data.title ?? "New Password",
        description: data.description ?? "Password",
        type: "UNKNOWN",
        userId: data.userId ?? "",
        password: data.password ?? "",
        created: new Date(),
        lastModified: new Date(),
        isFavourite: false,
      };
      useUserStore.getState().getOrUpdateItem([...path, id], newPasswordItem);
      return id;
    },
    modifyItem: (
      data: Partial<Omit<Folder | PasswordItem, "id" | "isFavourite">>,
      path?: IdPath
    ) => {
      if (!path) {
        const selectedItemPaths = getSelectedItemPaths();
        if (!selectedItemPaths) throw new Error("No selection found.");
        if (selectedItemPaths.length > 1)
          throw new Error("Multiple selection found.");
        path = selectedItemPaths[0];
      }
      if (path.length === 0)
        throw new Error("The operation is not available on Home Directory.");
      const existingData = structuredClone(
        useUserStore.getState().getOrUpdateItem(path)
      );
      if (!existingData) throw new Error("The item could not be found.");
      if ("contents" in existingData) {
        const newData: Folder = {
          id: existingData.id,
          title: data.title ?? existingData.id,
          description: data.description ?? existingData.description,
          contents:
            "contents" in data
              ? (data.contents as (Folder | PasswordItem)[])
              : existingData.contents,
          created: data.created ?? existingData.created,
          lastModified: data.lastModified ?? new Date(),
          isFavourite: existingData.isFavourite,
        };
        useUserStore.getState().getOrUpdateItem(path, newData);
      } else {
        const newData: PasswordItem = {
          id: existingData.id,
          title: data.title ?? existingData.id,
          description: data.description ?? existingData.description,
          type: "UNKNOWN",
          userId:
            "userId" in data ? (data.userId as string) : existingData.userId,
          password:
            "password" in data
              ? (data.password as string)
              : existingData.password,
          created: data.created ?? existingData.created,
          lastModified: data.lastModified ?? new Date(),
          isFavourite: existingData.isFavourite,
        };
        useUserStore.getState().getOrUpdateItem(path, newData);
      }
    },
    checkFavourites: (path?: IdPath) => {
      const idPaths: IdPath[] = [];
      if (path) {
        if (path.length === 0)
          throw new Error("The operation is not available on Home Directory.");
        idPaths.push(path);
      } else {
        const selectedItemPaths = getSelectedItemPaths();
        selectedItemPaths?.forEach((path) => idPaths.push(path));
      }
      const favourites = useUserStore.getState().userFavourites;
      if (!favourites) throw new Error("This operation is not available.");
      const favouriteSet = new Set(favourites);
      let favCount = 0,
        notFavCount = 0;
      const idPathStrs = idPaths.map((idPath) => idPath.join("/"));
      idPathStrs.forEach((idPathStr) => {
        if (favouriteSet.has(idPathStr)) {
          favCount += 1;
        } else {
          notFavCount += 1;
        }
      });
      return notFavCount < favCount;
    },
    setFavourites: (path?: IdPath, value?: boolean) => {
      const favourites = useUserStore.getState().userFavourites;
      if (!favourites) throw new Error("This operation is not available.");
      const favouriteSet = new Set(favourites);

      value = value ?? !useOperationStore.getState().checkFavourites(path);

      if (path) {
        if (path.length === 0)
          throw new Error("The operation is not available on Home Directory.");
        const item = useUserStore.getState().getOrUpdateItem(path);
        if (!item) throw new Error("Item could not be found.");
        const pathStr = path.join("/");
        if (value) {
          favouriteSet.add(pathStr);
        } else {
          favouriteSet.delete(pathStr);
        }
        useUserStore.getState().getOrUpdateItem(path, {
          ...item,
          isFavourite: value,
        });
      } else {
        const selectedItemIds = useSelectionStore.getState().selectedItemIds;
        if (selectedItemIds.size === 0) throw new Error("No selection found.");

        const currentDirIdPath = getCurrentDirIdPath();
        const currentDir = useUserStore
          .getState()
          .getOrUpdateItem(currentDirIdPath);
        if (!(currentDir && "contents" in currentDir))
          throw new Error("This operation is not available.");
        const contents = structuredClone(currentDir.contents);

        const newContents = contents.map((item: Folder | PasswordItem) => {
          if (!selectedItemIds.has(item.id)) return item;
          const pathStr = [...currentDirIdPath, item.id].join("/");
          if (value) {
            favouriteSet.add(pathStr);
          } else {
            favouriteSet.delete(pathStr);
          }
          return { ...item, isFavourite: value };
        });
        useUserStore.getState().getOrUpdateItem(currentDirIdPath, {
          ...currentDir,
          contents: newContents,
        });
      }
      useUserStore.getState().setUserFavourites(Array.from(favouriteSet));
    },
    renameItem: (value: string, path?: IdPath) => {
      set((state) => {
        state.modifyItem({ title: value }, path);
        return {};
      });
    },
    deleteItems: (path?: IdPath) => {
      const deletionData: DeletionData = {
        parentPath: [],
        deletedItems: [],
      };

      let parentPath: IdPath = [];
      const itemIds = new Set<string>();

      if (path) {
        if (path.length === 0)
          throw new Error("The operation is not available on Home Directory.");
        const item = useUserStore.getState().getOrUpdateItem(path);
        if (!item) throw new Error("The item could not be found.");
        itemIds.add(path[path.length - 1]);
        parentPath = structuredClone(path.slice(0, -1));
      } else {
        const currentDirIdPath = getCurrentDirIdPath();
        const currentDir = useUserStore
          .getState()
          .getOrUpdateItem(currentDirIdPath);
        if (!checkIsFolder(currentDir))
          throw new Error("The location is not valid.");
        parentPath = structuredClone(currentDirIdPath);
        const selectedItemIds = useSelectionStore.getState().selectedItemIds;
        currentDir.contents.forEach((item) => {
          if (selectedItemIds.has(item.id)) {
            itemIds.add(item.id);
          }
        });
      }

      deletionData.parentPath = structuredClone(parentPath);
      if (itemIds.size === 0) return deletionData;

      const parentDir = useUserStore
        .getState()
        .getOrUpdateItem(parentPath) as Folder;
      const contents = structuredClone(parentDir.contents);

      const favourites = useUserStore.getState().userFavourites;
      if (!favourites) throw new Error("The operation is not available");
      const favouriteSet = new Set(favourites);

      const tagged = structuredClone(useUserStore.getState().userTagged);
      if (!tagged) throw new Error("The operation is not available");
      const checkTaggedByPathStr = (pathStr: string): Color | undefined => {
        for (let key of Object.keys(tagged)) {
          if (tagged[key as Color].has(pathStr)) return key as Color;
        }
        return undefined;
      };

      const getDeletedItemMetadata = (
        data: Folder | PasswordItem,
        baseIdPathStr: string
      ): Omit<DeletedItem, "data"> => {
        const deletedItemMetadata: Omit<DeletedItem, "data"> = {
          favouritedIdPathStrings: new Set<string>(),
          tagged: {},
        };
        const pathSeperator = baseIdPathStr.length > 0 ? "/" : "";
        const idPathStr = `${baseIdPathStr}${pathSeperator}${data.id}`;
        if (favouriteSet.has(idPathStr)) {
          deletedItemMetadata.favouritedIdPathStrings.add(idPathStr);
          favouriteSet.delete(idPathStr);
        }
        const tag = checkTaggedByPathStr(idPathStr);
        if (tag) {
          deletedItemMetadata.tagged[tag] ??= new Set<string>();
          deletedItemMetadata.tagged[tag]!.add(idPathStr);
          tagged[tag].delete(idPathStr);
        }
        if ("contents" in data) {
          data.contents.forEach((item) => {
            const { favouritedIdPathStrings, tagged } = getDeletedItemMetadata(
              item,
              idPathStr
            );
            favouritedIdPathStrings.forEach((str) =>
              deletedItemMetadata.favouritedIdPathStrings.add(str)
            );
            for (const key in tagged) {
              const tag = key as Color;
              deletedItemMetadata.tagged[tag] ??= new Set<string>();
              deletedItemMetadata.tagged[tag]!.add(idPathStr);
            }
          });
        }
        return deletedItemMetadata;
      };

      const newContents = contents.filter((item: Folder | PasswordItem) => {
        if (!itemIds.has(item.id)) return true;
        const data = structuredClone(item);
        deletionData.deletedItems.push({
          data,
          ...getDeletedItemMetadata(data, parentPath.join("/")),
        });
        return false;
      });

      useUserStore.getState().setUserFavourites(Array.from(favouriteSet));
      useUserStore.getState().setUserTagged(tagged);
      useUserStore
        .getState()
        .getOrUpdateItem(parentPath, { ...parentDir, contents: newContents });

      return deletionData;
    },
    getItemsTag: (path?: IdPath) => {
      const idPaths: IdPath[] = [];
      if (path) {
        if (path.length === 0)
          throw new Error("The operation is not available on Home Directory.");
        idPaths.push(path);
      } else {
        const selectedItemPaths = getSelectedItemPaths();
        selectedItemPaths?.forEach((path) => idPaths.push(path));
      }
      const idPathStrs = idPaths.map((idPath) => idPath.join("/"));
      const tagged = useUserStore.getState().userTagged;
      if (!tagged) throw new Error("This operation is not available.");

      const countFromSet = (set: Set<string>, values: string[]) => {
        return values.reduce(
          (count, value) => count + (set.has(value) ? 1 : 0),
          0
        );
      };

      const counter = Object.keys(tagged).reduce((acc: any, key) => {
        acc[key] = countFromSet(tagged[key as Color], idPathStrs);
        return acc;
      }, {}) as {
        [key in Color]: number;
      };

      const untaggedCount =
        idPathStrs.length -
        Object.keys(counter).reduce(
          (acc, key) => acc + counter[key as Color],
          0
        );
      const maxTag = Object.keys(counter).reduce(
        (
          acc: {
            count?: number;
            color?: Color;
          },
          key
        ) => {
          if ((acc.count ?? 0) < counter[key as Color]) {
            acc.count = counter[key as Color];
            acc.color = key as Color;
          }
          return acc;
        },
        {}
      );

      if (maxTag.color) {
        return maxTag.count ?? 0 > untaggedCount ? maxTag.color : undefined;
      }
      return undefined;
    },
    setItemsTag: (value: Color | undefined, path?: IdPath) => {
      const tagged = structuredClone(useUserStore.getState().userTagged);
      if (!tagged) throw new Error("This operation is not available.");
      const clonedTagged = structuredClone(tagged);

      const generateNewTagged = (paths: IdPath[], value: Color | undefined) => {
        const pathStrs = paths.map((path) => path.join("/"));
        Object.keys(clonedTagged).forEach((key) => {
          const newSet = new Set(clonedTagged[key as Color]);
          pathStrs.forEach((pathStr) => newSet.delete(pathStr));
          clonedTagged[key as Color] = newSet;
        });
        if (value) {
          const newSet = clonedTagged[value];
          pathStrs.forEach((pathStr) => newSet.add(pathStr));
          clonedTagged[value] = newSet;
        }
        return clonedTagged;
      };

      if (path) {
        if (path.length === 0)
          throw new Error("The operation is not available on Home Directory.");
        const item = structuredClone(
          useUserStore.getState().getOrUpdateItem(path)
        );
        if (!item) throw new Error("Item could not be found.");
        const newTagged = generateNewTagged([path], value);
        useUserStore.getState().setUserTagged(newTagged);
        useUserStore.getState().getOrUpdateItem(path, { ...item, tag: value });
        return;
      }

      const paths: IdPath[] = [];
      const selectedItemIds = useSelectionStore.getState().selectedItemIds;
      if (selectedItemIds.size === 0) throw new Error("No selection found.");

      const currentDirIdPath = getCurrentDirIdPath();
      const currentDir = structuredClone(
        useUserStore.getState().getOrUpdateItem(currentDirIdPath)
      );
      if (!(currentDir && "contents" in currentDir))
        throw new Error("This operation is not available.");

      const newContents = currentDir.contents.map(
        (item: Folder | PasswordItem) => {
          if (!selectedItemIds.has(item.id)) return item;
          paths.push([...currentDirIdPath, item.id]);
          return { ...item, tag: value };
        }
      );

      const newTagged = generateNewTagged(paths, value);
      useUserStore.getState().setUserTagged(newTagged);
      useUserStore.getState().getOrUpdateItem(currentDirIdPath, {
        ...currentDir,
        contents: newContents,
      });
    },
    moveItems: (destination: IdPath, source?: IdPath) => {
      const destinationDir = structuredClone(
        useUserStore.getState().getOrUpdateItem(destination)
      );
      if (!checkIsFolder(destinationDir))
        throw new Error("The destination directory could not be found.");

      const destinationPathStr = destination.join("/");
      const sourceParentPath = source
        ? source.slice(0, -1)
        : getCurrentDirIdPath();
      const sourceParentPathStr = sourceParentPath.join("/");
      const sourceIds = source
        ? [source[source.length - 1]]
        : Array.from(useSelectionStore.getState().selectedItemIds);
      for (const sourceId in sourceIds) {
        const pathSeperator = sourceParentPathStr.length > 0 ? "/" : "";
        const sourcePathStr = `${sourceParentPathStr}${pathSeperator}${sourceId}`;
        if (destinationPathStr.startsWith(sourcePathStr)) {
          throw new Error(
            "The destination directory is invalid for the operation."
          );
        }
      }

      let deletionData: DeletionData | null = null;
      set((state) => {
        deletionData = state.deleteItems(source);
        return {};
      });
      if (!deletionData) throw new Error("The items could not be moved.");
      const { parentPath, deletedItems } = deletionData as DeletionData;

      const favourites = useUserStore.getState().userFavourites;
      if (!favourites) throw new Error("The operation is not available");
      const favouriteSet = new Set(favourites);

      const tagged = structuredClone(useUserStore.getState().userTagged);
      if (!tagged) throw new Error("The operation is not available");

      type ReproducedItem = DeletedItem;

      const reproduceData = (
        data: DeletedItem["data"],
        parentPath: IdPath,
        favouritedIdPathStrings: DeletedItem["favouritedIdPathStrings"],
        tagged: DeletedItem["tagged"]
      ): ReproducedItem => {
        const id = generateItemId();
        const parentPathStr = parentPath.join("/");
        const pathSeperator = parentPathStr.length > 0 ? "/" : "";
        const oldIdPathStr = `${parentPathStr}${pathSeperator}${data.id}`;
        const newIdPathStr = `${parentPathStr}${pathSeperator}${id}`;

        const newFavouritedIdPathStrings = new Set<string>();
        if (favouritedIdPathStrings.has(oldIdPathStr)) {
          newFavouritedIdPathStrings.add(newIdPathStr);
        }

        const newTagged: ReproducedItem["tagged"] = {};
        Object.keys(tagged).forEach((key) => {
          const tag = key as Color;
          newTagged[tag] ??= new Set<string>();
          newTagged[tag]!.add(newIdPathStr);
        });

        const isFolder = checkIsFolder(data);
        const reproducedContents = isFolder
          ? data.contents.map((item) =>
              reproduceData(
                item,
                [...parentPath, id],
                favouritedIdPathStrings,
                tagged
              )
            )
          : [];
        const contents = reproducedContents.map((reproducedItem) => {
          reproducedItem.favouritedIdPathStrings.forEach((idPathStr) => {
            newFavouritedIdPathStrings.add(idPathStr);
          });
          Object.keys(reproducedItem.tagged).forEach((key) => {
            const tag = key as Color;
            newTagged[tag] ??= new Set<string>();
            Object.keys(reproducedItem.tagged[tag] as Set<string>).forEach(
              (idPathStr) => {
                newTagged[tag]!.add(idPathStr);
              }
            );
          });
          return reproducedItem.data;
        });

        return {
          data: {
            ...data,
            id,
            created: new Date(),
            lastModified: new Date(),
            ...(isFolder
              ? {
                  contents,
                }
              : {}),
          },
          favouritedIdPathStrings: newFavouritedIdPathStrings,
          tagged: newTagged,
        };
      };

      const contentsToAdd = deletedItems.map((item) => {
        const { data, favouritedIdPathStrings, tagged: deletedTagged } = item;
        const reproducedData = reproduceData(
          data,
          parentPath,
          favouritedIdPathStrings,
          deletedTagged
        );
        reproducedData.favouritedIdPathStrings.forEach((idPathStr) => {
          favouriteSet.add(idPathStr);
        });
        Object.keys(reproducedData.tagged).forEach((key) => {
          const tag = key as Color;
          (reproducedData.tagged[tag] as Set<string>).forEach((idPathStr) => {
            tagged[tag].add(idPathStr);
          });
        });
        return data;
      });

      useUserStore.getState().getOrUpdateItem(destination, {
        ...destinationDir,
        contents: contentsToAdd,
      });
      useUserStore.getState().setUserFavourites(Array.from(favouriteSet));
      useUserStore.getState().setUserTagged(tagged);
    },
    copyItems: (path?: IdPath) => {
      return "";
    },
    pasteItems: (copiedItemsData: string, path?: IdPath) => {},
  } satisfies Action;
});

export default useOperationStore;
