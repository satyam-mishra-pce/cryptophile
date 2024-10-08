import { Button } from "@/components/ui/button";
import useExplorerStore, { DEFAULT_STATE } from "@/store/explorer";
import React from "react";

const NoFilterMatch = () => {
  const setFilter = useExplorerStore((state) => state.setFilter);
  const clearAllFilters = () => {
    setFilter(DEFAULT_STATE.filter);
  };
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <i className="fa-solid fa-empty-set text-7xl text-foreground/20"></i>
      <div className="text-muted-foreground mt-6">
        No items match the applied filter.
      </div>
      <div className="mt-6 flex items-center gap-2">
        <Button onClick={clearAllFilters}>Clear all filters</Button>
      </div>
    </div>
  );
};

export default NoFilterMatch;
