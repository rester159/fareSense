import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'teal' | 'amber' | 'none';
}

export default function Card({ glow = 'none', children, className = '', ...props }: CardProps) {
  const glowStyles = {
    teal: 'border-teal/30 shadow-lg shadow-teal/10',
    amber: 'border-amber/30 shadow-lg shadow-amber/10',
    none: 'border-surface-border',
  };

  return (
    <div
      className={`bg-surface rounded-2xl border ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
