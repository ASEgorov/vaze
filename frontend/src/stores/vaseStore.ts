/**
 * Глобальное состояние вазы — Zustand store
 */
import { create } from 'zustand';
import type { VaseConfig } from '@/types/vase';

/** Состояние 3D-сцены */
export interface SceneState {
  /** Показывать сетку (GridHelper) */
  showGrid: boolean;
  toggleGrid: () => void;
  /** Показывать оси (AxesHelper) */
  showAxes: boolean;
  toggleAxes: () => void;
  /** Сбросить все тогглы */
  resetScene: () => void;
}

interface VaseState {
  config: VaseConfig;
  setConfig: (partial: Partial<VaseConfig>) => void;
  resetConfig: () => void;
  formulaError: string | null;
  setFormulaError: (error: string | null) => void;
}

const defaultConfig: VaseConfig = {
  formula: '5 + sin(pi * h * .1) + cos(pi * h * .3 + 0.5*pi) - h * 0.1 + cos(theta*20) * .3',
  minHeight: 0,
  maxHeight: 15,
  segments: 100,
  slices: 100,
};

export const useVaseStore = create<VaseState & SceneState>((set, get) => ({
  config: defaultConfig,
  setConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),
  resetConfig: () => set({ config: defaultConfig, formulaError: null }),
  formulaError: null,
  setFormulaError: (error) => set({ formulaError: error }),

  // Scene state
  showGrid: true,
  showAxes: false,
  toggleGrid: () => set({ showGrid: !get().showGrid }),
  toggleAxes: () => set({ showAxes: !get().showAxes }),
  resetScene: () => set({ showGrid: true, showAxes: false }),
}));
