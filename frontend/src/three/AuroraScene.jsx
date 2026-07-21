import { useRef, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import SceneCanvas from './SceneCanvas';
import HealthOrb from './HealthOrb';
import MoleculeField from './MoleculeField';
import DNAHelix from './DNAHelix';
import SparklesField from './SparklesField';
import SafeScene from './SafeScene';

/**
 * SceneRig — holds the composed content. Runs a GSAP intro tween on the
 * group (elastic scale-in) and a subtle pointer-parallax in useFrame.
 * GSAP drives the orchestrated entrance; R3F's useFrame drives life.
 */
function SceneRig() {
  const group = useRef();
  const { camera } = useThree();

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !group.current) return;
    const ctx = gsap.context(() => {
      gsap.from(group.current.scale, {
        x: 0.0001,
        y: 0.0001,
        z: 0.0001,
        duration: 1.8,
        ease: 'elastic.out(1, 0.7)',
      });
      gsap.from(group.current.rotation, {
        y: -0.9,
        duration: 1.6,
        ease: 'power3.out',
      });
      gsap.from(camera.position, { z: 11, duration: 2, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, [camera]);

  useFrame((state) => {
    if (!group.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y += (x * 0.28 - group.current.rotation.y * 0.0) * 0.04;
    group.current.rotation.x += (-y * 0.18 - group.current.rotation.x) * 0.04;
  });

  return (
    <group ref={group}>
      <HealthOrb position={[0, 0.1, 0]} scale={1.05} />
      <MoleculeField count={28} radius={5.6} />
      <DNAHelix position={[3.4, 0, -1.5]} turns={2.4} height={6} radius={0.9} />
      <SparklesField count={90} scale={[13, 9, 9]} />
    </group>
  );
}

/**
 * AuroraScene — the flagship hero stage.
 * Full-bleed, transparent canvas sitting behind DOM content.
 * Degrades to a CSS aura if WebGL is unavailable (SafeScene).
 */
export default function AuroraScene({ className = '', intensity = 1.0, ...props }) {
  return (
    <SafeScene className={className}>
      <SceneCanvas className={className} intensity={intensity} {...props}>
        <SceneRig />
      </SceneCanvas>
    </SafeScene>
  );
}
