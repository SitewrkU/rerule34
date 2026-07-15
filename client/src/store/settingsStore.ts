import {create} from "zustand";
import {persist} from "zustand/middleware";

interface Settings {
  theme: 'dark' | 'light' | 'original';
  kittyMode: boolean;

  paginationOnTop: boolean;
  paginationPos: 'left' | 'center' | 'right';
}

interface SettingsState {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  theme: "dark",
  kittyMode: false,

  paginationOnTop: false,
  paginationPos: 'center',
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