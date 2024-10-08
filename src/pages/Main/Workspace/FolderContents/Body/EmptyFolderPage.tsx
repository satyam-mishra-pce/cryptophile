import { Button } from "@/components/ui/button";
import React from "react";

import NewFolderButtonWrapper from "@/components/common/new-folder-button-wrapper";
import NewPasswordButtonWrapper from "@/components/common/new-password-button-wrapper";

const EmptyFolder = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <i className="fa-solid fa-empty-set text-7xl text-foreground/20"></i>
      <div className="text-muted-foreground mt-6">This folder is empty.</div>
      <div className="mt-6 flex items-center gap-2">
        <NewFolderButtonWrapper>
          <Button size={"sm"} variant={"secondary"}>
            <span>
              <i className="fa-regular fa-folder mr-2"></i>
            </span>
            New Folder
          </Button>
        </NewFolderButtonWrapper>
        <NewPasswordButtonWrapper>
          <Button size={"sm"}>
            <span>
              <i className="fa-regular fa-key mr-2"></i>
            </span>
            New Password
          </Button>
        </NewPasswordButtonWrapper>
      </div>
    </div>
  );
};

export default EmptyFolder;
