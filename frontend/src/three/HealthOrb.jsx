import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * HealthOrb — the luminous "core" of the Aurora Health identity.
 * A distorting glass sphere with an inner emissive heart, wrapped in a
 * slow Float so it breathes. Represents a living, monitored organism.
 */
export default function HealthOrb({
  position = [0, 0, 0],
  scale = 1,
  color = '#22d3ee',
  accent = '#8b5cf6',
  distort = 0.35,
  speed = 1.6,
}) {
  const outer = useRef();
  const inner = useRef();
  const halo = useRef();

  useFrame((state, delta) => {
    if (outer.current) outer.current.rotation.y += delta * 0.18;
    if (inner.current) inner.current.rotation.y -= delta * 0.3;
    if (halo.current) halo.current.rotation.z += delta * 0.12;
  });

  return (
    <group position={position} scale={scale}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
        {/* Outer distorting shell */}
        <mesh ref={outer}>
          <sphereGeometry args={[1.35, 128, 128]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            roughness={0.12}
            metalness={0.1}
            distort={distort}
            speed={speed}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Inner glowing nucleus */}
        <mesh ref={inner} scale={0.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.6}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Wireframe halo ring */}
        <mesh ref={halo} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.15, 0.012, 16, 160]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.1}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Soft sprite glow */}
        <pointLight position={[0, 0, 1.2]} intensity={6} color={color} distance={6} />
      </Float>
    </group>
  );
}
