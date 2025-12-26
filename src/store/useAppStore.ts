import { create } from 'zustand';

type Filters = {
  location?: string;
  datetime?: string;
  people?: number;
  price?: string;
  benefit?: string;
};

type AppState = {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
};

export const useAppStore = create<AppState>((set) => ({
  filters: {},
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
}));
