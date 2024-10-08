import React, { useEffect, useRef, useState } from "react";
import FolderInfo from "./FolderInfo";
import PasswordInfo from "./PasswordInfo";
import useNavigationStore from "@/store/navigation";
import useSelectionStore from "@/store/selection";
import useExplorerStore from "@/store/explorer";
import useUserStore from "@/store/user";
import { Folder, PasswordItem } from "@/store/user/types";
import { Button } from "@/components/ui/button";
import autoAnimate from "@formkit/auto-animate";

const InfoPanel = ({}: {}) => {
  const { idPath: currentDirectoryIdPath } = useNavigationStore(
    (state) => state.currentNavigationPiece
  );
  const selectedItemIds = useSelectionStore((state) => state.selectedItemIds);
  const passwordEditorMode = useExplorerStore(
    (state) => state.passwordEditorMode
  );
  const propertiesPanelVisibility = useExplorerStore(
    (state) => state.propertiesPanelVisibility
  );
  const setPropertiesPanelVisibility = useExplorerStore(
    (state) => state.setPropertiesPanelVisibility
  );
  const { getOrUpdateItem } = useUserStore();

  const [infoItemPath, setInfoItemPath] = useState<string[]>(
    currentDirectoryIdPath
  );
  const [infoItem, setInfoItem] = useState<Folder | PasswordItem | undefined>();
  getOrUpdateItem(infoItemPath);

  useEffect(() => {
    if (selectedItemIds.size !== 1) {
      setInfoItemPath(currentDirectoryIdPath);
      setInfoItem(getOrUpdateItem(currentDirectoryIdPath));
      return;
    }
    setInfoItemPath([
      ...currentDirectoryIdPath,
      Array.from(selectedItemIds)[0],
    ]);
    setInfoItem(
      getOrUpdateItem([
        ...currentDirectoryIdPath,
        Array.from(selectedItemIds)[0],
      ])
    );
  }, [selectedItemIds, currentDirectoryIdPath]);

  const thisRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    thisRef.current && autoAnimate(thisRef.current);
  }, [thisRef]);

  return (
    <div
      className={`${
        propertiesPanelVisibility
          ? "min-w-[300px] w-full"
          : passwordEditorMode
          ? "w-full"
          : "w-20"
      } ${
        passwordEditorMode ? "" : "max-w-[400px] px-4 py-4"
      } shrink-0 border-l border-l-border h-full relative transition-all duration-500`}
      ref={thisRef}
    >
      {
        (propertiesPanelVisibility || passwordEditorMode) &&
          infoItemPath &&
          infoItem &&
          ("contents" in infoItem ? (
            <FolderInfo folder={infoItem} />
          ) : (
            // null
            <PasswordInfo passwordItem={infoItem} />
          ))
        // null
      }
      {!passwordEditorMode && (
        <Button
          variant={"outline"}
          className="absolute top-4 left-5 h-10 w-10 rounded-full z-30"
          onClick={() => {
            setPropertiesPanelVisibility();
          }}
        >
          <i
            className={`fa-regular fa-chevron-right ${
              propertiesPanelVisibility ? "" : "rotate-180"
            } transition`}
          ></i>
        </Button>
      )}
    </div>
  );
};

export default InfoPanel;
