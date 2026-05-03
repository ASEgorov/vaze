/**
 * Helpers — переключатели GridHelper и AxesHelper
 *
 * Использует Zustand store для управления видимостью.
 * Рендерит React-контролы поверх Canvas для переключения.
 *
 * В drei v10 хелперы убраны — используем нативные THREE.GridHelper
 * и THREE.AxesHelper через R3F Object3D + useLayoutEffect.
 */

import { useLayoutEffect, useRef } from 'react';
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

/** R3F-обёртка: Object3D-контейнер + GridHelper внутри */
function GridHelperWrapper({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!groupRef.current || !visible) return;
    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x2e2e3a);
    groupRef.current.add(grid);
    return () => {
      groupRef.current?.remove(grid);
      grid.dispose();
    };
  }, [visible]);

  if (!visible) return null;
  return <group ref={groupRef} position={[0, 0, 0]} />;
}

/** R3F-обёртка: Object3D-контейнер + AxesHelper внутри */
function AxesHelperWrapper({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!groupRef.current || !visible) return;
    const axes = new THREE.AxesHelper(2);
    groupRef.current.add(axes);
    return () => {
      groupRef.current?.remove(axes);
      axes.dispose();
    };
  }, [visible]);

  if (!visible) return null;
  return <group ref={groupRef} position={[0, 0, 0]} />;
}

/** R3F-компоненты хелперов (рендерятся внутри Canvas) */
export function Helpers() {
  const { showGrid, showAxes } = useVaseStore();

  return (
    <>
      <GridHelperWrapper visible={showGrid} />
      <AxesHelperWrapper visible={showAxes} />
    </>
  );
}
