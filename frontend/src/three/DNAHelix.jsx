import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * DNAHelix — a slowly rotating double helix of glowing rungs + base
 * spheres. A recognizable "life / genomics" motif for the health brand.
 */
export default function DNAHelix({
  position = [0, 0, 0],
  turns = 3,
  height = 7,
  radius = 1.1,
  colorA = '#22d3ee',
  colorB = '#8b5cf6',
}) {
  const group = useRef();

  const { rungs, a, b } = useMemo(() => {
    const N = 26;
    const rungs = [];
    const a = [];
    const b = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const y = (t - 0.5) * height;
      const ang = t * Math.PI * 2 * turns;
      const ax = Math.cos(ang) * radius;
      const az = Math.sin(ang) * radius;
      const bx = Math.cos(ang + Math.PI) * radius;
      const bz = Math.sin(ang + Math.PI) * radius;
      a.push([ax, y, az]);
      b.push([bx, y, bz]);
      rungs.push([ax, y, az, bx, y, bz]);
    }
    return { rungs, a, b };
  }, [turns, height, radius]);

  const rungGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts = [];
    rungs.forEach((r) => pts.push(...r));
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [rungs]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={group} position={position}>
      <Float speed={1.1} floatIntensity={0.5} rotationIntensity={0.2}>
        <lineSegments geometry={rungGeo}>
          <lineBasicMaterial color={colorA} transparent opacity={0.35} />
        </lineSegments>
        {a.map((p, i) => (
          <mesh key={`a${i}`} position={p}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={colorA} emissive={colorA} emissiveIntensity={1.1} roughness={0.35} />
          </mesh>
        ))}
        {b.map((p, i) => (
          <mesh key={`b${i}`} position={p}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={colorB} emissive={colorB} emissiveIntensity={1.1} roughness={0.35} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}
