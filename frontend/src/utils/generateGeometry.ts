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
  // Float32Array гарантирует числовые значения (без undefined)
  const vertices = new Float32Array(numVertices * 3);
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

      vertices[idx * 3] = r * Math.cos(theta);
      vertices[idx * 3 + 1] = h;
      vertices[idx * 3 + 2] = r * Math.sin(theta);
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

  // Накопление face normals на каждую вершину
  const normalSums = new Float32Array(numVertices * 3);

  for (let k = 0; k < indices.length; k += 3) {
    const a = indices[k] * 3;
    const b = indices[k + 1] * 3;
    const c = indices[k + 2] * 3;

    // Векторы AB и AC
    const abx = vertices[b] - vertices[a];
    const aby = vertices[b + 1] - vertices[a + 1];
    const abz = vertices[b + 2] - vertices[a + 2];

    const acx = vertices[c] - vertices[a];
    const acy = vertices[c + 1] - vertices[a + 1];
    const acz = vertices[c + 2] - vertices[a + 2];

    // Cross product AB × AC
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;

    // Накопление на вершину
    normalSums[a] += nx;
    normalSums[a + 1] += ny;
    normalSums[a + 2] += nz;

    const bb = b * 3;
    normalSums[bb] += nx;
    normalSums[bb + 1] += ny;
    normalSums[bb + 2] += nz;

    const cc = c * 3;
    normalSums[cc] += nx;
    normalSums[cc + 1] += ny;
    normalSums[cc + 2] += nz;
  }

  // Нормализация
  const normals = new Float32Array(numVertices * 3);
  for (let k = 0; k < numVertices; k++) {
    const ix = k * 3;
    const len = Math.sqrt(
      normalSums[ix] * normalSums[ix] +
        normalSums[ix + 1] * normalSums[ix + 1] +
        normalSums[ix + 2] * normalSums[ix + 2],
    );
    if (len > 1e-10) {
      normals[ix] = normalSums[ix] / len;
      normals[ix + 1] = normalSums[ix + 1] / len;
      normals[ix + 2] = normalSums[ix + 2] / len;
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
    const x = vertices[k * 3];
    const y = vertices[k * 3 + 1];
    const z = vertices[k * 3 + 2];

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
    const r0 = parsedFormula.evaluate(h0, 0);
    const r1 = parsedFormula.evaluate(h1, 0);

    const rAvgSq = (r0 * r0 + r0 * r1 + r1 * r1) / 3;
    volume += Math.PI * Math.abs(rAvgSq) * step;
  }

  // ─── Шаг 6: Расчёт площади поверхности ────────────────────────────────

  let surfaceArea = 0;
  for (let k = 0; k < indices.length; k += 3) {
    const a = indices[k] * 3;
    const b = indices[k + 1] * 3;
    const c = indices[k + 2] * 3;

    const abx = vertices[b] - vertices[a];
    const aby = vertices[b + 1] - vertices[a + 1];
    const abz = vertices[b + 2] - vertices[a + 2];

    const acx = vertices[c] - vertices[a];
    const acy = vertices[c + 1] - vertices[a + 1];
    const acz = vertices[c + 2] - vertices[a + 2];

    const crossX = aby * acz - abz * acy;
    const crossY = abz * acx - abx * acz;
    const crossZ = abx * acy - aby * acx;

    surfaceArea += 0.5 * Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
  }

  return {
    vertices: Array.from(vertices),
    indices,
    normals: Array.from(normals),
    volume,
    surfaceArea,
    boundingBox: [
      [minX, minY, minZ],
      [maxX, maxY, maxZ],
    ],
    warnings,
  };
}
