import { Button } from "@/components/ui/button";
import { getItemByPath } from "@/lib/explorer-utils";
import useExplorerStore from "@/store/explorer";
import useUserStore from "@/store/user";
import { useShallow } from "zustand/react/shallow";
import { shallow } from "zustand/shallow";
import React from "react";
import { PasswordItem } from "@/store/user/types";

type InfoTileProps = React.HTMLAttributes<HTMLDivElement> & {
  heading: React.ReactNode;
  toolbox?: React.ReactNode;
  children: React.ReactNode;
};

const InfoTile = ({ heading, children, toolbox, ...props }: InfoTileProps) => {
  return (
    <div
      {...props}
      className={`bg-foreground/5 flex flex-col gap-2 rounded-lg p-2 px-3 ${props.className} group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{heading}</span>
        <div className="opacity-50 focus-within:opacity-100 group-hover:opacity-100">
          {toolbox}
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

const PasswordInfo = ({ passwordItem }: { passwordItem: PasswordItem }) => {
  const passwordEditorMode = useExplorerStore(
    (state) => state.passwordEditorMode
  );
  const setPasswordEditorMode = useExplorerStore(
    (state) => state.setPasswordEditorMode
  );

  return (
    <div className="relative w-full">
      {!passwordEditorMode && (
        <Button
          variant={"secondary"}
          className="absolute top-0 right-0 h-10 w-10 rounded-full"
          onClick={() => setPasswordEditorMode()}
        >
          <i className="fa-regular fa-expand"></i>
        </Button>
      )}
      <div
        className={`w-full ${
          passwordEditorMode ? "pt-4" : ""
        } pb-8 flex flex-col items-center`}
      >
        <div
          className={`w-full flex ${
            passwordEditorMode
              ? "items-start border-b border-b-border pb-4 px-4"
              : "flex-col items-center"
          }`}
        >
          {passwordEditorMode && (
            <Button
              onClick={() => setPasswordEditorMode(false)}
              size={"sm"}
              variant={"ghost"}
              className="mr-4"
            >
              <i className="fa-regular fa-chevron-left mr-2"></i>
              <span>Back</span>
            </Button>
          )}
          <div
            className={`${
              passwordEditorMode
                ? "h-[80px] w-[80px] text-6xl"
                : "h-[120px] w-[120px] text-8xl"
            } rounded-2xl flex items-center justify-center`}
          >
            <i className="fa-solid fa-key text-foreground/20"></i>
          </div>
          <div
            className={`${
              passwordEditorMode
                ? "ml-4 flex-1 gap-2 items-start"
                : "mt-4 gap-4 items-center"
            } flex flex-col`}
          >
            <div className="font-bold text-xl">{passwordItem?.title}</div>
            <div className="flex items-center gap-2">
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
          </div>
        </div>
        <div className="flex flex-col max-w-2xl items-center w-full">
          <div className="w-full mt-10 grid grid-cols-2 gap-2">
            <InfoTile
              heading={
                <>
                  <i className="fa-solid fa-globe mr-2"></i>
                  <span className="font-bold">Website</span>
                </>
              }
              toolbox={
                <div className="w-full text-foreground/50 gap-3 flex">
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-copy"></i>
                  </button>
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-link"></i>
                  </button>
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>
              }
              className=" col-span-2"
            >
              <div className="w-full font-bold">{"https://www.google.com"}</div>
            </InfoTile>
            <InfoTile
              heading={
                <>
                  <i className="fa-solid fa-user mr-2"></i>
                  <span className="font-bold">Username</span>
                </>
              }
              toolbox={
                <div className="w-full text-foreground/50 gap-3 flex">
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-copy"></i>
                  </button>
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>
              }
              className=" col-span-2"
            >
              <div className="w-full font-bold">{"@satyammishra"}</div>
            </InfoTile>
            <InfoTile
              heading={
                <>
                  <i className="fa-solid fa-key mr-2"></i>
                  <span className="font-bold">Password</span>
                </>
              }
              toolbox={
                <div className="w-full text-foreground/50 gap-3 flex">
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-copy"></i>
                  </button>
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button className="text-sm hover:text-foreground/80">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>
              }
              className=" col-span-2"
            >
              <input
                className="w-full font-bold bg-transparent border-0 outline-none"
                type="password"
                value={"        "}
                disabled
              />
            </InfoTile>
          </div>
          <div className="w-full mt-6 grid grid-cols-2 gap-2">
            <InfoTile
              heading={
                <>
                  <i className="fa-solid fa-circle-info mr-2"></i>
                  <span className="font-bold">About</span>
                </>
              }
              className=" col-span-2 mb-4"
            >
              <div className="w-full">{passwordItem?.description}</div>
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
    </div>
  );
};

export default PasswordInfo;
