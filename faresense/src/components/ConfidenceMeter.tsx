'use client';

interface ConfidenceMeterProps {
  confidence: number; // 0 to 1
  action: 'BUY' | 'WAIT';
}

export default function ConfidenceMeter({ confidence, action }: ConfidenceMeterProps) {
  const percent = Math.round(confidence * 100);
  const isTeal = action === 'WAIT';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Confidence</span>
        <span className={`text-sm font-bold ${isTeal ? 'text-teal' : 'text-amber'}`}>
          {percent}%
        </span>
      </div>
      <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isTeal
              ? 'bg-gradient-to-r from-teal to-teal-light'
              : 'bg-gradient-to-r from-amber to-amber-light'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
