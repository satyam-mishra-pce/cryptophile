import useUserStore from "@/store/user";
import { create } from "zustand";
import { IdPath, NavigationPiece } from "./types";
import useSelectionStore from "../selection";

type State = {
  backStack: NavigationPiece[];
  forwardStack: NavigationPiece[];
  currentNavigationPiece: NavigationPiece;
};

type Action = {
  push: (path: IdPath, selectionItemId?: string, clearStack?: boolean) => void;
  pop: (selectionItemId?: string) => void;
  unpop: (selectionItemId?: string) => void;
};

const DEFAULT_PATH: IdPath = [];

const useNavigationStore = create<State & Action>((set) => {
  const reset = () => {
    set({
      currentNavigationPiece: {
        idPath: DEFAULT_PATH,
        selectedItemIds: new Set<string>(),
      },
      backStack: [],
      forwardStack: [],
    } satisfies State);
  };

  const getSelectedItemIds = () => {
    return structuredClone(useSelectionStore.getState().selectedItemIds);
  };

  const selectAfterNavigation = (selectedItemIds: Set<string>) => {
    useSelectionStore.getState().reselectItems(Array.from(selectedItemIds));
  };

  useUserStore.subscribe(({ userDirectory }) => {
    if (!userDirectory) {
      reset();
    }
  });

  return {
    currentNavigationPiece: {
      idPath: DEFAULT_PATH,
      selectedItemIds: new Set<string>(),
    },
    backStack: [],
    forwardStack: [],
    push: (path: IdPath, selectionItemId?: string, clearStack?: boolean) => {
      const selectedItemIds = getSelectedItemIds();
      set((state) => {
        const currentIdPath = [...state.currentNavigationPiece.idPath];
        const newState = {
          currentNavigationPiece: {
            idPath: path,
            selectedItemIds: new Set<string>(
              selectionItemId ? [selectionItemId] : []
            ),
          },
          backStack: clearStack
            ? []
            : [...state.backStack, { idPath: currentIdPath, selectedItemIds }],
          forwardStack: [],
        } satisfies Partial<State & Action>;
        return newState;
      });
      set((state) => {
        selectAfterNavigation(state.currentNavigationPiece.selectedItemIds);
        return {};
      });
    },
    pop: (selectionItemId?: string) => {
      let isBackStackEmpty = false;
      set((state) => {
        isBackStackEmpty = state.backStack.length === 0;
        if (isBackStackEmpty) return {};
        const selectedItemIds = getSelectedItemIds();
        const backStackTemp = [...state.backStack];
        const lastNavPiece = backStackTemp.pop() as NavigationPiece;
        const newState = {
          backStack: [...backStackTemp],
          currentNavigationPiece: {
            ...structuredClone(lastNavPiece),
            ...(selectionItemId
              ? { selectedItemIds: new Set([selectionItemId]) }
              : {}),
          },
          forwardStack: [
            ...state.forwardStack,
            {
              ...structuredClone(state.currentNavigationPiece),
              selectedItemIds,
            },
          ],
        } satisfies Partial<State & Action>;
        return newState;
      });
      if (isBackStackEmpty) return;
      set((state) => {
        selectAfterNavigation(state.currentNavigationPiece.selectedItemIds);
        return {};
      });
    },
    unpop: (selectionItemId?: "_" | string) => {
      let isForwardStackEmpty = false;
      set((state) => {
        isForwardStackEmpty = state.forwardStack.length === 0;
        if (isForwardStackEmpty) return {};
        const selectedItemIds = getSelectedItemIds();
        const forwardStackTemp = [...state.forwardStack];
        const nextNavPiece = forwardStackTemp.pop() as NavigationPiece;
        const newState = {
          backStack: [
            ...state.backStack,
            {
              ...structuredClone(state.currentNavigationPiece),
              selectedItemIds,
            },
          ],
          currentNavigationPiece: {
            ...structuredClone(nextNavPiece),
            ...(selectionItemId
              ? { selectedItemIds: new Set([selectionItemId]) }
              : {}),
          },
          forwardStack: [...forwardStackTemp],
        } satisfies Partial<State & Action>;
        return newState;
      });
      if (isForwardStackEmpty) return;
      set((state) => {
        selectAfterNavigation(state.currentNavigationPiece.selectedItemIds);
        return {};
      });
    },
  } as State & Action;
});

export default useNavigationStore;
