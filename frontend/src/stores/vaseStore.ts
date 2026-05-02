/**
 * Глобальное состояние вазы — Zustand store
 */
import { create } from 'zustand';
import type { VaseConfig } from '@/types/vase';

interface VaseState {
  config: VaseConfig;
  setConfig: (partial: Partial<VaseConfig>) => void;
  resetConfig: () => void;
  formulaError: string | null;
  setFormulaError: (error: string | null) => void;
}

const defaultConfig: VaseConfig = {
  formula: '2 + sin(pi * h)',
  minHeight: 0,
  maxHeight: 20,
  segments: 32,
  slices: 50,
};

export const useVaseStore = create<VaseState>((set) => ({
  config: defaultConfig,
  setConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),
  resetConfig: () => set({ config: defaultConfig, formulaError: null }),
  formulaError: null,
  setFormulaError: (error) => set({ formulaError: error }),
}));
