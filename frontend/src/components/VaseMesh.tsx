/**
 * VaseMesh — рендеринг 3D-меша вазы из сгенерированных данных
 *
 * Преобразует plain-массивы (vertices, indices, normals) в
 * THREE.BufferGeometry и рендерит через <mesh>.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import type { GeometryData } from '@/utils/generateGeometry';

interface VaseMeshProps {
  geometry: GeometryData;
}

export function VaseMesh({ geometry }: VaseMeshProps) {
  const bufferGeometry = useMemo(() => {
    const { vertices, indices, normals } = geometry;

    const bufferGeo = new THREE.BufferGeometry();

    bufferGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    bufferGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    bufferGeo.setIndex(indices);

    // Вычисляем bounding sphere для стабильного orbitControls
    bufferGeo.computeBoundingSphere();

    return bufferGeo;
  }, [geometry]);

  return (
    <mesh geometry={bufferGeometry} receiveShadow castShadow rotation={[0, 0, 0]}>
      <meshStandardMaterial
        color="#0d9488"
        metalness={0.15}
        roughness={0.65}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
