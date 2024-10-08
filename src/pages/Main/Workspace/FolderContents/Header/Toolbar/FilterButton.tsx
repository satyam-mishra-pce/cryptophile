import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import useStateCallback from "@/hooks/useStateCallback";
import { deepCompare } from "@/lib/utils";
import { FilterOptions } from "@/store/explorer/types";
import { Color, ColorMap } from "@/store/user/types";
import { produce } from "immer";
import { ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

const FilterButton = ({
  filterOptions: value,
  onChange,
}: {
  filterOptions: FilterOptions;
  onChange?: (value: FilterOptions) => void;
}) => {
  const [isOpen, setOpen] = useState(false);
  const [filterOptions, setFilterOptionsWithCallback] = useStateCallback(value);
  const [applied, setApplied] = useState(false);

  const setFilterOptions = (x: React.SetStateAction<FilterOptions>) => {
    setFilterOptionsWithCallback(x, (val) => {
      onChange?.(val);
    });
  };

  const checkAllTrue = (obj: { [key: string]: boolean }) => {
    return Object.keys(obj).every((key) => obj[key as keyof typeof obj]);
  };

  const checkSomeTrue = (obj: { [key: string]: boolean }) => {
    return Object.keys(obj).some((key) => obj[key as keyof typeof obj]);
  };

  const { favourites, tags } = filterOptions;

  type AllCheckedStatus = "ALL" | "NONE" | "SOME";
  const allFavouritesCheckedStatus: AllCheckedStatus = checkAllTrue(favourites)
    ? "ALL"
    : checkSomeTrue(favourites)
    ? "SOME"
    : "NONE";
  const allTagsCheckedStatus: AllCheckedStatus = checkAllTrue(tags)
    ? "ALL"
    : checkSomeTrue(tags)
    ? "SOME"
    : "NONE";

  const setAllKeys = <T extends { [key: string]: boolean }>(
    obj: T,
    value: boolean
  ) => {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      newObj[key] = value;
    });

    return newObj as T;
  };

  const setAllFavourites = useCallback(
    (value?: boolean) => {
      value = value ?? (allFavouritesCheckedStatus !== "ALL" ? true : false);
      setFilterOptions((prev) =>
        produce(prev, (draft) => {
          draft.favourites = setAllKeys(favourites, value as boolean);
        })
      );
    },
    [allFavouritesCheckedStatus]
  );

  const setAllTags = useCallback(
    (value?: boolean) => {
      value = value ?? (allTagsCheckedStatus !== "ALL" ? true : false);
      setFilterOptions((prev) =>
        produce(prev, (draft) => {
          draft.tags = setAllKeys(tags, value as boolean);
        })
      );
    },
    [allTagsCheckedStatus]
  );

  const unapplyFilters = () => {
    setFilterOptions({
      favourites: setAllKeys(favourites, false),
      tags: setAllKeys(tags, false),
    });
  };

  useEffect(() => {
    if (deepCompare(value, filterOptions)) return;
    setFilterOptionsWithCallback(value);
  }, [value]);

  useEffect(() => {
    if (
      checkSomeTrue(filterOptions.favourites) ||
      checkSomeTrue(filterOptions.tags)
    ) {
      setApplied(true);
    } else {
      setApplied(false);
    }
  }, [filterOptions]);

  useEffect(() => {
    if (!applied) {
      unapplyFilters();
    }
  }, [applied]);

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(val) => {
        if (val) {
          setOpen(val);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <i
            className={`text-base ${
              applied ? "fa-solid" : "fa-regular"
            } fa-filter`}
          ></i>
          <ChevronsUpDown className="h-5 ml-2 -mr-2 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onInteractOutside={() => setOpen(false)}
        onEscapeKeyDown={() => setOpen(false)}
        className="min-w-44"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <i className="fa-solid fa-star mr-1 text-muted-foreground/50"></i>
            Favourites
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={applied && allFavouritesCheckedStatus === "ALL"}
            onClick={() => setAllFavourites()}
          >
            All
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={applied && favourites.favourited}
            onClick={() =>
              setFilterOptions((prev) =>
                produce(prev, (draft) => {
                  draft.favourites.favourited = !draft.favourites.favourited;
                })
              )
            }
          >
            Favourited
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={applied && favourites.unfavourited}
            onClick={() =>
              setFilterOptions((prev) =>
                produce(prev, (draft) => {
                  draft.favourites.unfavourited =
                    !draft.favourites.unfavourited;
                })
              )
            }
          >
            Unfavourited
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {" "}
            <i className="fa-solid fa-tag mr-1 text-muted-foreground/50"></i>
            Tags
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={allTagsCheckedStatus === "ALL"}
            onClick={() => setAllTags()}
          >
            All
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem
            onClick={() => {
              setFilterOptions((prev) =>
                produce(prev, (draft) => {
                  draft.tags.none = !draft.tags.none;
                })
              );
            }}
          >
            <div className="h-5 w-5 rounded-full border-2 border-foreground/10 inline-flex items-center justify-center mr-2">
              {applied && filterOptions.tags.none && (
                <i className="fa-solid fa-check text-xs"></i>
              )}
            </div>
            <span className="capitalize">Untagged</span>
          </DropdownMenuItem>
          {Object.keys(ColorMap).map((color) => {
            const tagColor = color as Color;
            return (
              <DropdownMenuItem
                key={color}
                onClick={() => {
                  setFilterOptions((prev) =>
                    produce(prev, (draft) => {
                      draft.tags[tagColor] = !draft.tags[tagColor];
                    })
                  );
                }}
              >
                <div
                  className="h-5 w-5 rounded-full border-2 border-foreground/10 inline-flex items-center justify-center mr-2"
                  style={{
                    background: `rgb(${ColorMap[tagColor]})`,
                  }}
                >
                  {applied && filterOptions.tags[tagColor] && (
                    <i className="fa-solid fa-check text-xs text-white"></i>
                  )}
                </div>
                <span className="capitalize">{color.toLowerCase()}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              unapplyFilters();
            }}
            disabled={!applied}
          >
            Clear all filters
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterButton;
