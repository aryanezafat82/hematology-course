import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Repeat,
  Clock,
  AlertTriangle,
  CalendarCheck,
  PlayCircle,
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Play,
} from 'lucide-react';
import { useReview } from '../context/ReviewContext.jsx';
import { useHardPoints } from '../context/HardPointsContext.jsx';
import { SectionSessionProvider } from '../context/SectionSessionContext.jsx';
import { getSessionData, getSessionMeta } from '../data/loaders.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ReviewCard from '../components/review/ReviewCard.jsx';
import ReviewProgress from '../components/review/ReviewProgress.jsx';
import ReviewSummary from '../components/review/ReviewSummary.jsx';
import ReviewGuide from '../components/review/ReviewGuide.jsx';

const VIEW = { DASHBOARD: 'dashboard', SESSION: 'session', SUMMARY: 'summary' };

export default function Review() {
  const {
    getDueReviews,
    getOverdueCount,
    getUpcomingCount,
    getTotalCount,
    getAllItems,
    rateReview,
  } = useReview();
  const { isHardPoint } = useHardPoints();

  const [searchParams] = useSearchParams();
  const hardOnly = searchParams.get('mode') === 'hard';

  const [view, setView] = useState(VIEW.DASHBOARD);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ forgot: 0, partial: 0, easy: 0 });
  const [showGuide, setShowGuide] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // ---- Due items (respect hardOnly filter) ----
  const dueItems = useMemo(() => {
    const list = getDueReviews();
    if (!hardOnly) return list;
    return list.filter((it) =>
      isHardPoint(it.sessionId, it.sectionId, it.cardId)
    );
  }, [getDueReviews, hardOnly, isHardPoint]);

  // ---- Group due items by session ----
  const dueBySession = useMemo(() => {
    const map = new Map();
    for (const item of dueItems) {
      if (!map.has(item.sessionId)) {
        const data = getSessionData(item.sessionId);
        const meta = getSessionMeta(item.sessionId);
        map.set(item.sessionId, {
          sessionId: item.sessionId,
          title: data?.title ?? meta?.title ?? item.sessionId,
          items: [],
        });
      }
      map.get(item.sessionId).items.push(item);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.sessionId.localeCompare(b.sessionId)
    );
  }, [dueItems]);

  const activeSessionTitle = useMemo(() => {
    if (!activeSessionId) return null;
    const data = getSessionData(activeSessionId);
    const meta = getSessionMeta(activeSessionId);
    return data?.title ?? meta?.title ?? activeSessionId;
  }, [activeSessionId]);

  const totalCount = getTotalCount();
  const dueCount = dueItems.length;
  const overdueCount = getOverdueCount();
  const upcomingCount = getUpcomingCount();

  const resolvedQueue = useMemo(() => {
    return queue
      .map((item) => {
        const session = getSessionData(item.sessionId);
        const section = session?.sections?.find((s) => s.id === item.sectionId);
        const card = section?.cards?.find((c) => c.id === item.cardId);
        return { item, session, section, card };
      })
      .filter((x) => x.card && x.section && x.session);
  }, [queue]);

  const currentEntry = resolvedQueue[index] ?? null;

  const nextDueDate = useMemo(() => {
    const items = getAllItems();
    if (items.length === 0) return null;
    let min = Infinity;
    for (const it of items) {
      const t = new Date(it.nextReviewAt).getTime();
      if (t < min) min = t;
    }
    return Number.isFinite(min) ? new Date(min) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllItems, view]);

  function startAll() {
    if (dueItems.length === 0) return;
    setQueue([...dueItems]);
    setIndex(0);
    setResults({ forgot: 0, partial: 0, easy: 0 });
    setActiveSessionId(null);
    setView(VIEW.SESSION);
  }

  function startSession(sessionId) {
    const items = dueItems.filter((it) => it.sessionId === sessionId);
    if (items.length === 0) return;
    setQueue([...items]);
    setIndex(0);
    setResults({ forgot: 0, partial: 0, easy: 0 });
    setActiveSessionId(sessionId);
    setView(VIEW.SESSION);
  }

  function handleRate(rating) {
    if (!currentEntry) return;
    const { item } = currentEntry;
    rateReview(item.sessionId, item.sectionId, item.cardId, rating);
    setResults((r) => ({ ...r, [rating]: r[rating] + 1 }));

    if (index + 1 < resolvedQueue.length) {
      setIndex((i) => i + 1);
    } else {
      setView(VIEW.SUMMARY);
    }
  }

  function backToDashboard() {
    setView(VIEW.DASHBOARD);
    setQueue([]);
    setIndex(0);
    setActiveSessionId(null);
  }

  // ================= SUMMARY =================
  if (view === VIEW.SUMMARY) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            مرور
          </h1>
        </header>
        <ReviewSummary
          totalReviewed={resolvedQueue.length}
          results={results}
          nextDueDate={nextDueDate}
          onBackToDashboard={backToDashboard}
        />
      </div>
    );
  }

  // ================= SESSION =================
  if (view === VIEW.SESSION) {
    if (!currentEntry) {
      return (
        <div className="space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              مرور
            </h1>
          </header>
          <EmptyState
            icon={CalendarCheck}
            title="مروری باقی نمانده"
            description="همه‌ی کارت‌های سررسید مرور شدند."
          />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={backToDashboard}
              className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 dark:hover:bg-rose-500"
            >
              بازگشت به مرور
            </button>
          </div>
        </div>
      );
    }

    const sessionLabel = activeSessionTitle
      ? `مرور ${activeSessionTitle}`
      : hardOnly
        ? 'مرور کارت‌های سخت'
        : 'مرور همه کارت‌ها';

    return (
      <SectionSessionProvider
        key={`review-${activeSessionId ?? 'all'}-${resolvedQueue.length}`}
      >
        <div className="space-y-6">
          <header className="flex items-center justify-between gap-3">
            <h1 className="text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
              {sessionLabel}
            </h1>
            <button
              type="button"
              onClick={backToDashboard}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              خروج از مرور
            </button>
          </header>

          <ReviewProgress current={index + 1} total={resolvedQueue.length} />

          <ReviewCard
            key={`${currentEntry.item.sessionId}/${currentEntry.item.sectionId}/${currentEntry.item.cardId}`}
            card={currentEntry.card}
            sessionId={currentEntry.item.sessionId}
            sectionId={currentEntry.item.sectionId}
            onRate={handleRate}
          />
        </div>
      </SectionSessionProvider>
    );
  }

  // ================= DASHBOARD =================
  const isAllEmpty = totalCount === 0 && !hardOnly;

  if (isAllEmpty) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {hardOnly ? 'مرور کارت‌های سخت' : 'مرور'}
          </h1>
        </header>
        <EmptyState
          icon={Repeat}
          title="هنوز کارتی برای مرور وجود ندارد."
          description="با علامت‌زدن دکمه‌ی «مرور» روی کارت‌ها، آن‌ها به سیستم مرور اضافه می‌شوند و در بازه‌های مناسب دوباره به شما نشان داده می‌شوند."
          action={
            <Link
              to="/sessions"
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 dark:hover:bg-rose-500"
            >
              مشاهده جلسات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
        />
        <ReviewGuide variant="inline" />
      </div>
    );
  }

  const hasAnyDue = dueCount > 0;
  const multiSession = dueBySession.length > 1;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {hardOnly ? 'مرور کارت‌های سخت' : 'مرور'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {hardOnly
              ? 'کارت‌های سخت سررسید شده'
              : 'کارت‌های در نوبت مرور امروز'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          راهنما
        </button>
      </header>

      {!hasAnyDue ? (
        <>
          <EmptyState
            icon={CalendarCheck}
            title="مروری برای امروز ندارید 🎉"
            description={
              upcomingCount > 0
                ? `${upcomingCount} کارت در روزهای آینده برای مرور زمان‌بندی شده است.`
                : 'کارتی در صف مرور امروز نیست.'
            }
          />
        </>
      ) : (
        <>
          {/* Summary card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                <Repeat className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                مرور امروز
              </h2>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {dueCount}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {dueCount} کارت در {dueBySession.length}{' '}
              {dueBySession.length === 1 ? 'جلسه' : 'جلسه'} آماده‌ی مرور است.
              {overdueCount > 0 && (
                <span className="text-rose-600 dark:text-rose-400">
                  {' '}
                  ({overdueCount} عقب‌افتاده)
                </span>
              )}
            </p>

            {multiSession && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={startAll}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
                >
                  <PlayCircle className="h-4 w-4" />
                  مرور همه جلسات ({dueCount})
                </button>
              </div>
            )}
          </section>

          {/* Sessions list */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {multiSession ? 'یا یک جلسه را انتخاب کنید' : 'جلسه‌ی آماده‌ی مرور'}
            </h2>

            <ul className="space-y-2">
              {dueBySession.map((group) => (
                <li key={group.sessionId}>
                  <button
                    type="button"
                    onClick={() => startSession(group.sessionId)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-right transition-all duration-150 hover:border-rose-300 hover:bg-rose-50/40 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {group.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {group.items.length} کارت برای مرور
                        </p>
                      </div>
                    </div>
                    <Play className="h-4 w-4 shrink-0 text-rose-500 transition-transform group-hover:scale-110 dark:text-rose-400" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {showGuide && (
        <ReviewGuide variant="modal" onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}