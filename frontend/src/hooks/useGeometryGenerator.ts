/**
 * Хук генерации геометрии вазы с мемоизацией через useMemo
 */
import { useMemo } from 'react';
import { generateVaseGeometry } from '@/utils/generateGeometry';
import type { GeometryData } from '@/utils/generateGeometry';
import { parseFormula } from '@/utils/formulaParser';

export interface UseGeometryGeneratorReturn {
  /** Данные геометрии (plain arrays) */
  geometry: GeometryData | null;
  /** Ошибка генерации */
  error: string | null;
  /** Пересчёт геометрии */
  recalculate: () => void;
}

interface UseGeometryGeneratorOptions {
  formula: string;
  minHeight: number;
  maxHeight: number;
  segments: number;
  slices: number;
  enabled?: boolean;
}

/**
 * Хук для генерации 3D-геометрии вазы по формуле.
 * Мемоизирует результат через useMemo — пересчитывает
 * только при изменении зависимых параметров.
 */
export function useGeometryGenerator({
  formula,
  minHeight,
  maxHeight,
  segments,
  slices,
  enabled = true,
}: UseGeometryGeneratorOptions): UseGeometryGeneratorReturn {
  const result = useMemo<GeometryData | null>(() => {
    if (!enabled) return null;

    const validation = parseFormula(formula);
    if (!validation.isValid || !validation.parsedFormula) {
      return null;
    }

    try {
      const data = generateVaseGeometry({
        parsedFormula: validation.parsedFormula,
        minHeight,
        maxHeight,
        segments,
        slices,
      });
      return data;
    } catch {
      return null;
    }
  }, [formula, minHeight, maxHeight, segments, slices, enabled]);

  return {
    geometry: result,
    error: result ? null : enabled ? 'Ошибка генерации' : null,
    recalculate: () => {}, // useMemo обновляется автоматически
  };
}
