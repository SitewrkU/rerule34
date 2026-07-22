import {create} from "zustand";
import {persist} from "zustand/middleware";

interface Settings {
  theme: 'dark' | 'light' | 'original';

  paginationOnTop: boolean;
  paginationPos: 'left' | 'center' | 'right';

  showPostInfo: boolean;

  kittyMode: boolean;
  blackMode: boolean;
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
  blackMode: false,
}


type BooleanSettingKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never;
}[keyof Settings];

// конфлікти описуємо лише для boolean-полів — тепер це type-safe
const conflictPairs: [BooleanSettingKey, BooleanSettingKey][] = [
  ['kittyMode', 'blackMode'],
];

const conflictMap: Partial<Record<BooleanSettingKey, BooleanSettingKey[]>> = {};
for (const [a, b] of conflictPairs) {
  (conflictMap[a] ??= []).push(b);
  (conflictMap[b] ??= []).push(a);
}


export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (patch) =>
        set((state) => {
          const next = { ...state.settings, ...patch };

          for (const key of Object.keys(patch) as (keyof Settings)[]) {
            const value = patch[key];

            if (value === true && key in conflictMap) {
              const conflicts = conflictMap[key as BooleanSettingKey];
              conflicts?.forEach((conflictKey) => {
                next[conflictKey] = false;
              });
            }
          }

          return { settings: next };
        }),
    }),
    { name: 'settings-storage' }
  )
);