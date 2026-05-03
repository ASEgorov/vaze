/**
 * Юнит-тесты генерации геометрии вазы
 *
 * Тестирует:
 * - Простая ваза (r = const)
 * - Конус (r = h * 0.5)
 * - Волна (r = f(h, theta))
 * - Отрицательные радиусы
 * - Валидация параметров
 */
import { parse } from 'mathjs';
import { describe, expect, it } from 'vitest';
import { generateVaseGeometry } from '@/utils/generateGeometry';
import type { GeometryParams } from '@/utils/generateGeometry';

// ─── Утилита для создания ParsedFormula ────────────────────────────────────

/** Создаёт ParsedFormula из строки формулы */
function createParsedFormula(expression: string): GeometryParams['parsedFormula'] {
  const ast = parse(expression);
  const compiled = ast.compile();
  return {
    evaluate: (h: number, _theta?: number): number => {
      return compiled.evaluate({ h, theta: _theta ?? 0 }) as number;
    },
  };
}

// ─── Тесты: Простая ваза (r = const) ──────────────────────────────────────

describe('Простая ваза (r = const)', () => {
  const params: GeometryParams = {
    parsedFormula: createParsedFormula('5'),
    minHeight: 0,
    maxHeight: 20,
    segments: 10,
    slices: 16,
  };

  it('генерирует геометрию', () => {
    const data = generateVaseGeometry(params);
    expect(data.vertices).toHaveLength((10 + 1) * (16 + 1) * 3);
    expect(data.indices.length).toBeGreaterThan(0);
    expect(data.normals).toHaveLength(data.vertices.length);
  });

  it('радиус всех вершин ≈ 5', () => {
    const data = generateVaseGeometry(params);
    for (let i = 0; i < data.vertices.length; i += 3) {
      const x = data.vertices[i]!;
      const z = data.vertices[i + 2]!;
      const r = Math.sqrt(x * x + z * z);
      expect(r).toBeCloseTo(5, 5);
    }
  });

  it('y-координаты от 0 до 20', () => {
    const data = generateVaseGeometry(params);
    const ys = new Set<number>();
    for (let i = 1; i < data.vertices.length; i += 3) {
      ys.add(data.vertices[i]!);
    }
    expect(ys.size).toBe(11); // 10 segments + 1
    const ysArray = Array.from(ys);
    expect(Math.min(...ysArray)).toBeCloseTo(0, 5);
    expect(Math.max(...ysArray)).toBeCloseTo(20, 5);
  });

  it('объём ≈ π × 5² × 20 = 1570.8', () => {
    const data = generateVaseGeometry(params);
    const expected = Math.PI * 25 * 20;
    expect(data.volume).toBeCloseTo(expected, 1);
  });

  it('bounding box корректен', () => {
    const data = generateVaseGeometry(params);
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = data.boundingBox;
    expect(minX).toBeLessThan(0);
    expect(maxX).toBeGreaterThan(0);
    expect(minY).toBeCloseTo(0, 5);
    expect(maxY).toBeCloseTo(20, 5);
    expect(minZ).toBeLessThan(0);
    expect(maxZ).toBeGreaterThan(0);
  });
});

// ─── Тесты: Конус (r = h * 0.5) ───────────────────────────────────────────

