import { create } from "zustand";
import { persist } from 'zustand/middleware';



type BlackThemeType = {
  title: string;
  description: string;
  tags: string[];
};

export const blackThemes: BlackThemeType[] = [
  {
    title: 'AI-слоп',
    description: 'Всі штучно згенеровані картинки та відео',
    tags: ['ai_generated', 'stable_diffusion']
  },
  {
    title: '3D блендер-слоп',
    description: 'Декому не подобається',
    tags: ['blender']
  },
  {
    title: 'Геї',
    description: 'Міцна чоловіча дружба',
    tags: ['gay']
  },
  {
    title: 'Лезбі',
    description: 'Може комусь і по нрав?',
    tags: ['lesbian']
  },
  {
    title: 'Фуррі',
    description: 'Шерстячки!',
    tags: ['anthro']
  },
  {
    title: 'Футанарі',
    description: 'Наявність чоловічого статевого органа у жіночої особи',
    tags: ['futanari']
  },
  {
    title: 'Інцест',
    description: 'Діло сімейне',
    tags: ['incest']
  },
  {
    title: 'Зоофілія',
    description: 'І до чого тут тварини?',
    tags: ['zoophilia']
  },
  {
    title: 'Жорстокі та тривожні теми',
    description: 'Відверто шокуючі, та жорстокі сцени',
    tags: ['gore', 'guro', 'mutilation', 'amputation', 'dismemberment']
  },
  {
    title: 'Пов\'язані зі смертю',
    description: 'Контент з сценами смерті, або контент із мертвими',
    tags: ['ryona', 'snuff', 'necrophilia']
  },
  {
    title: 'Біологічні виділення',
    description: 'До цього входить: кал, моча та рвота.',
    tags: ['scat', 'shitting', 'feces', 'piss', 'watersports', 'enema', 'vomit']
  },
  {
    title: 'Зібраний бруд',
    description: 'Зображення смегми, бруду, запахів',
    tags: ['smegma', 'filthy']
  },
  {
    title: 'Підгузники',
    description: 'Ватафак??',
    tags: ['diaper', 'abdl']
  },
  {
    title: 'Гіпер-пропорції',
    description: 'Дуже великі частини тіла',
    tags: ['ssbbw', 'body_inflation']
  },
  {
    title: 'Комахи та паразити',
    description: 'Специфічний вибір',
    tags: ['oviposition', 'parasite']
  },
]



type BlacklistStore = {
  selected: string[];
  toggle: (title: string) => void;
  isSelected: (title: string) => boolean;
};


export const useBlacklistStore = create<BlacklistStore>()(
  persist(
    (set, get) => ({
      selected: [],

      toggle: (title) =>
        set((state) => ({
          selected: state.selected.includes(title)
            ? state.selected.filter((t) => t !== title)
            : [...state.selected, title],
        })),

      isSelected: (title) => get().selected.includes(title),
    }),
    {
      name: "blacklist-storage",
    }
  )
);