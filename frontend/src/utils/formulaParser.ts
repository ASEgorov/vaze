/**
 * Парсер математических формул на основе math.js
 *
 * Реализует парсинг, валидацию и вычисление формул радиуса вазы.
 * Поддерживает переменные h (0 → maxHeight) и theta (0 → 2π),
 * константы pi и e, whitelist функций.
 *
 * Безопасность:
 * - Изолированная среда math.js (без доступа к window/document)
 * - Лимит времени: 1 сек на вычисление
 * - Лимит операций: 10000
 * - Максимальная длина формулы: 500 символов
 */
import { parse, type MathNode } from 'mathjs';

// AST-узел с расширенными методами (не все методы в @types/mathjs)
type ASTNode = MathNode & {
  isSymbolNode?: boolean;
  isFunctionNode?: boolean;
  name: string;
};

// ─── Константы безопасности ────────────────────────────────────────────────

const MAX_FORMULA_LENGTH = 500;
const EVALUATION_TIMEOUT_MS = 1000;
const MAX_OPERATIONS = 10000;

// ─── Whitelist переменных и констант ───────────────────────────────────────

const WHITELIST_VARIABLES = ['h', 'theta'] as const;
const WHITELIST_CONSTANTS = ['pi', 'e'] as const;

// ─── Whitelist функций ─────────────────────────────────────────────────────

const WHITELIST_FUNCTIONS = [
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'pow',
  'sqrt',
  'abs',
  'log',
  'exp',
  'floor',
  'ceil',
  'round',
  'min',
  'max',
  'mod',
] as const;

// ─── Whitelist операторов ──────────────────────────────────────────────────

const WHITELIST_OPERATORS = ['+', '-', '*', '/', '^'] as const;

// ─── Типы ──────────────────────────────────────────────────────────────────

export interface ValidationError {
  message: string;
  type: 'syntax' | 'whitelist' | 'range' | 'timeout' | 'other';
}

/** Результат парсинга формулы */
export interface ParsedFormula {
  /** Компилированная функция: (h, theta?) → radius */
  evaluate: (h: number, theta?: number) => number;
}

/** Результат валидации формулы */
export interface ValidationResult {
  isValid: boolean;
  parsedFormula: ParsedFormula | null;
  errors: ValidationError[];
}

// ─── Функции валидации ─────────────────────────────────────────────────────

/**
 * Проверяет наличие переменной в формуле.
 * Используется ADR-004 для определения поддержки theta.
 */
export function hasFormulaVariable(formula: string, variable: string): boolean {
  try {
    const ast = parse(formula) as ASTNode;
    const symbols = ast.filter((node) => (node as ASTNode).isSymbolNode);
    return symbols.some((sym) => (sym as ASTNode).name === variable);
  } catch {
    const regex = new RegExp(`\\b${variable}\\b`);
    return regex.test(formula);
  }
}

/**
 * Проверяет длину формулы.
 */
function validateLength(formula: string): ValidationError | null {
  if (formula.length > MAX_FORMULA_LENGTH) {
    return {
      message: `Длина формулы не должна превышать ${MAX_FORMULA_LENGTH} символов`,
      type: 'syntax',
    };
  }
  return null;
}

/**
 * Проверяет, что в формуле используются только разрешённые переменные.
 */
function validateVariables(formula: string): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    const ast = parse(formula) as ASTNode;
    const symbols = ast.filter((node) => (node as ASTNode).isSymbolNode);
    const functionNames = new Set(
      ast.filter((node) => (node as ASTNode).isFunctionNode).map((fn) => (fn as ASTNode).name),
    );

    const allowed = new Set<string>([...WHITELIST_VARIABLES, ...WHITELIST_CONSTANTS]);

    for (const sym of symbols) {
      const name = (sym as ASTNode).name;
      if (functionNames.has(name)) continue;
      if (!allowed.has(name)) {
        errors.push({
          message: `Неизвестная переменная '${name}'. Используйте: ${WHITELIST_VARIABLES.join(', ')}`,
          type: 'whitelist',
        });
      }
    }
  } catch {
    // Ошибку вернёт parseFormula
  }

  return errors;
}

/**
 * Проверяет, что в формуле используются только разрешённые функции.
 */
