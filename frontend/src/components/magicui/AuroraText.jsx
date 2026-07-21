import { memo } from 'react';
import { cn } from '../../utils/cn';

function AuroraText({ children, className = '', colors = ['#22d3ee', '#2dd4bf', '#38bdf8', '#8b5cf6'], speed = 1 }) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animationDuration: `${10 / speed}s`,
  };

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      <span
        className="animate-aurora relative bg-size-[200%_auto] bg-clip-text text-transparent"
        style={gradientStyle}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

AuroraText.displayName = 'AuroraText';
export default AuroraText;
