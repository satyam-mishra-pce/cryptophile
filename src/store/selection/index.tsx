import { create } from "zustand";
import useUserStore, { checkIsFolder } from "../user";
import useNavigationStore from "../navigation";

type State = {
  selectionMode: boolean;
  selectedItemIds: Set<string>;
};

type Action = {
  setSelectionMode: (value?: boolean) => void;
  selectItems: (itemIds: string[]) => void;
  reselectItems: (itemIds: string[]) => void;
  deselectItems: (itemIds: string[]) => void;
  selectAll: () => void;
  deselectAll: (selectionMode?: boolean) => void;
  checkItemSelected: (itemId: string) => boolean;
};

const useSelectionStore = create<State & Action>()((set) => {
  return {
    selectionMode: false,
    selectedItemIds: new Set<string>(),
    setSelectionMode: (value?: boolean) => {
      set((state) => {
        value ??= !state.selectionMode;
        return {
          selectionMode: value,
          ...(value ? {} : { selectedItemIds: new Set<string>() }),
        };
      });
    },
    selectItems: (itemIds: string[]) =>
      set((state) => {
        const currentDirIdPath =
          useNavigationStore.getState().currentNavigationPiece.idPath;
        const currentDir = useUserStore
          .getState()
          .getOrUpdateItem(currentDirIdPath);
        if (!checkIsFolder(currentDir)) {
          throw new Error("Directory is not available");
        }
        const itemIdsSet = new Set(itemIds);
        const selectedItemIds = new Set(state.selectedItemIds);
        currentDir.contents.forEach((item) => {
          if (itemIdsSet.has(item.id)) {
            selectedItemIds.add(item.id);
          }
        });
        return { selectedItemIds, selectionMode: true };
      }),
    reselectItems: (itemIds: string[], selectionMode?: boolean) =>
      set((state) => {
        state.deselectAll();
        if (itemIds.length > 0) state.selectItems(itemIds);
        return {
          selectionMode: selectionMode ?? itemIds.length > 1,
        };
      }),
    deselectItems: (itemIds: string[]) =>
      set((state) => {
        const selectedItemIds = new Set(state.selectedItemIds);
        itemIds.forEach((itemId) => {
          selectedItemIds.delete(itemId);
        });
        return {
          selectedItemIds,
        };
      }),
    selectAll: () =>
      set(() => {
        const currentDirIdPath =
          useNavigationStore.getState().currentNavigationPiece.idPath;
        const currentDir = useUserStore
          .getState()
          .getOrUpdateItem(currentDirIdPath);
        if (!checkIsFolder(currentDir)) {
          throw new Error("Directory is not available");
        }
        const selectedItemIds = new Set(
          currentDir.contents.map((item) => item.id)
        );
        return { selectionMode: true, selectedItemIds };
      }),
    deselectAll: (selectionMode?: boolean) => {
      set(() => ({
        selectionMode: selectionMode ?? false,
        selectedItemIds: new Set(),
      }));
    },
    checkItemSelected: (itemId: string) => {
      let isItemSelected = false;
      set((state) => {
        isItemSelected = state.selectedItemIds.has(itemId);
        return {};
      });
      return isItemSelected;
    },
  } satisfies State & Action;
});

export default useSelectionStore;
