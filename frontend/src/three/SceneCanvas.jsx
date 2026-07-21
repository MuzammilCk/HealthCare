import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import { useEffect, useState } from 'react';

/**
 * SceneCanvas — a reusable, performance-aware R3F stage.
 * - Clamps DPR for GPU headroom (devicePixelRatio can wreck framerate).
 * - Honors prefers-reduced-motion (ui-ux-pro-max / impeccable: reduced-motion).
 * - Soft colored rim-lights build the "Aurora Health" aura without external HDRs.
 */
export default function SceneCanvas({
  children,
  className = '',
  camera = { position: [0, 0, 6], fov: 42 },
  bloom = true,
  intensity = 0.9,
  ...props
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <Canvas
      className={className}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={camera}
      frameloop={reduced ? 'demand' : 'always'}
      {...props}
    >
      <ambientLight intensity={reduced ? 0.9 : 0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#e0f7ff" />
      <pointLight position={[-5, -2, 2]} intensity={28} color="#22d3ee" distance={18} />
      <pointLight position={[5, 3, -2]} intensity={26} color="#8b5cf6" distance={18} />
      <pointLight position={[0, -4, 3]} intensity={20} color="#2dd4bf" distance={18} />

      {children}

      {bloom && !reduced && (
        <EffectComposerSafe intensity={intensity} />
      )}
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  );
}

/* Bloom is isolated so a postprocessing hiccup never blanks the scene. */
function EffectComposerSafe({ intensity }) {
  const [Composer, setComposer] = useState(null);
  useEffect(() => {
    let alive = true;
    import('@react-three/postprocessing')
      .then((mod) => alive && setComposer(() => mod.EffectComposer))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const Bloom = BloomLazy();
  if (!Composer || !Bloom) return null;
  return (
    <Composer multisampling={0}>
      <Bloom
        intensity={intensity}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
      />
    </Composer>
  );
}

/* Tiny lazy loader so the heavy postprocessing bundle is only pulled when bloom is on. */
import { lazy, Suspense } from 'react';
function BloomLazy() {
  const B = lazy(() =>
    import('@react-three/postprocessing').then((m) => ({ default: m.Bloom }))
  );
  return function BloomLoader(props) {
    return (
      <Suspense fallback={null}>
        <B {...props} />
      </Suspense>
    );
  };
}
