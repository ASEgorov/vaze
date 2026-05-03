/**
 * Генерация 3D-геометрии вазы — Custom BufferGeometry (ADR-004)
 *
 * Поддержка формул:
 * - r = f(h) — радиус зависит только от высоты
 * - r = f(h, theta) — радиус зависит от высоты и угла
 *
 * Алгоритм:
 * 1. Вложенный цикл: j от 0 до segments, i от 0 до slices
 * 2. Вычисление r = f(h, theta) для каждой точки
 * 3. Полярные → декартовы: x = r * cos(theta), z = r * sin(theta), y = h
 * 4. CCW winding для индексов
 * 5. computeVertexNormals() для гладкости
 * 6. Расчёт bounding box, объёма, площади поверхности
 * 7. Обработка отрицательных радиусов (r = 0 + warning)
 */

import type { ParsedFormula } from '@/utils/formulaParser';

// ─── Типы ──────────────────────────────────────────────────────────────────

/** Параметры генерации геометрии */
export interface GeometryParams {
  parsedFormula: ParsedFormula;
  minHeight: number;
  maxHeight: number;
  segments: number;
  slices: number;
}

/** Результат генерации геометрии */
export interface GeometryData {
  /** Массив вершин [x, y, z, ...] */
  vertices: number[];
  /** Массив индексов треугольников [i, j, k, ...] */
  indices: number[];
  /** Массив нормалей [nx, ny, nz, ...] */
  normals: number[];
  /** Объём вазы */
  volume: number;
  /** Площадь поверхности */
  surfaceArea: number;
  /** Границы bounding box [[minX, minY, minZ], [maxX, maxY, maxZ]] */
  boundingBox: [number[], number[]];
  /** Предупреждения генерации */
  warnings: string[];
}

// ─── Генерация геометрии ───────────────────────────────────────────────────

/**
 * Генерирует данные геометрии вазы по формуле радиуса.
 * Возвращает вершины, индексы, нормали и метаданные.
 * НЕ создаёт BufferGeometry — возвращает plain data для тестирования.
 */
