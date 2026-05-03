/**
 * Helpers — переключатели GridHelper и AxesHelper
 *
 * Использует Zustand store для управления видимостью.
 * Рендерит React-контролы поверх Canvas для переключения.
 *
 * В drei v10 хелперы убраны — используем нативные THREE.GridHelper
 * и THREE.AxesHelper (в R3F любой объект Three.js → JSX-компонент).
 */

import * as THREE from 'three';
import { useVaseStore } from '@/stores/vaseStore';

/** React-контролы для переключения хелперов */
export function HelperControls() {
  const { showGrid, showAxes, toggleGrid, toggleAxes } = useVaseStore();

  return (
    <div className="helper-controls">
      <button
        className={`btn ${showGrid ? 'btn--primary' : ''}`}
        onClick={toggleGrid}
        type="button"
      >
        {showGrid ? 'Сетка ✓' : 'Сетка'}
      </button>
      <button
        className={`btn ${showAxes ? 'btn--primary' : ''}`}
        onClick={toggleAxes}
        type="button"
      >
        {showAxes ? 'Оси ✓' : 'Оси'}
      </button>
    </div>
  );
}

const GridHelper = THREE.GridHelper as unknown as React.FC<{
  args?: [size?: number, divisions?: number, color1?: number, color2?: number];
  position?: [number, number, number];
}>;

const AxesHelper = THREE.AxesHelper as unknown as React.FC<{
  args?: [length?: number];
  position?: [number, number, number];
}>;

/** R3F-компоненты хелперов (рендерятся внутри Canvas) */
export function Helpers() {
  const { showGrid, showAxes } = useVaseStore();

  return (
    <>
      {showGrid && <GridHelper args={[10, 10, 0x444444, 0x2e2e3a]} position={[0, 0, 0]} />}
      {showAxes && <AxesHelper args={[2]} position={[0, 0, 0]} />}
    </>
  );
}
