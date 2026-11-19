// store/collectionsStore.ts
import { create } from 'zustand';
import axios from 'axios';
import * as api from '../utils/api/collections';
import type { CollectionPost, Collection } from '@rerule34/shared/types/collection.ts'

// Бекенд може підніматися довше за Vite (особливо при першому старті),
// тому перший запит за колекціями можемо отримати ще до того, як порт 3000
// почне слухати. Робимо кілька повторних спроб із наростаючою паузою.
const FETCH_MAX_RETRIES = 5;
const FETCH_RETRY_BASE_DELAY = 300;
const FETCH_RETRY_MAX_DELAY = 2000;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function isRetryableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  // Немає відповіді — мережа/таймаут/бекенд ще не запустився.
  if (!error.response) return true;
  // Vite-proxy віддає 500/502/504, коли не може достукатися до бекенду.
  return error.response.status >= 500;
}

// Спільний in-flight запит: скільки б компонентів не викликали fetchCollections,
// реальний запит буде один, а всі дочекаються його результату.
let fetchInFlight: Promise<void> | null = null;

interface CollectionsState {
  collections: Collection[];
  defaultSavedIds: Set<string | number>;
  loading: boolean;
  fetched: boolean;
  error: string | null;

  fetchCollections: () => Promise<void>;
  saveToDefault: (post: CollectionPost) => Promise<void>;
  removeFromCollection: (collectionId: string, postId: string | number) => Promise<void>;
}

function computeSavedIds(collections: Collection[]): Set<string | number> {
  const def = collections.find(c => c.isDefault);
  return new Set((def?.posts ?? []).map(p => p.id)); // безпечніше, як обговорювали раніше
}


export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  defaultSavedIds: new Set(),
  loading: false,
  fetched: false,
  error: null,

  fetchCollections: async () => {
    if (get().fetched) return;
    if (fetchInFlight) return fetchInFlight;

    fetchInFlight = (async () => {
      set({ loading: true, error: null });

      let lastError: unknown;

      for (let attempt = 0; attempt <= FETCH_MAX_RETRIES; attempt++) {
        try {
          const collections = await api.getCollections();
          set({
            collections,
            defaultSavedIds: computeSavedIds(collections),
            fetched: true,
            loading: false,
            error: null,
          });
          return;
        } catch (e) {
          lastError = e;

          if (attempt === FETCH_MAX_RETRIES || !isRetryableError(e)) {
            break;
          }

          const pause = Math.min(
            FETCH_RETRY_BASE_DELAY * 2 ** attempt,
            FETCH_RETRY_MAX_DELAY
          );
          await delay(pause);
        }
      }

      set({
        loading: false,
        error: 'Не вдалося завантажити збережені пости',
      });
      throw lastError;
    })().finally(() => {
      fetchInFlight = null;
    });

    return fetchInFlight;
  },

  saveToDefault: async (post) => {
    // Якщо колекції ще не встигли завантажитися, спершу чекаємо на них.
    // Інакше оптимістичне оновлення застосується до порожнього масиву
    // і збережений пост не з'явиться в UI до перезавантаження сторінки.
    if (!get().fetched) {
      await get().fetchCollections();
    }

    // Пост уже збережено (наприклад, поки йшло завантаження) — нічого не робимо.
    if (get().defaultSavedIds.has(post.id)) return;

    set(state => {
      const collections = state.collections.map(c =>
        c.isDefault ? { ...c, posts: [...c.posts, post] } : c
      );
      return { collections, defaultSavedIds: computeSavedIds(collections) };
    });

    try {
      const updated = await api.saveToDefaultCollection(post);

      // Сервер — джерело істини: замінюємо локальну колекцію його версією,
      // щоб не розсинхронізуватися, якщо пост уже був збережений раніше.
      if (updated?.id) {
        set(state => {
          const collections = state.collections.map(c =>
            c.id === updated.id ? updated : c
          );
          return { collections, defaultSavedIds: computeSavedIds(collections) };
        });
      }
    } catch (e) {
      set(state => {
        const collections = state.collections.map(c =>
          c.isDefault ? { ...c, posts: c.posts.filter(p => p.id !== post.id) } : c
        );
        return { collections, defaultSavedIds: computeSavedIds(collections) };
      });
      throw e;
    }
  },

  removeFromCollection: async (collectionId, postId) => {
    if (!get().fetched) {
      await get().fetchCollections();
    }

    const prevCollections = get().collections;

    set(state => {
      const collections = state.collections.map(c =>
        c.id === collectionId
          ? { ...c, posts: c.posts.filter(p => String(p.id) !== String(postId)) }
          : c
      );
      return { collections, defaultSavedIds: computeSavedIds(collections) };
    });

    try {
      await api.deleteFromCollection(collectionId, String(postId));
    } catch (e) {
      set({
        collections: prevCollections,
        defaultSavedIds: computeSavedIds(prevCollections),
      });
      throw e;
    }
  },
}));