import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { getSessions, getSessionData } from '../data/loaders.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useReview } from '../context/ReviewContext.jsx';

export default function Sessions() {
  const courseSessions = getSessions();
  const { getSessionProgress } = useProgress();
  const { getDueReviews } = useReview();

  const sessions = useMemo(() => {
    return courseSessions.map((meta, i) => {
      const data = getSessionData(meta.id);
      return {
        id: meta.id,
        number: i + 1,
        title: data?.title ?? meta.title,
        description: data?.description ?? '',
      };
    });
  }, [courseSessions]);

  const dueBySession = useMemo(() => {
    const map = {};
    for (const item of getDueReviews()) {
      map[item.sessionId] = (map[item.sessionId] ?? 0) + 1;
    }
    return map;
  }, [getDueReviews]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="جلسه‌ای موجود نیست"
        description="به‌زودی جلسات این دوره اضافه خواهند شد."
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          جلسات
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {sessions.length} جلسه در این دوره
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {sessions.map((session) => {
          const progress = getSessionProgress(session.id);
          const fullyDone =
            progress.total > 0 && progress.completed === progress.total;
          const dueCount = dueBySession[session.id] ?? 0;

          return (
            <Link
              key={session.id}
              to={`/session/${session.id}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50/40 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  جلسه {session.number}
                </span>
                {fullyDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    تکمیل شده
                  </span>
                ) : (
                  <BookOpen className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                )}
              </div>

              <h2 className="mt-3 text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                {session.title}
              </h2>

              {session.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {session.description}
                </p>
              )}

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {progress.completed} / {progress.total} بخش
                  </span>
                  <span>{progress.percent}%</span>
                </div>
                <ProgressBar value={progress.percent} />
              </div>

              {dueCount > 0 && (
                <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {dueCount} کارت برای مرور
                </p>
              )}

              <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                مشاهده جلسه
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}