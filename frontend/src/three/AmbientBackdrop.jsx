import { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import SceneCanvas from './SceneCanvas';
import HealthOrb from './HealthOrb';
import SparklesField from './SparklesField';
import MoleculeField from './MoleculeField';
import SafeScene from './SafeScene';

/**
 * AuthRig — a calm, slower constellation for auth screens so the form
 * stays the focus. GSAP eases the orbs in; useFrame keeps a gentle drift.
 */
function AuthRig() {
  const group = useRef();

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !group.current) return;
    const ctx = gsap.context(() => {
      gsap.from(group.current.scale, {
        x: 0.0001,
        y: 0.0001,
        z: 0.0001,
        duration: 1.6,
        ease: 'elastic.out(1, 0.75)',
        delay: 0.1,
      });
    });
    return () => ctx.revert();
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <group ref={group}>
      <HealthOrb position={[0, 0.2, 0]} scale={0.9} distort={0.28} speed={1.2} />
      <MoleculeField count={18} radius={4.6} />
      <SparklesField count={60} scale={[10, 7, 7]} size={2.6} />
    </group>
  );
}

/**
 * AmbientBackdrop — soft 3D aura for login / register.
 */
export default function AmbientBackdrop({ className = '', intensity = 0.7, ...props }) {
  return (
    <SafeScene className={className}>
      <SceneCanvas
        className={className}
        intensity={intensity}
        camera={{ position: [0, 0, 6.5], fov: 46 }}
        {...props}
      >
        <AuthRig />
      </SceneCanvas>
    </SafeScene>
  );
}
