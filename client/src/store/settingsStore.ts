import {create} from "zustand";
import {persist} from "zustand/middleware";

interface Settings {
  theme: 'dark' | 'light' | 'original';

  paginationOnTop: boolean;
  paginationPos: 'left' | 'center' | 'right';

  showPostInfo: boolean;

  kittyMode: boolean;
}

interface SettingsState {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

export const defaultSettings: Settings = {
  theme: "dark",

  paginationOnTop: false,
  paginationPos: 'center',

  showPostInfo: true,

  kittyMode: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    { name: 'settings-storage' }
  )
);