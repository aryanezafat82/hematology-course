import { CheckCircle2, RotateCcw } from 'lucide-react';
import { formatReviewDate } from '../../utils/reviewUtils.js';

export default function ReviewSummary({
  totalReviewed,
  results,
  nextDueDate,
  onBackToDashboard,
}) {
  const { forgot, partial, easy } = results;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">
          مرور تمام شد
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {totalReviewed} کارت مرور شد
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/40">
          <p className="text-xs text-rose-700 dark:text-rose-300">یادم نبود</p>
          <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">
            {forgot}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/40">
          <p className="text-xs text-amber-700 dark:text-amber-300">تا حدی</p>
          <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300">
            {partial}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            کاملاً
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {easy}
          </p>
        </div>
      </div>

      {nextDueDate && (
        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          مرور بعدی: {formatReviewDate(nextDueDate)}
        </p>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
        >
          <RotateCcw className="h-4 w-4" />
          بازگشت به صفحه مرور
        </button>
      </div>
    </section>
  );
}