import { describe, it, expect } from 'vitest';
import {
  parseFormula,
  hasFormulaVariable,
  computeCrossSectionPoints,
  MAX_FORMULA_LENGTH,
  WHITELIST_FUNCTIONS,
} from './formulaParser';
import type { ParsedFormula } from './formulaParser';

describe('parseFormula — корректные формулы', () => {
  it('парсит простую константу', () => {
    const result = parseFormula('5');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.parsedFormula).not.toBeNull();
    expect(result.parsedFormula!.evaluate(0)).toBe(5);
  });

  it('парсит формулу с h: 2 + h', () => {
    const result = parseFormula('2 + h');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(5)).toBe(7);
  });

  it('парсит формулу с sin(h): 2 + sin(h)', () => {
    const result = parseFormula('2 + sin(h)');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(0)).toBeCloseTo(2);
    expect(result.parsedFormula!.evaluate(Math.PI / 2)).toBeCloseTo(3);
  });

  it('парсит формулу с theta: 5 + sin(theta)', () => {
    const result = parseFormula('5 + sin(theta)');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(0, 0)).toBeCloseTo(5);
    expect(result.parsedFormula!.evaluate(0, Math.PI / 2)).toBeCloseTo(6);
  });

  it('парсит формулу с константой pi: pi * h', () => {
    const result = parseFormula('pi * h');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(1)).toBeCloseTo(Math.PI);
  });

  it('парсит формулу с константой e: e ^ h', () => {
    const result = parseFormula('e ^ h');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(1)).toBeCloseTo(Math.E);
  });

  it('парсит сложную формулу: 2 + sin(pi * h) * cos(theta)', () => {
    const result = parseFormula('2 + sin(pi * h) * cos(theta)');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(0, 0)).toBeCloseTo(2);
  });

  it('парсит формулу с pow: pow(2, h)', () => {
    const result = parseFormula('pow(2, h)');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(3)).toBeCloseTo(8);
  });

  it('парсит формулу с sqrt: sqrt(h)', () => {
    const result = parseFormula('sqrt(h)');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(4)).toBeCloseTo(2);
  });

  it('парсит формулу с abs: abs(h - 5)', () => {
    const result = parseFormula('abs(h - 5)');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(3)).toBeCloseTo(2);
    expect(result.parsedFormula!.evaluate(7)).toBeCloseTo(2);
  });

  it('парсит формулу с min/max: min(h, 10)', () => {
    const result = parseFormula('min(h, 10)');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(5)).toBeCloseTo(5);
    expect(result.parsedFormula!.evaluate(15)).toBeCloseTo(10);
  });
});

describe('parseFormula — ошибки синтаксиса', () => {
  it('пустая формула возвращает ошибку', () => {
    const result = parseFormula('');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.message).toBe('Введите формулу');
  });

  it('пустая строка с пробелами возвращает ошибку', () => {
    const result = parseFormula('   ');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.message).toBe('Введите формулу');
  });

  it('незакрытая скобка возвращает ошибку', () => {
    const result = parseFormula('2 + sin(h');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.type).toBe('syntax');
  });

  it('неизвестная функция $$ блокируется (whitelist)', () => {
    const result = parseFormula('2 $$ h');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.type).toBe('whitelist');
  });

  it('h h — валидно (implicit multiplication: h * h)', () => {
    const result = parseFormula('h h');
    expect(result.isValid).toBe(true);
    expect(result.parsedFormula!.evaluate(3)).toBeCloseTo(9);
  });
});

describe('parseFormula — whitelist переменных', () => {
  it('неизвестная переменная x блокируется', () => {
    const result = parseFormula('x + h');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.type).toBe('whitelist');
    expect(result.errors[0]!.message).toContain('x');
    expect(result.errors[0]!.message).toContain('h, theta');
  });

  it('неизвестная переменная radius блокируется', () => {
    const result = parseFormula('radius * h');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.type).toBe('whitelist');
  });
});

