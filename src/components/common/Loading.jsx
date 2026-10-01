export default function Loading({ label = 'در حال بارگذاری…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-rose-600 dark:border-slate-700 dark:border-t-rose-500" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}