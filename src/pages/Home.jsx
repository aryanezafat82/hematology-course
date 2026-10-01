import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Star,
  Repeat,
  Send,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { getCourse, getSessions, getSessionData } from '../data/loaders.js';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useHardPoints } from '../context/HardPointsContext.jsx';
import { useReview } from '../context/ReviewContext.jsx';

export default function Home() {
  const course = getCourse();
  const sessions = getSessions();

  const { getOverallProgress, getLastStudied, getCompletedSessionsCount } =
    useProgress();
  const { getHardPointCount } = useHardPoints();
  const { getDueCount } = useReview();

  const overall = getOverallProgress();
  const lastStudied = getLastStudied();
  const completedSessions = getCompletedSessionsCount();
  const hardPointCount = getHardPointCount();
  const dueReviewCount = getDueCount();

  let continueTarget = null;
  if (lastStudied) {
    const s = getSessionData(lastStudied.sessionId);
    const sec = s?.sections?.find((x) => x.id === lastStudied.sectionId);
    if (s && sec) {
      continueTarget = {
        href: `/session/${lastStudied.sessionId}/section/${lastStudied.sectionId}`,
        sessionTitle: s.title,
        sectionTitle: sec.title,
      };
    }
  }

  return (
    <div className="space-y-8">
      {/* Course header + Continue Learning + Creator info */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          دوره آموزشی پزشکی
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">
          {course.title}
        </h1>
        {course.description && (
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-400">
            {course.description}
          </p>
        )}

        {continueTarget ? (
          <Link
            to={continueTarget.href}
            className="group mt-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 active:scale-[0.99] dark:border-rose-900/60 dark:bg-rose-950/30 dark:hover:border-rose-800 dark:hover:bg-rose-950/50"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <PlayCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  ادامه از جایی که متوقف شدید
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {continueTarget.sessionTitle} · {continueTarget.sectionTitle}
                </p>
              </div>
            </div>
            <ArrowLeft className="h-5 w-5 text-rose-600 transition-transform group-hover:-translate-x-0.5 dark:text-rose-400" />
          </Link>
        ) : (
          <div className="mt-6">
            <Button to="/sessions" size="lg">
              شروع دوره
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Creator / University / Telegram */}
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              ساخته‌شده توسط{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Arya Nezafat
              </span>
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <GraduationCap className="h-3.5 w-3.5 text-sky-500" />
              دانشگاه علوم پزشکی گیلان
            </p>
          </div>

          <a
            href="https://t.me/gums1402mehr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 transition-all duration-150 hover:border-sky-300 hover:bg-sky-100 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/60"
          >
            <Send className="h-4 w-4" />
            کانال تلگرام
            <span className="hidden font-mono text-[11px] opacity-70 sm:inline">
              @gums1402mehr
            </span>
          </a>
        </div>
      </section>

      {/* Overall progress */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            پیشرفت دوره
          </h2>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {overall.percent}%
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={overall.percent} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {overall.completed} / {overall.total} بخش تکمیل شده
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {completedSessions} جلسه کامل شده
          </span>
        </div>
      </section>

      {/* Today's review */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Repeat className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            مرور امروز
          </h2>
          {dueReviewCount > 0 && (
            <Link
              to="/review"
              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              مشاهده همه
            </Link>
          )}
        </div>

        {dueReviewCount > 0 ? (
          <>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {dueReviewCount} کارت برای مرور
            </p>
            <div className="mt-4">
              <Button to="/review" variant="primary">
                شروع مرور
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            مروری برای امروز ندارید 🎉
          </p>
        )}
      </section>

      {/* Hard Points */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Star className="h-4 w-4 text-amber-500" />
            نکات سخت
          </h2>
          <Link
            to="/hard-points"
            className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
          >
            مشاهده همه
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {hardPointCount === 0
            ? 'هنوز نکته سختی ذخیره نکرده‌اید.'
            : `${hardPointCount} نکته سخت ذخیره شده`}
        </p>
      </section>

      {/* Sessions quick list */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <BookOpen className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            جلسات
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {sessions.length} جلسه موجود
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            برای دیدن فهرست کامل، به بخش{' '}
            <Link
              to="/sessions"
              className="font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              جلسات
            </Link>{' '}
            بروید.
          </p>
        </div>
      </section>
    </div>
  );
}