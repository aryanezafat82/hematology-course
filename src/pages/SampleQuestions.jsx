import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronLeft, HelpCircle } from 'lucide-react';
import {
  getExams,
  getQuestionsCountBySession,
} from '../data/sampleQuestionsLoader.js';
import { getSessions, getSessionData } from '../data/loaders.js';
import { useOnboarding } from '../context/OnboardingContext.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SampleQuestionsGuide from '../components/onboarding/SampleQuestionsGuide.jsx';

export default function SampleQuestions() {
  const exams = getExams();
  const sessions = getSessions();
  const counts = getQuestionsCountBySession();
  const unknownCount = counts.unknown ?? 0;
  const { hasSeen, markSeen } = useOnboarding();

  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!hasSeen('sample-questions-guide')) {
      const t = setTimeout(() => setShowGuide(true), 600);
      return () => clearTimeout(t);
    }
  }, [hasSeen]);

  function dismissGuide({ permanently }) {
    setShowGuide(false);
    if (permanently) markSeen('sample-questions-guide');
  }

  if (exams.length === 0) {
    return (
      <div className="w-full overflow-x-hidden space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            نمونه سوالات
          </h1>
        </header>
        <EmptyState
          title="هنوز سوالی اضافه نشده"
          description="سوالات به‌زودی اضافه می‌شوند."
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          نمونه سوالات
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          سوالات امتحانی ادوار گذشته، دسته‌بندی‌شده بر اساس جلسه و دوره
        </p>
      </header>

      {/* By session */}
      <section className="w-full">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <BookOpen className="h-5 w-5 text-slate-500" />
          بر اساس جلسه
        </h2>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {sessions.map((session, i) => {
            const sessionData = getSessionData(session.id);
            const realTitle = sessionData?.title ?? session.title;
            const count = counts[session.id] ?? 0;
            const disabled = count === 0;

            return (
              <Link
                key={session.id}
                to={disabled ? '#' : `/sample-questions/session/${session.id}`}
                className={[
                  'group flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border p-4 transition-all',
                  disabled
                    ? 'pointer-events-none cursor-not-allowed border-slate-100 bg-slate-50/50 opacity-50 dark:border-slate-800 dark:bg-slate-900/40'
                    : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/40 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30',
                ].join(' ')}
              >
                <div className="flex w-full min-w-0 items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      جلسه {i + 1} — {realTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {count > 0 ? `${count} سوال` : 'بدون سوال'}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-x-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Uncategorized questions */}
      {unknownCount > 0 && (
        <section className="w-full">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-800 dark:text-amber-300">
            <HelpCircle className="h-5 w-5" />
            سوالات بدون دسته
          </h2>
          <Link
            to="/sample-questions/session/unknown"
            className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 transition-all hover:border-amber-300 hover:bg-amber-50 active:scale-[0.99] dark:border-amber-900/60 dark:bg-amber-950/30 dark:hover:border-amber-800 dark:hover:bg-amber-950/50"
          >
            <div className="flex w-full min-w-0 items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-amber-900 dark:text-amber-100">
                  سوالات دسته‌بندی‌نشده
                </p>
                <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
                  {unknownCount} سوال — به جلسه‌ای نسبت داده نشده‌اند
                </p>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 shrink-0 text-amber-600 transition-transform group-hover:-translate-x-0.5 dark:text-amber-400" />
          </Link>
        </section>
      )}

      {/* By exam */}
      <section className="w-full">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Calendar className="h-5 w-5 text-slate-500" />
          بر اساس دوره امتحان
        </h2>
        <ul className="w-full space-y-2">
          {exams.map((exam) => (
            <li key={exam.id} className="w-full">
              <Link
                to={`/sample-questions/exam/${exam.id}`}
                className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-rose-300 hover:bg-rose-50/40 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
              >
                <div className="flex w-full min-w-0 items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {exam.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {exam.questionCount ?? '?'} سوال
                    </p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {showGuide && (
        <SampleQuestionsGuide
          onDismiss={() => dismissGuide({ permanently: false })}
          onDismissForever={() => dismissGuide({ permanently: true })}
        />
      )}
    </div>
  );
}