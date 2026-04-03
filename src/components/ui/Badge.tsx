interface BadgeProps {
  variant?: 'teal' | 'amber' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const variants = {
    teal: 'bg-teal/10 text-teal border-teal/20',
    amber: 'bg-amber/10 text-amber border-amber/20',
    neutral: 'bg-surface-light text-text-secondary border-surface-border',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
