import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isConfigured: boolean;
  userName: string;

  setConfigured: (value: boolean) => void;
  setUserName: (value: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isConfigured: false,
      userName: '',

      setConfigured: (value: boolean) => set({ isConfigured: value }),
      setUserName: (value: string) => set({ userName: value }),
    }),
    { name: 'app-configured-storage' }
  )
);