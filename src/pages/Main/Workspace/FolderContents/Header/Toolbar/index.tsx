import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useMemo, useRef, useState } from "react";
import NewItemButton from "./NewItemButton";
import ViewButtonGroup from "./ViewButtonGroup";
import FilterButton from "./FilterButton";
import ItemOpsButtonGroup from "./ItemOpsButtonGroup";
import useSelectionStore from "@/store/selection";
import useUserStore from "@/store/user";
import useExplorerStore from "@/store/explorer";
import Search from "./Search";

const Toolbar = () => {
  const homeDirectory = useUserStore((state) => state.userDirectory);

  const selectionMode = useSelectionStore((state) => state.selectionMode);
  const setSelectionMode = useSelectionStore((state) => state.setSelectionMode);
  const deselectAll = useSelectionStore((state) => state.deselectAll);
  const filter = useExplorerStore((state) => state.filter);
  const setFilter = useExplorerStore((state) => state.setFilter);

  const viewModeState = useState(0);

  const handleSelectionModeToggle = () => {
    if (selectionMode) {
      deselectAll();
      setSelectionMode(false);
    } else {
      setSelectionMode(true);
    }
  };

  const [toolbarWidth, setToolbarWidth] = useState(0);
  const obs = useMemo(() => {
    return new ResizeObserver((entries) => {
      setToolbarWidth(entries[0].borderBoxSize[0].inlineSize);
    });
  }, []);

  const thisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!thisRef.current) return;
    const toolbar = thisRef.current;
    obs.observe(toolbar);

    return () => {
      obs.unobserve(toolbar);
    };
  }, [thisRef]);

  return (
    <div className="mt-4 flex items-center justify-between" ref={thisRef}>
      {homeDirectory && (
        <div className="flex items-center gap-6">
          <NewItemButton />
          <div className="flex items-center gap-1">
            <Button
              size={"sm"}
              variant={selectionMode ? "default" : "outline"}
              onClick={handleSelectionModeToggle}
            >
              <i className="text-base fa-regular fa-location-arrow"></i>
            </Button>
          </div>
          <ItemOpsButtonGroup />
          <div className="flex items-center gap-1">
            <FilterButton
              filterOptions={filter}
              onChange={(value) => setFilter(value)}
            />
            <Button size={"sm"} variant={"outline"}>
              <i className="text-base fa-regular fa-arrow-down-arrow-up"></i>
            </Button>
          </div>
          <ViewButtonGroup viewModeState={viewModeState} />
        </div>
      )}
      <Search toolbarWidth={toolbarWidth} />
    </div>
  );
};

export default Toolbar;
