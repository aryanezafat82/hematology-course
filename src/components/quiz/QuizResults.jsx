import { RotateCcw, CheckCircle2, XCircle, ListChecks } from 'lucide-react';

export default function QuizResults({ stats, onReviewWrong }) {
  const { total, correct, incorrect, percent } = stats;
  const hasWrong = incorrect > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          مرور بخش
        </h2>
        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
          {percent}٪
        </span>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <p className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <ListChecks className="h-3.5 w-3.5" />
            تعداد سوالات
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            {total}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
          <p className="flex items-center justify-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            پاسخ صحیح
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {correct}
          </p>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/40">
          <p className="flex items-center justify-center gap-1 text-xs text-rose-700 dark:text-rose-300">
            <XCircle className="h-3.5 w-3.5" />
            پاسخ غلط
          </p>
          <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">
            {incorrect}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        {correct} پاسخ صحیح از {total} سوال
      </p>

      {hasWrong && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onReviewWrong}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            مرور پاسخ‌های غلط
          </button>
        </div>
      )}
    </section>
  );
}