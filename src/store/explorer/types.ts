import { Color } from "../user/types";

export type ViewOption = "GRID" | "LIST";
export type FilterOptions = {
  favourites: {
    favourited: boolean;
    unfavourited: boolean;
  };
  tags: {
    [key in Color]: boolean;
  } & {
    none: boolean;
  };
};
export type SortOption = "A" | "Z" | "NEW" | "OLD";
