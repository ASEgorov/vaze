/**
 * MainPreview — основная область 3D-превью
 *
 * Интегрирует R3F-сцену с освещением, мешем вазы и хелперами.
 * Показывает размеры модели в нижнем левом углу.
 */

import { useMemo } from 'react';
import { useVaseStore } from '@/stores/vaseStore';
import { useGeometryGenerator } from '@/hooks/useGeometryGenerator';
import { Scene } from './Scene';
import { HelperControls } from './Helpers';

export function MainPreview() {
  const { config } = useVaseStore();
  const { geometry } = useGeometryGenerator({
    formula: config.formula,
    minHeight: config.minHeight,
    maxHeight: config.maxHeight,
    segments: config.segments,
    slices: config.slices,
    enabled: !!config.formula,
  });

  // Размеры модели для отображения
  const sizeInfo = useMemo(() => {
    if (!geometry) return 'w: — | h: — | d: —';

    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = geometry.boundingBox!;
    const width = (maxX! - minX!) * 10; // масштаб → мм (условные единицы)
    const height = (maxY! - minY!) * 10;
    const depth = (maxZ! - minZ!) * 10;

    return `w: ${width.toFixed(1)} | h: ${height.toFixed(1)} | d: ${depth.toFixed(1)}`;
  }, [geometry]);

  return (
    <main className="main-preview">
      <div className="main-preview__canvas-wrapper">
        {geometry ? (
          <Scene geometry={geometry} />
        ) : (
          <div className="main-preview__loading">
            <span>Генерация геометрии...</span>
          </div>
        )}
        <HelperControls />
      </div>
      <div className="main-preview__info">{sizeInfo}</div>
    </main>
  );
}
