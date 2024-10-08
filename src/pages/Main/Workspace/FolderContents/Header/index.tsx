import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Toolbar from "./Toolbar";
import useNavigationStore from "@/store/navigation";
import { IdPath, NavigationPiece } from "@/store/navigation/types";
import useUserStore from "@/store/user";
import { Folder, PasswordItem } from "@/store/user/types";

const BreadCrumb = ({
  idPath,
  namePath,
  push,
}: {
  idPath: string[];
  namePath: string[];
  push: (path: IdPath, selectionItemId?: string, clearStack?: boolean) => void;
}) => {
  const idPathWithHome = ["home", ...idPath];
  return (
    <>
      {idPathWithHome.map((itemId, idx) => {
        return (
          <Button
            variant={"ghost"}
            className="font-bold text-xl px-1"
            key={itemId}
            onClick={() => push(idPath.slice(0, idx))}
          >
            {namePath[idx]}{" "}
            {idx !== idPathWithHome.length - 1 && (
              <span>
                {" "}
                <i className="fa-solid fa-chevron-right text-lg text-muted-foreground ml-2 mr-1"></i>
              </span>
            )}
          </Button>
        );
      })}
    </>
  );
};

const Header = () => {
  const { push, pop, unpop, backStack, forwardStack, currentNavigationPiece } =
    useNavigationStore();

  const currentDirIdPath = currentNavigationPiece.idPath;
  const homeDirectory = useUserStore((state) => state.userDirectory);

  const [isBreadCrumbMode, setBreadCrumbMode] = useState(false);

  const getDirectoryNamePath = (): string[] => {
    if (!homeDirectory) return [];

    let initialContents: (Folder | PasswordItem)[] = homeDirectory.contents;
    const namePath: string[] = ["Home"];
    for (let i = 0; i < currentDirIdPath.length; i++) {
      const currentItem = initialContents.find(
        (item) => item.id === currentDirIdPath[i]
      );
      if (!currentItem) return [];
      if (!("contents" in currentItem)) return [];
      namePath.push(currentItem.title);
      initialContents = [...currentItem.contents];
    }

    return namePath;
  };

  const directoryNamePath = getDirectoryNamePath();

  return (
    <div className="w-full p-4 border-b border-b-border sticky">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className=""
            disabled={backStack.length === 0}
            onClick={() => {
              pop();
            }}
          >
            <i className="fa-solid fa-chevron-left text-xl"></i>
          </Button>
          <Button
            variant="ghost"
            disabled={forwardStack.length === 0}
            className="mr-2"
            onClick={() => {
              unpop();
            }}
          >
            <i className="fa-solid fa-chevron-right text-xl"></i>
          </Button>
          {isBreadCrumbMode ? (
            <BreadCrumb
              namePath={directoryNamePath}
              idPath={currentDirIdPath}
              push={push}
            />
          ) : (
            <h1 className="font-bold text-2xl">
              {directoryNamePath[directoryNamePath.length - 1]}
            </h1>
          )}
        </div>
        <div className="flex items-center">
          <Button
            variant={currentDirIdPath.length === 1 ? "ghost" : "outline"}
            onClick={() => push([])}
            className="mr-1 px-0 w-12"
          >
            <i className="fa-solid fa-home text-xl"></i>
          </Button>
          <Button
            variant={isBreadCrumbMode ? "secondary" : "outline"}
            onClick={() => setBreadCrumbMode((prev) => !prev)}
            className="px-0 w-12 group"
          >
            <i className="fa-regular fa-compass text-lg group-hover:rotate-90 transition"></i>
          </Button>
        </div>
      </div>
      <Toolbar />
    </div>
  );
};

export default Header;