describe('parseFormula — whitelist функций', () => {
  it('разрешённая функция sin проходит', () => {
    const result = parseFormula('sin(h)');
    expect(result.isValid).toBe(true);
  });

  for (const fn of WHITELIST_FUNCTIONS) {
    it(`разрешённая функция ${fn} проходит`, () => {
      const testArgs = fn === 'pow' || fn === 'min' || fn === 'max' || fn === 'mod' ? 'h, 1' : 'h';
      const result = parseFormula(`${fn}(${testArgs})`);
      expect(result.isValid).toBe(true);
    });
  }

  it('запрещённая функция alert блокируется', () => {
    const result = parseFormula('alert(h)');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.type).toBe('whitelist');
  });

  it('запрещённая функция window блокируется', () => {
    const result = parseFormula('window');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.type).toBe('whitelist');
  });

  it('запрещённая функция document блокируется', () => {
    const result = parseFormula('document');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.type).toBe('whitelist');
  });
});

describe('parseFormula — вычисление и NaN', () => {
  it('деление на ноль возвращает Infinity → NaN', () => {
    const result = parseFormula('1 / h');
    expect(result.isValid).toBe(true);
    const r = result.parsedFormula!.evaluate(0);
    expect(r).toBeNaN();
  });

  it('sqrt от отрицательного возвращает NaN', () => {
    const result = parseFormula('sqrt(h - 5)');
    expect(result.isValid).toBe(true);
    const r = result.parsedFormula!.evaluate(3);
    expect(r).toBeNaN();
  });

  it('формула возвращает NaN при ошибке', () => {
    const result = parseFormula('log(h - 1)');
    expect(result.isValid).toBe(true);
    const r = result.parsedFormula!.evaluate(0);
    expect(r).toBeNaN();
  });
});

describe('hasFormulaVariable', () => {
  it('определяет наличие h', () => {
    expect(hasFormulaVariable('2 + h', 'h')).toBe(true);
    expect(hasFormulaVariable('sin(h)', 'h')).toBe(true);
    expect(hasFormulaVariable('5', 'h')).toBe(false);
    expect(hasFormulaVariable('sin(theta)', 'h')).toBe(false);
  });

  it('определяет наличие theta', () => {
    expect(hasFormulaVariable('sin(theta)', 'theta')).toBe(true);
    expect(hasFormulaVariable('2 + h', 'theta')).toBe(false);
    expect(hasFormulaVariable('theta * h', 'theta')).toBe(true);
  });
});

describe('computeCrossSectionPoints', () => {
  it('генерирует точки без theta', () => {
    const result = parseFormula('2 + h');
    expect(result.isValid).toBe(true);
    const points = computeCrossSectionPoints(result.parsedFormula as ParsedFormula, 0, 4, 4, false);
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ h: 0, r: 2 });
    expect(points[1]).toEqual({ h: 1, r: 3 });
    expect(points[4]).toEqual({ h: 4, r: 6 });
  });

  it('генерирует точки с theta', () => {
    const result = parseFormula('2 + sin(theta)');
    expect(result.isValid).toBe(true);
    const points = computeCrossSectionPoints(result.parsedFormula as ParsedFormula, 0, 2, 2, true);
    expect(points).toHaveLength(3);
    expect(points[0]?.r).toBeCloseTo(2);
  });

  it('пропускает точки с NaN', () => {
    const result = parseFormula('sqrt(h)');
    expect(result.isValid).toBe(true);
    const points = computeCrossSectionPoints(result.parsedFormula as ParsedFormula, 0, 2, 2, false);
    expect(points).toHaveLength(3);
    expect(points[0]?.r).toBe(0);
  });
});

describe('Безопасность', () => {
  it('длинная формула блокируется', () => {
    const longFormula = 'h + '.repeat(MAX_FORMULA_LENGTH);
    const result = parseFormula(longFormula);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.message).toContain('не должна превышать');
  });

  it('формула ровно MAX_FORMULA_LENGTH символов проходит проверку длины', () => {
    const formula = 'h + '.repeat(Math.floor(MAX_FORMULA_LENGTH / 3));
    const truncated = formula.slice(0, MAX_FORMULA_LENGTH);
    const result = parseFormula(truncated);
    expect(result.errors.some((e) => e.message.includes('не должна превышать'))).toBe(false);
  });
});
