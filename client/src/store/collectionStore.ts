// store/collectionsStore.ts
import { create } from 'zustand';
import * as api from '../utils/api/collections';
import type { Collection, CollectionPost } from '../utils/api/collections';

interface CollectionsState {
  collections: Collection[];
  defaultSavedIds: Set<string | number>;
  loading: boolean;
  fetched: boolean;

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

  fetchCollections: async () => {
    if (get().fetched || get().loading) return; // не рефетчимо повторно
    set({ loading: true });
    try {
      const collections = await api.getCollections();
      set({ collections, defaultSavedIds: computeSavedIds(collections), fetched: true });
    } finally {
      set({ loading: false });
    }
  },

  saveToDefault: async (post) => {
    set(state => {
      const collections = state.collections.map(c =>
        c.isDefault ? { ...c, posts: [...c.posts, post] } : c
      );
      return { collections, defaultSavedIds: computeSavedIds(collections) };
    });

    try {
      await api.saveToDefaultCollection(post);
    } catch (e) {
      set(state => ({
        collections: state.collections.map(c =>
          c.isDefault ? { ...c, posts: c.posts.filter(p => p.id !== post.id) } : c
        ),
      }));
      throw e;
    }
  },

  removeFromCollection: async (collectionId, postId) => {
    const prevCollections = get().collections;

    set(state => ({
      collections: state.collections.map(c =>
        c.id === collectionId ? { ...c, posts: c.posts.filter(p => p.id !== postId) } : c
      ),
    }));

    try {
      await api.deleteFromCollection(collectionId, String(postId));
    } catch (e) {
      set({ collections: prevCollections }); // повний роллбек
      throw e;
    }
  },
}));