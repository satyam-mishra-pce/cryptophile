import React, { useState } from "react";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
import { getItemByPath } from "@/lib/explorer-utils";
import { Button } from "../ui/button";
import useSelectionStore from "@/store/selection";
import useOperationStore from "@/store/operation";
import useUserStore from "@/store/user";
import useNavigationStore from "@/store/navigation";

const DeletionPreviewTile = ({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  body: React.ReactNode;
}) => {
  return (
    <div className="bg-muted/70 rounded-lg p-2 px-4 w-[200px] flex items-center gap-2">
      <span className="text-4xl text-foreground/60">{icon}</span>
      <div className="flex flex-col flex-1 min-w-0 items-start">
        <span className="font-bold w-full truncate text-lg">{title}</span>
        <span className="text-sm">{body}</span>
      </div>
    </div>
  );
};

const DeleteItemsButtonWrapper = ({
  children,
}: {
  children: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}) => {
  const getOrUpdateItem = useUserStore((state) => state.getOrUpdateItem);
  const { idPath: currentDirectoryIdPath } = useNavigationStore(
    (state) => state.currentNavigationPiece
  );
  const selectedItemIds = useSelectionStore((state) => state.selectedItemIds);
  const deleteItems = useOperationStore((state) => state.deleteItems);

  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);

  const dir = getOrUpdateItem(currentDirectoryIdPath);
  const dirContents = dir ? ("contents" in dir ? dir.contents : []) : [];

  type SelectedItemsNames = {
    folders: string[];
    passwordItems: string[];
  };

  const getSelectedItemsNames = () => {
    const folders: string[] = [],
      passwordItems: string[] = [];
    dirContents.forEach((item) => {
      if (!selectedItemIds.has(item.id)) return;
      if ("contents" in item) folders.push(item.title);
      else passwordItems.push(item.title);
    });
    return {
      folders,
      passwordItems,
    };
  };

  const selectedItemNames = getSelectedItemsNames();

  const getTitle = (names: SelectedItemsNames) => {
    const folderCount = names.folders.length,
      passwordCount = names.passwordItems.length;
    if (folderCount > 0) {
      if (passwordCount > 0) {
        return `${folderCount + passwordCount} items`;
      }
      if (folderCount === 1) {
        return names.folders[0];
      }
      return `${folderCount} folders`;
    } else {
      if (passwordCount == 1) {
        return names.passwordItems[0];
      }
      if (passwordCount > 1) {
        return `${passwordCount} passwords`;
      }
      return "";
    }
  };

  const handleDelete = () => {
    deleteItems();
    setIsDeletionDialogOpen(false);
  };

  return (
    <Dialog
      open={isDeletionDialogOpen}
      onOpenChange={(val) => setIsDeletionDialogOpen(val)}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {getTitle(getSelectedItemsNames())}</DialogTitle>
          <DialogDescription>Confirm your choice</DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col items-center mt-6 mb-6">
          <span>Are you sure to delete the selected items?</span>
          <div className="mt-4 flex gap-2">
            {selectedItemNames.folders.length +
              selectedItemNames.passwordItems.length ===
            1 ? (
              <>
                {selectedItemNames.folders.length === 1 ? (
                  <DeletionPreviewTile
                    icon={<i className="fa-solid fa-folder mr-2"></i>}
                    title={selectedItemNames.folders[0]}
                    body={<span className="text-muted-foreground">Folder</span>}
                  />
                ) : (
                  <DeletionPreviewTile
                    icon={<i className="fa-solid fa-key mr-2"></i>}
                    title={selectedItemNames.passwordItems[0]}
                    body={
                      <span className="text-muted-foreground">Password</span>
                    }
                  />
                )}
              </>
            ) : (
              <>
                {selectedItemNames.folders.length > 0 && (
                  <DeletionPreviewTile
                    icon={<i className="fa-solid fa-folder mr-2"></i>}
                    title={selectedItemNames.folders.length}
                    body={
                      <span>
                        Folder{selectedItemNames.folders.length > 1 && "s"}
                      </span>
                    }
                  />
                )}
                {selectedItemNames.passwordItems.length > 0 && (
                  <DeletionPreviewTile
                    icon={<i className="fa-solid fa-key mr-2"></i>}
                    title={selectedItemNames.passwordItems.length}
                    body={
                      <span>
                        Password
                        {selectedItemNames.passwordItems.length > 1 && "s"}
                      </span>
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"secondary"}>Cancel</Button>
          </DialogClose>
          <Button variant={"destructive"} onClick={handleDelete}>
            <i className="fa-regular fa-trash mr-2"></i> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteItemsButtonWrapper;
