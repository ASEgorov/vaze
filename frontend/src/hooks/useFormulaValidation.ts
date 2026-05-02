/**
 * Хук валидации формулы в реальном времени
 *
 * Использует parseFormula с debounce для валидации при вводе.
 * ADR-002: math.js whitelist + NFR-003: безопасность.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { parseFormula, type ValidationResult } from '@/utils/formulaParser';

// Debounce delay (UC-001, шаг 1)
const DEBOUNCE_DELAY_MS = 200;

export interface FormulaValidationState {
  /** Текущее значение формулы */
  formula: string;
  /** Результат валидации */
  validation: ValidationResult;
  /** Есть ли ошибки */
  hasErrors: boolean;
  /** Сообщения об ошибках */
  errors: string[];
  /** Формула валидна */
  isValid: boolean;
  /** Текущая валидация (debounced) */
  debounceValidation: ValidationResult;
  /** debounce-ошибки */
  debounceErrors: string[];
  /** debounce-валидность */
  isDebounceValid: boolean;
  /** Функция установки формулы */
  setFormula: (formula: string) => void;
  /** Функция принудительной валидации */
  validateImmediately: () => void;
}

/**
 * Кастомный хук для валидации формулы при вводе.
 *
 * Поддерживает:
 * - Debounce (~200ms) для предотвращения лишних вычислений
 * - Мгновенную и debounce-валидацию (для UI-индикации)
 * - Функцию принудительной валидации
 *
 * @param initialFormula — начальная формула
 * @returns состояние валидации + управляющие функции
 */
export function useFormulaValidation(initialFormula: string = ''): FormulaValidationState {
  const [formula, setFormulaState] = useState(initialFormula);
  const [debounceValidation, setDebounceValidation] = useState<ValidationResult>({
    isValid: false,
    parsedFormula: null,
    errors: [],
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce-валидация (для полной проверки)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const result = parseFormula(formula);
      setDebounceValidation(result);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formula]);

  const setFormula = useCallback((newFormula: string) => {
    setFormulaState(newFormula);
  }, []);

  const validateImmediately = useCallback(() => {
    const result = parseFormula(formula);
    setDebounceValidation(result);
  }, [formula]);

  // Вычисляем мгновенную валидацию синхронно во время рендера (дешево)
  const validation = parseFormula(formula);

  return {
    formula,
    validation,
    hasErrors: validation.errors.length > 0,
    errors: validation.errors.map((e) => e.message),
    isValid: validation.isValid,
    debounceValidation,
    debounceErrors: debounceValidation.errors.map((e) => e.message),
    isDebounceValid: debounceValidation.isValid,
    setFormula,
    validateImmediately,
  };
}
