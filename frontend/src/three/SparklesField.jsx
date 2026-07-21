import { Sparkles } from '@react-three/drei';

/**
 * SparklesField — drifting motes of light for depth/atmosphere.
 * Wraps drei's <Sparkles> with brand-tuned defaults.
 */
export default function SparklesField({
  count = 80,
  scale = [12, 8, 8],
  size = 3.5,
  speed = 0.35,
  color = '#bdf3ff',
  opacity = 0.8,
}) {
  return (
    <Sparkles
      count={count}
      scale={scale}
      size={size}
      speed={speed}
      color={color}
      opacity={opacity}
      noise={1.2}
    />
  );
}
