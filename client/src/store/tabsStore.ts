import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useHomePostsStore } from "./homePostsStore.ts";

export const MAX_TABS = 12;

export interface AppTab {
  id: string;
  tags: string;
  hasSearched: boolean;
  /** Змінюється при кожному новому пошуку в цій вкладці. */
  searchNonce: number;
}

interface TabsState {
  tabs: AppTab[];
  activeTabId: string;

  /** Нова порожня вкладка. */
  createTab: (options?: { tags?: string; hasSearched?: boolean }) => string | null;
  /** Пошук в окремій вкладці; повторний той самий пошук лише активує її. */
  openSearchTab: (tags: string) => string | null;
  closeTab: (id: string) => void;
  activateTab: (id: string) => void;
  /** Переміщує вкладку на позицію `toIndex` (серед інших вкладок). */
  moveTab: (id: string, toIndex: number) => void;
  /** Пошук у поточній вкладці. */
  submitSearch: (tags: string) => void;
  /** Скидає пошук поточної вкладки. */
  resetActiveSearch: () => void;
}

let tabSequence = 0;

function createTabId() {
  tabSequence += 1;

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `tab_${Date.now().toString(36)}_${tabSequence}`;
}

function makeTab(options?: { tags?: string; hasSearched?: boolean }): AppTab {
  const tags = options?.tags?.trim() ?? "";
  const hasSearched = options?.hasSearched ?? false;

  return {
    id: createTabId(),
    tags,
    hasSearched,
    searchNonce: hasSearched ? 1 : 0,
  };
}

const initialTab = makeTab();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePersistedTab(value: unknown): AppTab | null {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id) {
    return null;
  }

  return {
    id: value.id,
    tags: typeof value.tags === "string" ? value.tags : "",
    hasSearched: value.hasSearched === true,
    searchNonce:
      typeof value.searchNonce === "number" && Number.isFinite(value.searchNonce)
        ? value.searchNonce
        : 0,
  };
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [initialTab],
      activeTabId: initialTab.id,

      createTab: (options) => {
        const state = get();
        if (state.tabs.length >= MAX_TABS) return null;

        const tab = makeTab(options);
        set({
          tabs: [...state.tabs, tab],
          activeTabId: tab.id,
        });

        return tab.id;
      },

      openSearchTab: (tags) => {
        const normalizedTags = tags.trim();
        const state = get();

        const existing = state.tabs.find(
          (tab) => tab.hasSearched && tab.tags === normalizedTags
        );

        if (existing) {
          set({ activeTabId: existing.id });
          return existing.id;
        }

        if (state.tabs.length >= MAX_TABS) return null;

        const tab = makeTab({ tags: normalizedTags, hasSearched: true });
        set({
          tabs: [...state.tabs, tab],
          activeTabId: tab.id,
        });

        return tab.id;
      },

      closeTab: (id) => {
        const state = get();
        const index = state.tabs.findIndex((tab) => tab.id === id);
        if (index === -1) return;

        useHomePostsStore.getState().dropCache(id);

        if (state.tabs.length === 1) {
          const tab = makeTab();
          set({ tabs: [tab], activeTabId: tab.id });
          return;
        }

        const tabs = state.tabs.filter((tab) => tab.id !== id);
        let activeTabId = state.activeTabId;

        if (activeTabId === id) {
          const nextTab = tabs[Math.max(0, index - 1)] ?? tabs[0];
          activeTabId = nextTab.id;
        }

        set({ tabs, activeTabId });
      },

      activateTab: (id) => {
        const state = get();
        if (state.activeTabId === id) return;
        if (!state.tabs.some((tab) => tab.id === id)) return;

        set({ activeTabId: id });
      },

      moveTab: (id, toIndex) => {
        set((state) => {
          const from = state.tabs.findIndex((tab) => tab.id === id);
          if (from === -1) return state;

          const tabs = [...state.tabs];
          const [moved] = tabs.splice(from, 1);
          tabs.splice(Math.max(0, Math.min(toIndex, tabs.length)), 0, moved);

          return { tabs };
        });
      },

      submitSearch: (tags) => {
        const normalizedTags = tags.trim();

        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === state.activeTabId
              ? {
                  ...tab,
                  tags: normalizedTags,
                  hasSearched: true,
                  searchNonce: tab.searchNonce + 1,
                }
              : tab
          ),
        }));
      },

      resetActiveSearch: () => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === state.activeTabId
              ? {
                  ...tab,
                  tags: "",
                  hasSearched: false,
                  searchNonce: tab.searchNonce + 1,
                }
              : tab
          ),
        }));
      },
    }),
    {
      name: "app-tabs-storage",
      version: 1,
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<Pick<TabsState, "tabs" | "activeTabId">>
          | undefined;

        const tabs = Array.isArray(persisted?.tabs)
          ? persisted.tabs
              .map(normalizePersistedTab)
              .filter((tab): tab is AppTab => tab !== null)
          : [];

        if (tabs.length === 0) return currentState;

        const activeTabId =
          typeof persisted?.activeTabId === "string" &&
          tabs.some((tab) => tab.id === persisted.activeTabId)
            ? persisted.activeTabId
            : tabs[0].id;

        return { ...currentState, tabs, activeTabId };
      },
    }
  )
);

export const selectActiveTab = (state: TabsState) =>
  state.tabs.find((tab) => tab.id === state.activeTabId);