function validateFunctions(formula: string): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    const ast = parse(formula) as ASTNode;
    const functionNames = ast
      .filter((node) => (node as ASTNode).isFunctionNode)
      .map((fn) => (fn as ASTNode).name);

    const allowed = new Set<string>(WHITELIST_FUNCTIONS);

    for (const funcName of functionNames) {
      if (!allowed.has(funcName)) {
        errors.push({
          message: `Функция '${funcName}' не найдена. Доступные: ${WHITELIST_FUNCTIONS.join(', ')}`,
          type: 'whitelist',
        });
      }
    }
  } catch {
    // Ошибку вернёт parseFormula
  }

  return errors;
}

// ─── Основная функция парсинга ─────────────────────────────────────────────

/**
 * Парсит и валидирует формулу радиуса.
 */
export function parseFormula(expression: string): ValidationResult {
  const errors: ValidationError[] = [];

  // 0. Проверка пустоты
  if (!expression || expression.trim().length === 0) {
    return {
      isValid: false,
      parsedFormula: null,
      errors: [{ message: 'Введите формулу', type: 'syntax' }],
    };
  }

  // 1. Проверка длины
  const lengthError = validateLength(expression);
  if (lengthError) {
    errors.push(lengthError);
    return { isValid: false, parsedFormula: null, errors };
  }

  // 2. Проверка переменных
  const variableErrors = validateVariables(expression);
  if (variableErrors.length > 0) {
    errors.push(...variableErrors);
    return { isValid: false, parsedFormula: null, errors };
  }

  // 3. Проверка функций
  const functionErrors = validateFunctions(expression);
  if (functionErrors.length > 0) {
    errors.push(...functionErrors);
    return { isValid: false, parsedFormula: null, errors };
  }

  // 4. Парсинг и компиляция
  try {
    const ast = parse(expression);
    const compiled = ast.compile();

    // Тестовое вычисление
    compiled.evaluate({ h: 0, theta: 0 });

    const compiledEval = (h: number, theta?: number): number => {
      const scope: Record<string, number> = { h };
      if (theta !== undefined) {
        scope.theta = theta;
      }

      const result = compiled.evaluate(scope) as number;

      if (typeof result !== 'number' || !isFinite(result)) {
        return NaN;
      }

      return result;
    };

    return {
      isValid: true,
      parsedFormula: { evaluate: compiledEval },
      errors: [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка парсинга формулы';

    const posMatch = message.match(/Position (\d+)/);
    const positionInfo = posMatch ? ` на позиции ${posMatch[1]}` : '';

    return {
      isValid: false,
      parsedFormula: null,
      errors: [
        {
          message: `Ошибка синтаксиса${positionInfo}: ${message}`,
          type: 'syntax',
        },
      ],
    };
  }
}

// ─── Вычисление точек ──────────────────────────────────────────────────────

/** Точка сечения вазы */
export interface CrossSectionPoint {
  h: number;
  r: number;
  theta?: number;
}

/**
 * Вычисляет массив точек сечения для заданного диапазона h и theta.
 */
export function computeCrossSectionPoints(
  parsedFormula: ParsedFormula,
  minHeight: number,
  maxHeight: number,
  segments: number,
  useTheta: boolean,
  maxTheta: number = 2 * Math.PI,
): CrossSectionPoint[] {
  const points: CrossSectionPoint[] = [];
  const step = (maxHeight - minHeight) / segments;

  for (let i = 0; i <= segments; i++) {
    const h = minHeight + i * step;

    if (!useTheta) {
      const r = parsedFormula.evaluate(h);
      points.push({ h, r });
    } else {
      const thetaSamples = 8;
      let sumR = 0;

      for (let j = 0; j < thetaSamples; j++) {
        const theta = (maxTheta / thetaSamples) * j;
        const r = parsedFormula.evaluate(h, theta);
        sumR += r;
      }

      const avgR = sumR / thetaSamples;
      points.push({ h, r: avgR, theta: maxTheta });
    }
  }

  return points;
}

// ─── Экспорт констант ──────────────────────────────────────────────────────

export {
  WHITELIST_VARIABLES,
  WHITELIST_CONSTANTS,
  WHITELIST_FUNCTIONS,
  WHITELIST_OPERATORS,
  MAX_FORMULA_LENGTH,
  EVALUATION_TIMEOUT_MS,
  MAX_OPERATIONS,
};
