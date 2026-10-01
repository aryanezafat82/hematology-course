import { Link } from 'react-router-dom';

const variants = {
  primary:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus-visible:outline-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 dark:active:bg-rose-400',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 focus-visible:outline-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:active:bg-slate-600',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700',
  ghost:
    'text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-slate-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700',
  danger:
    'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 focus-visible:outline-rose-500 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 dark:hover:bg-rose-950/60',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-all duration-150 ease-out',
    'active:scale-[0.98]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    className,
  ].join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}