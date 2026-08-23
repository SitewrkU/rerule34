import { create } from 'zustand';

interface SearchParams {
  tags: string;
}

interface SearchStore  {
  params: SearchParams;
  searchTrigger: number; //QoL поле, щоб можна було тригерити пошук, навіть якщо не змінилося поле params
  hasSearched: boolean;

  setParams(params: Partial<SearchParams>): void;
  resetParams(): void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  params: {
    tags: ''
  },

  searchTrigger: 0,
  hasSearched: false,
  setParams: (params) =>
    set((state) => ({
      params: {
        ...state.params,
        ...params,
      },
      searchTrigger: state.searchTrigger + 1,
      hasSearched: true
    })),

  resetParams: () =>
    set((state) => ({
      params: {
        tags: '',
      },
      searchTrigger: state.searchTrigger + 1,
      hasSearched: false
    }))
}));