import { create } from "zustand";
import { FilterOptions, SortOption, ViewOption } from "./types";
import useUserStore from "../user";
import { Color, Folder, PasswordItem } from "../user/types";
import useSelectionStore from "../selection";
import useNavigationStore from "../navigation";

type State = {
  sort: SortOption | undefined;
  filter: FilterOptions;
  view: ViewOption;
  passwordEditorMode: boolean;
  propertiesPanelVisibility: boolean;
};

type Action = {
  setSort: (value: SortOption | undefined) => void;
  setFilter: (value: FilterOptions) => void;
  setView: (value: ViewOption) => void;
  setPasswordEditorMode: (value?: boolean) => void;
  setPropertiesPanelVisibility: (value?: boolean) => void;
};

export const DEFAULT_STATE = {
  sort: undefined,
  filter: {
    favourites: {
      favourited: false,
      unfavourited: false,
    },
    tags: {
      AMBER: false,
      BLUE: false,
      GREEN: false,
      RED: false,
      VIOLET: false,
      none: false,
    },
  },
  view: "GRID",
  passwordEditorMode: false,
  propertiesPanelVisibility: true,
} satisfies State;

export const filterContents = (
  contents: (Folder | PasswordItem)[],
  filterOptions: FilterOptions
) => {
  type BooleanRecords = { [key: string]: boolean };
  const checkAllKeys = <T extends BooleanRecords>(
    obj: T,
    compareWith?: boolean
  ) => {
    return Object.keys(obj).every((key) => obj[key] === (compareWith ?? true));
  };
  const favourites = filterOptions.favourites;
  const tags = filterOptions.tags;
  const isFavouriteFilterDisabled =
    checkAllKeys(favourites) || checkAllKeys(favourites, false);
  const isTagFilterDisabled = checkAllKeys(tags) || checkAllKeys(tags, false);

  const passesFavouriteFilter = (item: Folder | PasswordItem) => {
    if (isFavouriteFilterDisabled) return true;
    if (favourites.favourited) return item.isFavourite;
    if (favourites.unfavourited) return !item.isFavourite;
    return false;
  };

  const passesTagFilter = (item: Folder | PasswordItem) => {
    if (isTagFilterDisabled) return true;
    const itemTag = item.tag;
    if (!itemTag) return tags.none;
    return tags[itemTag];
  };

  return contents.filter(
    (item) => passesFavouriteFilter(item) && passesTagFilter(item)
  );
};

const useExplorerStore = create<State & Action>((set) => {
  const reset = () => {
    set(DEFAULT_STATE);
  };

  useUserStore.subscribe((state) => {
    if (!state.userDirectory) reset();
  });

  useNavigationStore.subscribe((state) => {
    set({
      filter: DEFAULT_STATE.filter,
    });
  });

  return {
    sort: DEFAULT_STATE.sort,
    filter: DEFAULT_STATE.filter,
    view: DEFAULT_STATE.view,
    passwordEditorMode: DEFAULT_STATE.passwordEditorMode,
    propertiesPanelVisibility: DEFAULT_STATE.propertiesPanelVisibility,
    setSort: (value) => set({ sort: value }),
    setFilter: (value) => {
      set({ filter: value });
      useSelectionStore.getState().deselectAll();
    },
    setView: (value) => set({ view: value }),
    setPasswordEditorMode: (value?: boolean) =>
      set((state) => ({
        passwordEditorMode: value ?? !state.passwordEditorMode,
      })),
    setPropertiesPanelVisibility: (value?: boolean) =>
      set((state) => ({
        propertiesPanelVisibility: value ?? !state.propertiesPanelVisibility,
      })),
  } satisfies State & Action;
});

export default useExplorerStore;
