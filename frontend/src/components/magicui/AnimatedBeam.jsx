import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * AnimatedBeam — a traveling light that flows between two elements
 * (Magic UI, adapted to framer-motion + plain JSX).
 */
export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  pathColor = 'rgb(34,211,238)',
  pathWidth = 2,
  pathOpacity = 0.25,
  gradientStartColor = '#22d3ee',
  gradientStopColor = '#8b5cf6',
  delay = 0,
  duration = 5,
  repeatDelay = 0,
}) {
  const id = useId();
  const [pathD, setPathD] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const c = containerRef.current.getBoundingClientRect();
        const a = fromRef.current.getBoundingClientRect();
        const b = toRef.current.getBoundingClientRect();
        setSvgDimensions({ width: c.width, height: c.height });
        const startX = a.left - c.left + a.width / 2;
        const startY = a.top - c.top + a.height / 2;
        const endX = b.left - c.left + b.width / 2;
        const endY = b.top - c.top + b.height / 2;
        const controlY = startY - curvature;
        setPathD(`M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`);
      }
    };
    const observer = new ResizeObserver(updatePath);
    if (containerRef.current) observer.observe(containerRef.current);
    updatePath();
    return () => observer.disconnect();
  }, [containerRef, fromRef, toRef, curvature, delay, duration, repeatDelay, reverse]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none absolute left-0 top-0 transform-gpu', className)}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1={reverse ? '90%' : '10%'}
          x2={reverse ? '100%' : '0%'}
          y1="0%"
          y2="0%"
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />

      {pathD && (
        <motion.path
          d={pathD}
          stroke={`url(#${id})`}
          strokeWidth={pathWidth + 1}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.18 0.82"
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration, repeat: Infinity, ease: 'linear', delay, repeatDelay }}
        />
      )}
    </svg>
  );
}

export default AnimatedBeam;
