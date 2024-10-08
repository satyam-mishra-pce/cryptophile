import React, { useEffect, useState } from "react";
import Folder from "./Folder";
import EmptyFolder from "./EmptyFolderPage";
import PasswordItem from "./PasswordItem";
import useNavigationStore from "@/store/navigation";
import useSelectionStore from "@/store/selection";
import useExplorerStore, { filterContents } from "@/store/explorer";
import useUserStore, { checkIsFolder } from "@/store/user";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Color } from "@/store/user/types";
import NoFilterMatch from "./NoFilterMatchPage";

const Body = () => {
  const { getOrUpdateItem } = useUserStore();
  const {
    selectedItemIds,
    selectItems,
    reselectItems,
    deselectItems,
    selectionMode,
  } = useSelectionStore();
  const setPasswordEditorMode = useExplorerStore(
    (state) => state.setPasswordEditorMode
  );
  const { idPath: currentDirectoryIdPath } = useNavigationStore(
    (state) => state.currentNavigationPiece
  );
  const push = useNavigationStore((state) => state.push);

  const directory = getOrUpdateItem(currentDirectoryIdPath);
  const contents = checkIsFolder(directory) ? directory.contents : [];
  const filterOptions = useExplorerStore((state) => state.filter);
  const filteredContents = filterContents(contents, filterOptions);

  const [isItemContextMenu, setItemContextMenu] = useState(false);

  const handleItemClick = (id: string) => {
    if (selectionMode) {
      if (selectedItemIds.has(id)) {
        deselectItems([id]);
      } else {
        selectItems([id]);
      }
    } else {
      reselectItems([id]);
    }
  };

  const handlePasswordDoubleClick = (id: string) => {
    if (selectionMode) return;
    reselectItems([id]);
    setPasswordEditorMode(true);
  };

  const navigateToFolderContents = (id: string) => {
    if (!selectionMode) push([...currentDirectoryIdPath, id]);
  };

  return (
    <>
      {checkIsFolder(directory) ? (
        contents.length === 0 ? (
          <EmptyFolder />
        ) : filteredContents.length === 0 ? (
          <NoFilterMatch />
        ) : (
          <ContextMenu>
            <ContextMenuTrigger
              className="flex flex-col flex-1 items-start justify-start"
              onContextMenu={(evt) => {
                const target = evt.target;
                if (!(target as HTMLElement).closest("button")) {
                  setItemContextMenu(false);
                }
              }}
            >
              <div className="flex flex-wrap gap-1 p-4 select-none">
                {filteredContents.map((item) => {
                  return "contents" in item ? (
                    <Folder
                      folder={item}
                      key={item.id}
                      isSelected={selectedItemIds.has(item.id)}
                      showSelectCheckbox={selectionMode}
                      onClick={() => handleItemClick(item.id)}
                      onDoubleClick={() => navigateToFolderContents(item.id)}
                      onContextMenu={() => {
                        if (!selectedItemIds.has(item.id)) {
                          reselectItems([item.id]);
                        }
                        setItemContextMenu(true);
                      }}
                    />
                  ) : (
                    <PasswordItem
                      passwordItem={item}
                      key={item.id}
                      isSelected={selectedItemIds.has(item.id)}
                      showSelectCheckbox={selectionMode}
                      onClick={() => handleItemClick(item.id)}
                      onDoubleClick={() => handlePasswordDoubleClick(item.id)}
                      onContextMenu={() => {
                        if (!selectedItemIds.has(item.id)) {
                          reselectItems([item.id]);
                        }
                        setItemContextMenu(true);
                      }}
                    />
                  );
                })}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {isItemContextMenu ? (
                <>
                  {selectedItemIds.size === 1 && (
                    <ContextMenuItem>Rename</ContextMenuItem>
                  )}
                  <ContextMenuItem>Mark as Favourite</ContextMenuItem>
                  <ContextMenuItem>Tag</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>Delete</ContextMenuItem>
                </>
              ) : (
                <>
                  <ContextMenuItem>Filter</ContextMenuItem>
                  <ContextMenuItem>Sort</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>New</ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        )
      ) : (
        <div>Invalid Location</div>
      )}
    </>
  );
};

export default Body;
