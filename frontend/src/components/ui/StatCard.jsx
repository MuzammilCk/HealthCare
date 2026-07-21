import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

function Sparkline({ data, stroke = '#22d3ee' }) {
  const w = 120;
  const h = 36;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / span) * h;
    return [x, y];
  });
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const gid = `spark-${stroke.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({ title, value, unit, delta = 0, icon, spark = [], accent = '#22d3ee', className }) {
  const up = delta >= 0;
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl glass p-5 shadow-card dark:shadow-card-dark',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25),transparent_70%)] blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-head text-3xl font-bold text-foreground">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-glow"
            style={{ background: `linear-gradient(135deg, ${accent}, #2dd4bf)` }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            up ? 'bg-success/15 text-success-fg' : 'bg-error/15 text-error-fg'
          )}
        >
          {up ? <span aria-hidden="true">▲</span> : <span aria-hidden="true">▼</span>} {Math.abs(delta)}%
        </span>
        {spark.length > 1 && (
          <div className="w-2/5">
            <Sparkline data={spark} stroke={accent} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
