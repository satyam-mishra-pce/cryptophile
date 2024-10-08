import React, { useEffect, useRef } from "react";
import FolderContents from "./FolderContents";
import InfoPanel from "./InfoPanel";
import autoAnimate from "@formkit/auto-animate";
import useExplorerStore from "@/store/explorer";

const Workspace = () => {
  const passwordEditorMode = useExplorerStore(
    (state) => state.passwordEditorMode
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapperRef.current && autoAnimate(wrapperRef.current);
  }, [wrapperRef]);

  return (
    <div className="flex-1">
      <div className="w-full h-full flex items-start" ref={wrapperRef}>
        {!passwordEditorMode && <FolderContents />}
        <InfoPanel />
        {/* <InfoPanel /> */}
      </div>
    </div>
  );
};

export default Workspace;
