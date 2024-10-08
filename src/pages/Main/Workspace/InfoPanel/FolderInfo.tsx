import { Button } from "@/components/ui/button";
import { checkFolderByData, getContentCount } from "@/lib/explorer-utils";
import { Folder } from "@/store/user/types";
import React from "react";

type InfoTileProps = React.HTMLAttributes<HTMLDivElement> & {
  heading: React.ReactNode;
  children: React.ReactNode;
};

const InfoTile = ({ heading, children, ...props }: InfoTileProps) => {
  return (
    <div
      {...props}
      className={`bg-foreground/5 flex flex-col gap-2 rounded-lg p-2 px-3 ${props.className}`}
    >
      <span className="text-sm text-muted-foreground">{heading}</span>
      <div className="w-full">{children}</div>
    </div>
  );
};

const FolderInfo = ({ folder }: { folder: Folder }) => {
  const contentCount = folder
    ? checkFolderByData(folder)
      ? getContentCount(folder)
      : undefined
    : undefined;
  return (
    <div className="w-full">
      <div className="w-full py-8 flex flex-col items-center">
        <div className=" h-[100px] w-[100px] rounded-2xl flex items-center justify-center">
          <i className="fa-solid fa-folder text-8xl text-foreground/20"></i>
        </div>
        <div className="font-bold text-xl mt-2">{folder?.title}</div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={"secondary"}
            size={"sm"}
            className="rounded-full h-10 w-10 inline-flex items-center justify-center"
          >
            <i className="fa-regular fa-pen"></i>
          </Button>
          <Button
            variant={"secondary"}
            size={"sm"}
            className="rounded-full h-10 w-10 inline-flex items-center justify-center"
          >
            <i className="fa-regular fa-star"></i>
          </Button>
          <Button
            variant={"secondary"}
            size={"sm"}
            className="rounded-full h-10 w-10 inline-flex items-center justify-center"
          >
            <i className="fa-regular fa-tag"></i>
          </Button>
        </div>
        <div className="w-full mt-10 grid grid-cols-2 gap-2">
          <InfoTile
            heading={
              <>
                <i className="fa-solid fa-circle-info mr-2"></i>
                <span className="font-bold">About</span>
              </>
            }
            className=" col-span-2 mb-4"
          >
            <div className="w-full">{folder?.description}</div>
          </InfoTile>
          <InfoTile
            heading={
              <>
                <i className="fa-solid fa-folder mr-2"></i>
                <span className="font-bold">Folders</span>
              </>
            }
          >
            <div className="w-full text-right font-bold text-3xl">
              {contentCount ? contentCount.folders : 0}
            </div>
          </InfoTile>
          <InfoTile
            heading={
              <>
                <i className="fa-solid fa-key mr-2"></i>
                <span className="font-bold">Passwords</span>
              </>
            }
          >
            <div className="w-full text-right font-bold text-3xl">
              {contentCount ? contentCount.passwords : 0}
            </div>
          </InfoTile>
          <InfoTile
            heading={
              <>
                <i className="fa-solid fa-calendar-circle-plus mr-2"></i>
                <span className="font-bold">Created</span>
              </>
            }
          >
            <div className="w-full text-right font-bold text-lg">Now</div>
          </InfoTile>
          <InfoTile
            heading={
              <>
                <i className="fa-solid fa-clock mr-2"></i>
                <span className="font-bold">Last Modified</span>
              </>
            }
          >
            <div className="w-full text-right font-bold text-lg">Now</div>
          </InfoTile>
          <InfoTile
            heading={
              <>
                <i className="fa-solid fa-compass mr-2"></i>
                <span className="font-bold">Location</span>
              </>
            }
            className=" col-span-2"
          >
            <div className="w-full text-right font-bold text-base">Home</div>
          </InfoTile>
        </div>
      </div>
    </div>
  );
};

export default FolderInfo;
