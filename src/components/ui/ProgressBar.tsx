interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

function colorForValue(v: number) {
  if (v >= 75) return 'bg-green-500';
  if (v >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

export function ProgressBar({ value, showLabel = true, size = 'md', className = '' }: ProgressBarProps) {
  const clamp = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorForValue(clamp)}`}
          style={{ width: `${clamp}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-gray-500 w-8 text-right">{clamp}%</span>}
    </div>
  );
}
