import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import autoAnimate from "@formkit/auto-animate";
import React, { useEffect, useRef } from "react";

const Search = ({ toolbarWidth }: { toolbarWidth: number }) => {
  const thisRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    thisRef.current && autoAnimate(thisRef.current, { duration: 150 });
  }, [thisRef]);
  return (
    <div ref={thisRef}>
      {toolbarWidth > 950 ? (
        <Input placeholder="Search" className="h-10 max-w-[300px] rounded-lg" />
      ) : (
        <Button variant={"secondary"}>
          <i className="fa-regular fa-search mr-2"></i>
          Search
        </Button>
      )}
    </div>
  );
};

export default Search;
