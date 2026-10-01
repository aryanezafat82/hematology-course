import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, Trash2, ChevronLeft } from 'lucide-react';
import { getSessions } from '../data/loaders.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { useHardPoints } from '../context/HardPointsContext.jsx';
import { useReview } from '../context/ReviewContext.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function Progress() {
  const sessions = getSessions();

  const { getOverallProgress, getSessionProgress, resetProgress } =
    useProgress();
  const { clearHardPoints } = useHardPoints();
  const { getTotalCount, getDueCount, getOverdueCount, clearAll } = useReview();

  const overall = getOverallProgress();
  const reviewTotal = getTotalCount();
  const reviewDue = getDueCount();
  const reviewOverdue = getOverdueCount();

  function handleResetAll() {
    const ok = window.confirm(
      'آیا مطمئن هستید که می‌خواهید تمام داده‌های شما پاک شود؟ این کار پیشرفت، نکات سخت و کارت‌های مرور را حذف می‌کند و قابل بازگشت نیست.'
    );
    if (!ok) return;
    resetProgress();
    clearHardPoints();
    clearAll();
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            پیشرفت
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            روند مطالعه‌ی شما
          </p>
        </header>
        <EmptyState
          icon={BarChart3}
          title="جلسه‌ای موجود نیست"
          description="به‌زودی جلسات این دوره اضافه خواهند شد."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            پیشرفت
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            روند مطالعه‌ی شما
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          پاک کردن پیشرفت
        </button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            پیشرفت کل دوره
          </h2>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {overall.percent}%
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={overall.percent} />
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {overall.completed} / {overall.total} بخش تکمیل شده
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          مرور
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              در چرخه مرور
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              {reviewTotal}
            </p>
          </div>
          <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/40">
            <p className="text-xs text-rose-700 dark:text-rose-300">
              سررسید امروز
            </p>
            <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">
              {reviewDue}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/40">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              عقب‌افتاده
            </p>
            <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300">
              {reviewOverdue}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          پیشرفت جلسات
        </h2>

        {sessions.map((session, index) => {
          const progress = getSessionProgress(session.id);
          const fullyDone =
            progress.total > 0 && progress.completed === progress.total;

          return (
            <Link
              key={session.id}
              to={`/session/${session.id}`}
              className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    جلسه {index + 1}
                  </span>
                  {fullyDone && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      تکمیل شده
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {progress.percent}%
                </span>
              </div>

              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {session.title}
              </h3>

              <div className="mt-3">
                <ProgressBar value={progress.percent} />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {progress.completed} / {progress.total} بخش
                </span>
                <ChevronLeft className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-x-0.5 dark:text-slate-500" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}