import React from "react";

import useNavigationStore from "@/store/navigation";
import { Folder } from "@/store/user/types";
import useUserStore, { checkIsFolder } from "@/store/user";

type FolderProps = {
  folderData: Folder;
  isActive?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

const FolderItem = ({
  folderData,
  isActive = false,
  ...props
}: FolderProps) => {
  return (
    <button
      className={`w-full ${
        isActive ? "bg-foreground/10" : "hover:bg-foreground/5"
      } inline-flex items-center gap-2 rounded-md px-2 py-1 group justify-between`}
      {...props}
    >
      <div className="flex items-center gap-2">
        <i
          className={`fa-solid fa-folder-closed ${
            isActive ? "text-foreground" : "text-foreground/60"
          } group-hover:text-foreground`}
        ></i>
        <span>{folderData.title}</span>
      </div>
      {/* <div className="flex items-center gap-2 mr-1 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 focus-within:opacity-100">
        <i className="text-sm fa-regular fa-pen text-muted-foreground hover:text-foreground "></i>
        <i className="text-sm fa-regular fa-trash text-muted-foreground hover:text-destructive "></i>
      </div> */}
    </button>
  );
};

type FolderTableProps = {
  // foldersData: Folder[];
};

const FolderTable = ({}: FolderTableProps) => {
  const homeDirectory = useUserStore((state) => state.userDirectory);
  const { idPath: currentDirIdPath } = useNavigationStore(
    (state) => state.currentNavigationPiece
  );
  const push = useNavigationStore((state) => state.push);

  const folders = homeDirectory?.contents.filter((item) => checkIsFolder(item));

  return (
    <>
      {folders && folders.length > 0 ? (
        folders.map((folder) => {
          return (
            <FolderItem
              folderData={folder as Folder}
              isActive={currentDirIdPath?.[1] === folder.id}
              onClick={() => {
                push([folder.id]);
              }}
              key={folder.id}
            />
          );
        })
      ) : (
        <div className="bg-foreground/5 rounded-md px-3 py-3 text-center mt-2">
          <span className="text-muted-foreground font-normal">
            Folders appear here.
          </span>
        </div>
      )}
    </>
  );
};

export default FolderTable;