describe('Конус (r = h * 0.5)', () => {
  const params: GeometryParams = {
    parsedFormula: createParsedFormula('h * 0.5'),
    minHeight: 0,
    maxHeight: 20,
    segments: 10,
    slices: 16,
  };

  it('радиус снизу 0, сверху 10', () => {
    const data = generateVaseGeometry(params);
    // Нижние вершины (j=0)
    const bottomR = Math.sqrt(data.vertices[0]! ** 2 + data.vertices[2]! ** 2);
    expect(bottomR).toBeCloseTo(0, 5);

    // Верхние вершины (j=10), theta=0 → x=r, z=0
    const topVertIdx = 10 * 17;
    const topR = data.vertices[topVertIdx * 3]!;
    expect(topR).toBeCloseTo(10, 5);
  });

  it('объём ≈ (1/3) × π × 10² × 20 = 2094.4', () => {
    const data = generateVaseGeometry(params);
    const expected = (1 / 3) * Math.PI * 100 * 20;
    expect(data.volume).toBeCloseTo(expected, 1);
  });

  it('нормали не нулевые', () => {
    const data = generateVaseGeometry(params);
    let nonzeroCount = 0;
    for (let i = 0; i < data.normals.length; i += 3) {
      const len = data.normals[i]! ** 2 + data.normals[i + 1]! ** 2 + data.normals[i + 2]! ** 2;
      if (len > 1e-6) nonzeroCount++;
    }
    expect(nonzeroCount).toBeGreaterThan(0);
  });
});

// ─── Тесты: Волна (r = f(h, theta)) ────────────────────────────────────────

describe('Волна (r = 5 + cos(theta * 4))', () => {
  const params: GeometryParams = {
    parsedFormula: createParsedFormula('5 + cos(theta * 4)'),
    minHeight: 0,
    maxHeight: 20,
    segments: 10,
    slices: 32,
  };

  it('радиус варьируется по theta', () => {
    const data = generateVaseGeometry(params);
    const bottomRadii = new Set<string>();
    for (let i = 0; i < 33; i++) {
      const x = data.vertices[i * 3]!;
      const z = data.vertices[i * 3 + 2]!;
      const r = Math.sqrt(x * x + z * z);
      bottomRadii.add(r.toFixed(3));
    }
    // Радиусы должны отличаться (wave pattern)
    expect(bottomRadii.size).toBeGreaterThan(2);
  });

  it('радиус в диапазоне [4, 6]', () => {
    const data = generateVaseGeometry(params);
    for (let i = 0; i < data.vertices.length; i += 3) {
      const r = Math.sqrt(data.vertices[i]! ** 2 + data.vertices[i + 2]! ** 2);
      expect(r).toBeGreaterThanOrEqual(3.9);
      expect(r).toBeLessThanOrEqual(6.1);
    }
  });

  it('объём > цилиндра r=4 и < цилиндра r=6', () => {
    const data = generateVaseGeometry(params);
    const volMin = Math.PI * 16 * 20;
    const volMax = Math.PI * 36 * 20;
    expect(data.volume).toBeGreaterThan(volMin);
    expect(data.volume).toBeLessThan(volMax);
  });
});

// ─── Тесты: Отрицательные радиусы ──────────────────────────────────────────

describe('Отрицательные радиусы', () => {
  it('заменяет отрицательный радиус на 0', () => {
    const params: GeometryParams = {
      parsedFormula: createParsedFormula('-5'),
      minHeight: 0,
      maxHeight: 10,
      segments: 4,
      slices: 8,
    };
    const data = generateVaseGeometry(params);
    expect(data.warnings.length).toBeGreaterThan(0);
    for (let i = 0; i < data.vertices.length; i += 3) {
      expect(Math.abs(data.vertices[i]!)).toBeLessThan(1e-10);
      expect(data.vertices[i + 1]!).toBeGreaterThanOrEqual(0);
      expect(Math.abs(data.vertices[i + 2]!)).toBeLessThan(1e-10);
    }
  });
});

// ─── Тесты: Валидация параметров ───────────────────────────────────────────

describe('Валидация параметров', () => {
  const formula = createParsedFormula('5');

  it('throw при segments < 2', () => {
    expect(() =>
      generateVaseGeometry({
        parsedFormula: formula,
        minHeight: 0,
        maxHeight: 10,
        segments: 1,
        slices: 8,
      }),
    ).toThrow('segments должен быть >= 2');
  });

  it('throw при slices < 3', () => {
    expect(() =>
      generateVaseGeometry({
        parsedFormula: formula,
        minHeight: 0,
        maxHeight: 10,
        segments: 10,
        slices: 2,
      }),
    ).toThrow('slices должен быть >= 3');
  });
});