export function generateVaseGeometry(params: GeometryParams): GeometryData {
  const { parsedFormula, minHeight, maxHeight, segments, slices } = params;
  const warnings: string[] = [];

  // Валидация входных параметров
  if (segments < 2) {
    throw new Error('segments должен быть >= 2');
  }
  if (slices < 3) {
    throw new Error('slices должен быть >= 3');
  }

  const numVertices = (segments + 1) * (slices + 1);

  // plain number[] — TS strict mode не доверяет Float32Array индексацию
  const vertices = new Array(numVertices * 3).fill(0);
  const indices: number[] = [];

  // ─── Шаг 1: Генерация вершин ──────────────────────────────────────────

  for (let j = 0; j <= segments; j++) {
    const h = minHeight + (maxHeight - minHeight) * (j / segments);

    for (let i = 0; i <= slices; i++) {
      const theta = (2 * Math.PI * i) / slices;
      const idx = j * (slices + 1) + i;

      let r: number;
      try {
        if (i < slices) {
          r = parsedFormula.evaluate(h, theta);
        } else {
          r = parsedFormula.evaluate(h);
        }
      } catch {
        r = 0;
      }

      // Обработка отрицательных/некорректных радиусов
      if (r < 0) {
        warnings.push(`h=${h.toFixed(2)}: отрицательный радиус ${r.toFixed(2)} → заменён на 0`);
        r = 0;
      }
      if (!isFinite(r)) {
        warnings.push(`h=${h.toFixed(2)}: некорректный радиус → заменён на 0`);
        r = 0;
      }

      const vi = idx * 3;
      vertices[vi] = r * Math.cos(theta);
      vertices[vi + 1] = h;
      vertices[vi + 2] = r * Math.sin(theta);
    }
  }

  // ─── Шаг 2: Генерация индексов (CCW winding) ──────────────────────────

  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < slices - 1; i++) {
      const a = j * (slices + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (slices + 1) + i;
      const d = c + 1;

      // Два треугольника с CCW winding
      indices.push(a, c, b);
      indices.push(b, c, d);
    }

    // Последний квад: один треугольник + два треугольника с дублированием
    const lastStart = j * (slices + 1) + (slices - 1);
    const bottomLast = (j + 1) * (slices + 1) + (slices - 1);
    const topFirst = (j + 1) * (slices + 1);

    indices.push(lastStart, bottomLast, topFirst);
  }

  // ─── Шаг 3: Вычисление нормалей (computeVertexNormals) ─────────────────

  const normalSums = new Array(numVertices * 3).fill(0);

  for (let k = 0; k < indices.length; k += 3) {
    const a = indices[k]!;
    const b = indices[k + 1]!;
    const c = indices[k + 2]!;

    const ai = a * 3;
    const bi = b * 3;
    const ci = c * 3;

    // Векторы AB и AC
    const abx = vertices[bi]! - vertices[ai]!;
    const aby = vertices[bi + 1]! - vertices[ai + 1]!;
    const abz = vertices[bi + 2]! - vertices[ai + 2]!;

    const acx = vertices[ci]! - vertices[ai]!;
    const acy = vertices[ci + 1]! - vertices[ai + 1]!;
    const acz = vertices[ci + 2]! - vertices[ai + 2]!;

    // Cross product AB × AC
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;

    // Накопление на вершину
    normalSums[ai] += nx;
    normalSums[ai + 1] += ny;
    normalSums[ai + 2] += nz;

    normalSums[bi] += nx;
    normalSums[bi + 1] += ny;
    normalSums[bi + 2] += nz;

    normalSums[ci] += nx;
    normalSums[ci + 1] += ny;
    normalSums[ci + 2] += nz;
  }

  // Нормализация
  const normals = new Array(numVertices * 3).fill(0);
  for (let k = 0; k < numVertices; k++) {
    const ix = k * 3;
    const nx = normalSums[ix]!;
    const ny = normalSums[ix + 1]!;
    const nz = normalSums[ix + 2]!;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 1e-10) {
      normals[ix] = nx / len;
      normals[ix + 1] = ny / len;
      normals[ix + 2] = nz / len;
    } else {
      normals[ix] = 0;
      normals[ix + 1] = 1;
      normals[ix + 2] = 0;
    }
  }

  // ─── Шаг 4: Расчёт bounding box ───────────────────────────────────────

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (let k = 0; k < numVertices; k++) {
    const ix = k * 3;
    const x = vertices[ix]!;
    const y = vertices[ix + 1]!;
    const z = vertices[ix + 2]!;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }

  // ─── Шаг 5: Расчёт объёма (метод дисков) ──────────────────────────────

  let volume = 0;
  for (let j = 0; j < segments; j++) {
    const h0 = minHeight + (maxHeight - minHeight) * (j / segments);
    const h1 = minHeight + (maxHeight - minHeight) * ((j + 1) / segments);
    const step = (maxHeight - minHeight) / segments;

    // theta=0 для объёма (радиус усредняется по углу)
    const r0 = Math.abs(parsedFormula.evaluate(h0, 0));
    const r1 = Math.abs(parsedFormula.evaluate(h1, 0));

    const rAvgSq = (r0 * r0 + r0 * r1 + r1 * r1) / 3;
    volume += Math.PI * Math.abs(rAvgSq) * step;
  }

  // ─── Шаг 6: Расчёт площади поверхности ────────────────────────────────

  let surfaceArea = 0;
  for (let k = 0; k < indices.length; k += 3) {
    const a = indices[k]!;
    const b = indices[k + 1]!;
    const c = indices[k + 2]!;

    const ai = a * 3;
    const bi = b * 3;
    const ci = c * 3;

    const abx = vertices[bi]! - vertices[ai]!;
    const aby = vertices[bi + 1]! - vertices[ai + 1]!;
    const abz = vertices[bi + 2]! - vertices[ai + 2]!;

    const acx = vertices[ci]! - vertices[ai]!;
    const acy = vertices[ci + 1]! - vertices[ai + 1]!;
    const acz = vertices[ci + 2]! - vertices[ai + 2]!;

    const crossX = aby * acz - abz * acy;
    const crossY = abz * acx - abx * acz;
    const crossZ = abx * acy - aby * acx;

    surfaceArea += 0.5 * Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
  }

  return {
    vertices,
    indices,
    normals,
    volume,
    surfaceArea,
    boundingBox: [
      [minX, minY, minZ],
      [maxX, maxY, maxZ],
    ],
    warnings,
  };
}
