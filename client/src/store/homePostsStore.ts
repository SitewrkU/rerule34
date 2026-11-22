import { create } from "zustand";
import type { Post } from "@rerule34/shared/types/post.ts";
import { getPosts } from "../utils/api/posts.ts";

export const PAGE_SIZE = 30; // постів на одну сторінку
export const PAGES_PER_BATCH = 3; // к-ть сторінок які тягнуться за запит
export const BATCH_SIZE = PAGE_SIZE * PAGES_PER_BATCH; // для апі, скільки всього треба повернути

export const EMPTY_POSTS: Post[] = [];

export interface HomePostsCache {
  query: string;
  handledNonce: number;
  requestId: number;

  allPosts: Post[];
  loadedBatches: number;
  hasMore: boolean;

  page: number;
  maxPageReached: number;
  scrollY: number;
}

interface HomePostsState {
  /** Кеш постів окремо для кожної вкладки. */
  caches: Record<string, HomePostsCache>;

  /** true — треба вантажити першу партію; той самий пошук не скидається. */
  beginSearch: (
    tabId: string,
    query: string,
    searchNonce: number,
    hasSearched: boolean
  ) => boolean;

  loadBatch: (tabId: string, query: string, batchIndex: number) => Promise<void>;
  setPage: (tabId: string, page: number) => void;
  setScrollY: (tabId: string, y: number) => void;
  dropCache: (tabId: string) => void;
}

function createCache(): HomePostsCache {
  return {
    query: "",
    handledNonce: -1,
    requestId: 0,

    allPosts: [],
    loadedBatches: 0,
    hasMore: true,

    page: 1,
    maxPageReached: 1,
    scrollY: 0,
  };
}

export const useHomePostsStore = create<HomePostsState>()((set, get) => ({
  caches: {},

  beginSearch: (tabId, query, searchNonce, hasSearched) => {
    const cache = get().caches[tabId] ?? createCache();
    const sameSearch =
      cache.query === query && cache.handledNonce === searchNonce;

    if (sameSearch) {
      // Пости вже є — не перезавантажуємо при поверненні на вкладку.
      return hasSearched && cache.allPosts.length === 0;
    }

    set((state) => ({
      caches: {
        ...state.caches,
        [tabId]: {
          ...createCache(),
          query,
          handledNonce: searchNonce,
          requestId: cache.requestId + 1,
        },
      },
    }));

    return hasSearched;
  },

  loadBatch: async (tabId, query, batchIndex) => {
    const requestId = get().caches[tabId]?.requestId ?? 0;

    const data = await getPosts({
      tags: query,
      limit: BATCH_SIZE,
      pid: batchIndex,
    });

    const state = get();
    const cache = state.caches[tabId];

    // Вкладку закрили або в ній уже новий пошук — ігноруємо відповідь.
    if (!cache || cache.requestId !== requestId || cache.query !== query) return;

    set({
      caches: {
        ...state.caches,
        [tabId]: {
          ...cache,
          allPosts: batchIndex === 0 ? data : [...cache.allPosts, ...data],
          loadedBatches: Math.max(cache.loadedBatches, batchIndex + 1),
          hasMore: data.length === BATCH_SIZE,
        },
      },
    });
  },

  setPage: (tabId, page) =>
    set((state) => {
      const cache = state.caches[tabId];
      if (!cache) return state;

      return {
        caches: {
          ...state.caches,
          [tabId]: {
            ...cache,
            page,
            maxPageReached: Math.max(cache.maxPageReached, page),
            scrollY: 0,
          },
        },
      };
    }),

  setScrollY: (tabId, y) =>
    set((state) => {
      const cache = state.caches[tabId];
      if (!cache || cache.scrollY === y) return state;

      return {
        caches: {
          ...state.caches,
          [tabId]: { ...cache, scrollY: y },
        },
      };
    }),

  dropCache: (tabId) =>
    set((state) => {
      if (!state.caches[tabId]) return state;

      const caches = { ...state.caches };
      delete caches[tabId];
      return { caches };
    }),
}));
