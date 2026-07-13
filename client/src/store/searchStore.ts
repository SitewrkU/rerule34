import { create } from 'zustand';

interface SearchParams {
  tags: string;
  limit?: number;
}

interface SearchStore  {
  params: SearchParams;
  setParams(params: Partial<SearchParams>): void;
  resetParams(): void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  params: {
    tags: '',
    limit: 50
  },

  setParams: (params) =>
    set((state) => ({
      params: {
        ...state.params,
        ...params,
      },
    })),

  resetParams: () =>
    set({
      params: {
        tags: '',
        limit: 50
      }
    })
}));