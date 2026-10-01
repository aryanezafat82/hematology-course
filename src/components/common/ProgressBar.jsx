const tones = {
  primary: 'bg-rose-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  review: 'bg-indigo-500',
};

const trackTones = {
  primary: 'bg-rose-100 dark:bg-rose-950/50',
  success: 'bg-emerald-100 dark:bg-emerald-950/50',
  warning: 'bg-amber-100 dark:bg-amber-950/50',
  review: 'bg-indigo-100 dark:bg-indigo-950/50',
  neutral: 'bg-slate-100 dark:bg-slate-800',
};

export default function ProgressBar({
  value = 0,
  tone = 'primary',
  track = 'neutral',
  size = 'md',
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={[
        'w-full overflow-hidden rounded-full',
        heights[size] ?? heights.md,
        trackTones[track] ?? trackTones.neutral,
        className,
      ].join(' ')}
    >
      <div
        className={[
          'h-full rounded-full transition-[width] duration-500 ease-out',
          tones[tone] ?? tones.primary,
        ].join(' ')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}