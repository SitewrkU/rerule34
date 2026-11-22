import { create } from "zustand";
import type { Post } from "@rerule34/shared/types/post.ts";
import { getPosts } from "../utils/api/posts.ts";

export const PAGE_SIZE = 30; // постів на одну сторінку
export const PAGES_PER_BATCH = 3; // к-ть сторінок які тягнуться за запит
export const BATCH_SIZE = PAGE_SIZE * PAGES_PER_BATCH; // для апі, скільки всього треба повернути

interface HomePostsState {
  query: string;
  handledSearchTrigger: number;
  requestId: number;

  allPosts: Post[];
  loadedBatches: number;
  hasMore: boolean;

  page: number;
  maxPageReached: number;
  scrollY: number;

  /**
   * Повертає true, якщо для поточного запиту треба завантажити першу партію.
   * Якщо це той самий пошук, який уже має закешовані пости, нічого не скидає.
   */
  beginSearch: (query: string, searchTrigger: number, hasSearched: boolean) => boolean;

  loadBatch: (query: string, batchIndex: number) => Promise<void>;
  setPage: (page: number) => void;
  resetPage: () => void;
  setScrollY: (y: number) => void;
}

const initialState = {
  query: "",
  handledSearchTrigger: -1,
  requestId: 0,

  allPosts: [] as Post[],
  loadedBatches: 0,
  hasMore: true,

  page: 1,
  maxPageReached: 1,
  scrollY: 0,
};

export const useHomePostsStore = create<HomePostsState>()((set, get) => ({
  ...initialState,

  beginSearch: (query, searchTrigger, hasSearched) => {
    const state = get();
    const sameSearch =
      state.query === query && state.handledSearchTrigger === searchTrigger;

    if (sameSearch) {
      // Пости вже є — нічого не перезавантажуємо (повернення з іншої сторінки).
      return hasSearched && state.allPosts.length === 0;
    }

    set({
      query,
      handledSearchTrigger: searchTrigger,
      requestId: state.requestId + 1,

      allPosts: [],
      loadedBatches: 0,
      hasMore: true,

      page: 1,
      maxPageReached: 1,
      scrollY: 0,
    });

    return hasSearched;
  },

  loadBatch: async (query, batchIndex) => {
    const requestId = get().requestId;

    const data = await getPosts({
      tags: query,
      limit: BATCH_SIZE,
      pid: batchIndex,
    });

    const state = get();

    // Поки курсор був у польоті, користувач міг почати новий пошук.
    if (state.requestId !== requestId || state.query !== query) return;

    set({
      allPosts: batchIndex === 0 ? data : [...state.allPosts, ...data],
      loadedBatches: batchIndex + 1,
      hasMore: data.length === BATCH_SIZE,
    });
  },

  setPage: (page) =>
    set((state) => ({
      page,
      maxPageReached: Math.max(state.maxPageReached, page),
      scrollY: 0,
    })),

  resetPage: () => set({ page: 1, maxPageReached: 1 }),

  setScrollY: (y) => set({ scrollY: y }),
}));
