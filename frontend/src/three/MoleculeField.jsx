import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * MoleculeField — a drifting cloud of "cells" (spheres) joined by faint
 * bonds (lines), evoking diagnostics / molecular medicine. Pure GPU
 * geometry, no textures, cheap to render.
 */
export default function MoleculeField({
  count = 26,
  radius = 5.5,
  color = '#38bdf8',
  accent = '#2dd4bf',
  seed = 7,
}) {
  const group = useRef();

  const nodes = useMemo(() => {
    // deterministic pseudo-random so SSR/CSR match and layout is stable
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => [
      (rand() - 0.5) * radius * 2,
      (rand() - 0.5) * radius * 1.4,
      (rand() - 0.5) * radius * 2,
    ]);
  }, [count, radius, seed]);

  const bonds = useMemo(() => {
    const segs = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        if (d < radius * 0.62) segs.push([a, b]);
      }
    }
    return segs.slice(0, 60);
  }, [nodes, radius]);

  const bondGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts = [];
    bonds.forEach(([a, b]) => pts.push(...a, ...b));
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [bonds]);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05;
  });

  const palette = [color, acent, '#8b5cf6'];

  return (
    <group ref={group}>
      {nodes.map((p, i) => (
        <Float key={i} speed={1 + (i % 3) * 0.4} floatIntensity={0.6} rotationIntensity={0.3}>
          <mesh position={p}>
            <sphereGeometry args={[0.12 + (i % 4) * 0.03, 24, 24]} />
            <meshStandardMaterial
              color={palette[i % palette.length]}
              emissive={palette[i % palette.length]}
              emissiveIntensity={0.9}
              roughness={0.4}
            />
          </mesh>
        </Float>
      ))}

      <lineSegments geometry={bondGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}
