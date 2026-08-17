import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isConfigured: boolean;
  userName: string;
  postViewed: number;
  addPostViewed: (count: number) => void;

  setConfigured: (value: boolean) => void;
  setUserName: (value: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isConfigured: false,
      userName: '',
      postViewed: 0,

      addPostViewed: (count) =>
        set((state) => ({ postViewed: state.postViewed + count })),
      setConfigured: (value: boolean) => set({ isConfigured: value }),
      setUserName: (value: string) => set({ userName: value }),
    }),
    { name: 'app-configured-storage' }
  )
);