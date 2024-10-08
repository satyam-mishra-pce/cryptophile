import { Button } from "@/components/ui/button";
import { getItemByPath, parseIdPathString } from "@/lib/explorer-utils";
import useNavigationStore from "@/store/navigation";
import { IdPath } from "@/store/navigation/types";
import useSelectionStore from "@/store/selection";
import useUserStore from "@/store/user";
import { Folder, PasswordItem } from "@/store/user/types";
import React, { useCallback, useEffect, useState } from "react";

const FavouriteItem = ({
  item,
  idPath,
  push,
  selectItem,
}: {
  item: Folder | PasswordItem;
  idPath: string[];
  push: (path: IdPath, selectionItemId?: string, clearStack?: boolean) => void;
  selectItem: (id: string) => void;
}) => {
  return (
    <button
      className="w-full hover:bg-primary/5 flex items-center justify-start rounded-md py-1 px-2"
      onClick={() => {
        if ("contents" in item) {
          push(idPath);
        } else {
          push(idPath.slice(0, -1), item.id);
        }
      }}
    >
      <span className="w-4 text-primary/80">
        {"contents" in item ? (
          <i className="fa-solid fa-folder"></i>
        ) : (
          <i className="fa-solid fa-key"></i>
        )}
      </span>
      <span className="ml-2">{item.title}</span>
    </button>
  );
};

const Favourites = () => {
  const push = useNavigationStore((state) => state.push);
  const getOrUpdateItem = useUserStore((state) => state.getOrUpdateItem);
  const favourites = useUserStore((state) => state.userFavourites) ?? [];
  const reselectItems = useSelectionStore((state) => state.reselectItems);
  const selectItem = useCallback(
    (itemId: string) => {
      reselectItems([itemId]);
    },
    [reselectItems]
  );
  return (
    <ul>
      {favourites.length > 0 ? (
        <div className="rounded-md text-center">
          {favourites.map((idPathStr) => {
            const idPath = idPathStr.split("/");
            const item = getOrUpdateItem(idPath);
            if (item) {
              return (
                <FavouriteItem
                  item={item}
                  idPath={idPath}
                  push={push}
                  selectItem={selectItem}
                  key={idPathStr}
                />
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div className="bg-foreground/5 rounded-md px-3 py-3 text-center mt-2">
          <span className="text-muted-foreground font-normal">
            Your favourites appear here.
          </span>
        </div>
      )}
    </ul>
  );
};

export default Favourites;
