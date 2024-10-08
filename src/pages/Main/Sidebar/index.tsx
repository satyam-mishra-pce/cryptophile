import React from "react";
import UserOptions from "./UserOptions";
import FolderTable from "./FolderTable";
import ColorTag from "./ColorTag";
import Favourites from "./Favourites";
import { Color, ColorMap } from "@/store/user/types";

const Sidebar = () => {
  return (
    <div className="min-w-[240px] bg-foreground/5 border-r border-r-border h-full">
      <div className="flex flex-col h-full justify-between">
        <div className="flex flex-col p-3 gap-4">
          <UserOptions />
          <div className="flex flex-col gap-1">
            <div className="font-bold text-sm p-1">
              <span>Favourites</span>
            </div>
            {<Favourites />}
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-bold text-sm p-1">
              <span>Folders</span>
            </div>
            {<FolderTable />}
          </div>
        </div>

        <div className="flex p-4 items-center justify-between">
          <img
            src="/assets/images/icon-textured.png"
            className="h-5 opacity-80"
            alt=""
          />
          <span className="text-sm text-muted-foreground">
            <b>Cryptophile</b> v1.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
