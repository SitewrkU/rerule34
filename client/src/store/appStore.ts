import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isConfigured: boolean;
  is18Confirmed: boolean;
  userName: string;
  postViewed: number;

  joinedAt: number | null;
  dailyViewed: Record<string, number>;

  addPostViewed: (count: number) => void;
  setConfigured: (value: boolean) => void;
  setUserName: (value: string) => void;
  set18Confirmed: () => void;
}

const todayKey = () => new Date().toISOString().slice(0, 10);
const DAYS_TO_KEEP = 60;

function pruneOldDays(daily: Record<string, number>) {
  const cutoffKey = new Date(Date.now() - DAYS_TO_KEEP * 86400000)
    .toISOString()
    .slice(0, 10);
  return Object.fromEntries(
    Object.entries(daily).filter(([key]) => key >= cutoffKey)
  );
}


export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isConfigured: false,
      is18Confirmed: false,
      userName: '',
      postViewed: 0,
      joinedAt: null,
      dailyViewed: {},

      addPostViewed: (count) =>
        set((state) => {
          const key = todayKey();
          const isNewDay = !(key in state.dailyViewed);
          const dailyViewed = {
            ...state.dailyViewed,
            [key]: (state.dailyViewed[key] || 0) + count,
          };
          return {
            postViewed: state.postViewed + count,
            dailyViewed: isNewDay ? pruneOldDays(dailyViewed) : dailyViewed,
          };
        }),

      setConfigured: (value) =>
        set((state) => ({
          isConfigured: value,
          joinedAt: state.joinedAt ?? (value ? Date.now() : state.joinedAt),
        })),

      setUserName: (value) => set({ userName: value }),
      set18Confirmed: () => set({ is18Confirmed: true }),
    }),
    { name: 'app-configured-storage' }
  )
);