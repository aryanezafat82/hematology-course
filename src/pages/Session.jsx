import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import { getSessionData, getSessionMeta } from '../data/loaders.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import { useProgress } from '../context/ProgressContext.jsx';

export default function Session() {
  const { sessionId } = useParams();

  const meta = getSessionMeta(sessionId);
  const session = getSessionData(sessionId);
  const { isSectionCompleted, getSessionProgress } = useProgress();

  if (!meta || !session) {
    return (
      <EmptyState
        title="جلسه پیدا نشد"
        description="جلسه‌ی مورد نظر وجود ندارد یا حذف شده است."
        action={
          <Link
            to="/sessions"
            className="text-sm font-medium text-rose-600 hover:underline dark:text-rose-400"
          >
            بازگشت به جلسات
          </Link>
        }
      />
    );
  }

  const sections = session.sections ?? [];
  const sessionProgress = getSessionProgress(session.id);
  const sessionDone =
    sessionProgress.total > 0 &&
    sessionProgress.completed === sessionProgress.total;

  return (
    <div className="space-y-6">
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowRight className="h-4 w-4" />
        جلسات
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {meta.title}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {session.title}
            </h1>
          </div>
          {sessionDone && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              تکمیل شده
            </span>
          )}
        </div>

        {session.description && (
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            {session.description}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {sessionProgress.completed} / {sessionProgress.total} بخش
            </span>
            <span>{sessionProgress.percent}%</span>
          </div>
          <ProgressBar value={sessionProgress.percent} />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          بخش‌ها
        </h2>

        <div className="space-y-3">
          {sections.map((section, index) => {
            const done = isSectionCompleted(session.id, section.id);
            return (
              <Link
                key={section.id}
                to={`/session/${session.id}/section/${section.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
                      done
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                        {section.description}
                      </p>
                    )}
                    <p className="mt-1 inline-flex items-center gap-1 text-xs">
                      {done ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-400">
                            تکمیل شده
                          </span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="text-slate-500 dark:text-slate-400">
                            تکمیل نشده
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:-translate-x-0.5 dark:text-slate-500" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}