/**
 * Scene — R3F Canvas с освещением и фоном
 *
 * Обёртка над <Canvas> с параметрами:
 * - dpr: [1, 2] — адаптивное разрешение
 * - shadows: true — мягкие тени
 * - antialias: true — сглаживание
 * - background: #13131a — цвет фона как у main-preview
 */

import { Canvas } from '@react-three/fiber';
import { VaseMesh } from './VaseMesh';
import { Helpers } from './Helpers';
import type { GeometryData } from '@/utils/generateGeometry';

interface SceneProps {
  geometry: GeometryData | null;
}

export function Scene({ geometry }: SceneProps) {
  return (
    <Canvas
      className="r3f-canvas"
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 10, 40], fov: 50 }}
      style={{ background: '#13131a' }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = 3; // PCFSoftShadowMap
        gl.shadowMap.autoUpdate = false; // Оптимизация
      }}
    >
      {/* ─── Освещение: 3 точки ──────────────────────────────────────── */}

      {/* Основной направленный свет (с тенями) */}
      <directionalLight
        position={[15, 25, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Заполняющий свет слева */}
      <pointLight position={[-15, 15, -5]} intensity={0.5} color="#a0c4ff" />

      {/* Подсветка снизу-справа (тёплый оттенок) */}
      <pointLight position={[10, 5, -15]} intensity={0.3} color="#ffb89a" />

      {/* Фоновый ambient */}
      <ambientLight intensity={0.2} />

      {/* Акцентный прожектор сверху-справа (тени) */}
      <spotLight
        position={[20, 30, 10]}
        angle={0.4}
        penumbra={0.6}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* ─── Геометрия вазы ─────────────────────────────────────────── */}
      {geometry && <VaseMesh geometry={geometry} />}

      {/* ─── Хелперы ────────────────────────────────────────────────── */}
      <Helpers />
    </Canvas>
  );
}
