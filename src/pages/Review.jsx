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
  Layers,
  FileQuestion,
} from 'lucide-react';
import { useReview } from '../context/ReviewContext.jsx';
import { useHardPoints } from '../context/HardPointsContext.jsx';
import { SectionSessionProvider } from '../context/SectionSessionContext.jsx';
import { getSessionData, getSessionMeta } from '../data/loaders.js';
import { getExamData, getExamMeta } from '../data/sampleQuestionsLoader.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ReviewCard from '../components/review/ReviewCard.jsx';
import ReviewProgress from '../components/review/ReviewProgress.jsx';
import ReviewSummary from '../components/review/ReviewSummary.jsx';
import ReviewGuide from '../components/review/ReviewGuide.jsx';
import QuestionCard from '../components/questions/QuestionCard.jsx';

const VIEW = { DASHBOARD: 'dashboard', SESSION: 'session', SUMMARY: 'summary' };
const TAB = { CARDS: 'cards', QUESTIONS: 'questions' };

export default function Review() {
  const {
    getDueReviews,
    getDueCount,
    getOverdueCount,
    getUpcomingCount,
    getTotalCount,
    getAllItems,
    rateReview,
    rateQuestionReview,
  } = useReview();
  const { isHardPoint, isQuestionHardPoint } = useHardPoints();

  const [searchParams] = useSearchParams();
  const hardOnly = searchParams.get('mode') === 'hard';

  const [view, setView] = useState(VIEW.DASHBOARD);
  const [tab, setTab] = useState(TAB.CARDS);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ forgot: 0, partial: 0, easy: 0 });
  const [showGuide, setShowGuide] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeExamId, setActiveExamId] = useState(null);

  /* ---------------- Due items ---------------- */

  const dueCards = useMemo(() => {
    const list = getDueReviews({ kind: 'card' });
    if (!hardOnly) return list;
    return list.filter((it) =>
      isHardPoint(it.sessionId, it.sectionId, it.cardId)
    );
  }, [getDueReviews, hardOnly, isHardPoint]);

  const dueQuestions = useMemo(() => {
    const list = getDueReviews({ kind: 'question' });
    if (!hardOnly) return list;
    return list.filter((it) => isQuestionHardPoint(it.examId, it.questionId));
  }, [getDueReviews, hardOnly, isQuestionHardPoint]);

  const dueItems = tab === TAB.CARDS ? dueCards : dueQuestions;

  /* ---------------- Grouping ---------------- */

  const cardsBySession = useMemo(() => {
    const map = new Map();
    for (const item of dueCards) {
      if (!map.has(item.sessionId)) {
        const data = getSessionData(item.sessionId);
        const meta = getSessionMeta(item.sessionId);
        map.set(item.sessionId, {
          id: item.sessionId,
          title: data?.title ?? meta?.title ?? item.sessionId,
          items: [],
        });
      }
      map.get(item.sessionId).items.push(item);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.id.localeCompare(b.id)
    );
  }, [dueCards]);

  const questionsBySession = useMemo(() => {
    const map = new Map();
    for (const item of dueQuestions) {
      // Find the question from loaders to get sessionId
      const exam = getExamData(item.examId);
      const q = exam?.questions?.find((x) => x.id === item.questionId);
      const sessionId = q?.sessionId ?? 'unknown';

      if (!map.has(sessionId)) {
        const sessionData = getSessionData(sessionId);
        const sessionMeta = getSessionMeta(sessionId);
        map.set(sessionId, {
          id: sessionId,
          title:
            sessionData?.title ??
            sessionMeta?.title ??
            'سوالات بدون دسته',
          items: [],
        });
      }
      map.get(sessionId).items.push({ ...item, sessionId, question: q });
    }
    return Array.from(map.values()).sort((a, b) =>
      a.id.localeCompare(b.id)
    );
  }, [dueQuestions]);

  const activeGroups =
    tab === TAB.CARDS ? cardsBySession : questionsBySession;

  const activeSessionTitle = useMemo(() => {
    if (activeSessionId) {
      const data = getSessionData(activeSessionId);
      const meta = getSessionMeta(activeSessionId);
      return data?.title ?? meta?.title ?? activeSessionId;
    }
    if (activeExamId) {
      const data = getExamData(activeExamId);
      const meta = getExamMeta(activeExamId);
      return data?.label ?? meta?.label ?? activeExamId;
    }
    return null;
  }, [activeSessionId, activeExamId]);

  /* ---------------- Counts ---------------- */

  const totalCards = getTotalCount({ kind: 'card' });
  const totalQuestions = getTotalCount({ kind: 'question' });
  const totalCount = totalCards + totalQuestions;

  const dueCardCount = dueCards.length;
  const dueQuestionCount = dueQuestions.length;
  const dueCount = tab === TAB.CARDS ? dueCardCount : dueQuestionCount;

  const overdueCount = getOverdueCount({ kind: tab === TAB.CARDS ? 'card' : 'question' });
  const upcomingCount = getUpcomingCount({ kind: tab === TAB.CARDS ? 'card' : 'question' });

  /* ---------------- Queue resolution ---------------- */

  const resolvedQueue = useMemo(() => {
    return queue
      .map((item) => {
        if (item.kind === 'card') {
          const session = getSessionData(item.sessionId);
          const section = session?.sections?.find(
            (s) => s.id === item.sectionId
          );
          const card = section?.cards?.find((c) => c.id === item.cardId);
          if (!card || !section || !session) return null;
          return { kind: 'card', item, session, section, card };
        }
        if (item.kind === 'question') {
          const exam = getExamData(item.examId);
          const question = exam?.questions?.find(
            (q) => q.id === item.questionId
          );
          if (!question || !exam) return null;
          return {
            kind: 'question',
            item,
            exam,
            question: {
              ...question,
              examId: item.examId,
              examLabel: exam.label,
            },
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [queue]);

  const currentEntry = resolvedQueue[index] ?? null;

  const nextDueDate = useMemo(() => {
    const items = getAllItems({ kind: tab === TAB.CARDS ? 'card' : 'question' });
    if (items.length === 0) return null;
    let min = Infinity;
    for (const it of items) {
      const t = new Date(it.nextReviewAt).getTime();
      if (t < min) min = t;
    }
    return Number.isFinite(min) ? new Date(min) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllItems, view, tab]);

  /* ---------------- Handlers ---------------- */

  function startAll() {
    if (dueItems.length === 0) return;
    setQueue([...dueItems]);
    setIndex(0);
    setResults({ forgot: 0, partial: 0, easy: 0 });
    setActiveSessionId(null);
    setActiveExamId(null);
    setView(VIEW.SESSION);
  }

  function startGroup(groupId) {
    const items = dueItems.filter((it) => {
      if (it.kind === 'card') return it.sessionId === groupId;
      // For questions, we need to match by computed sessionId
      const exam = getExamData(it.examId);
      const q = exam?.questions?.find((x) => x.id === it.questionId);
      return (q?.sessionId ?? 'unknown') === groupId;
    });
    if (items.length === 0) return;
    setQueue([...items]);
    setIndex(0);
    setResults({ forgot: 0, partial: 0, easy: 0 });
    setActiveSessionId(groupId);
    setActiveExamId(null);
    setView(VIEW.SESSION);
  }

  function handleRate(rating) {
    if (!currentEntry) return;
    const { item, kind } = currentEntry;
    if (kind === 'card') {
      rateReview(item.sessionId, item.sectionId, item.cardId, rating);
    } else {
      rateQuestionReview(item.examId, item.questionId, rating);
    }
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
    setActiveExamId(null);
  }

  /* ================= SUMMARY ================= */

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

  /* ================= SESSION ================= */

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
            description="همه‌ی موارد سررسید مرور شدند."
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
        ? tab === TAB.CARDS
          ? 'مرور کارت‌های سخت'
          : 'مرور سوالات سخت'
        : tab === TAB.CARDS
          ? 'مرور همه کارت‌ها'
          : 'مرور همه سوالات';

    // Wrap in SectionSessionProvider only for cards (questions don't need it)
    const content = (
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

        {currentEntry.kind === 'card' ? (
          <ReviewCard
            key={`${currentEntry.item.sessionId}/${currentEntry.item.sectionId}/${currentEntry.item.cardId}`}
            card={currentEntry.card}
            sessionId={currentEntry.item.sessionId}
            sectionId={currentEntry.item.sectionId}
            onRate={handleRate}
          />
        ) : (
          <QuestionCard
            key={`${currentEntry.item.examId}-${currentEntry.item.questionId}`}
            question={currentEntry.question}
            showAnswerByDefault={false}
            mode="review"
            onRate={handleRate}
          />
        )}
      </div>
    );

    if (tab === TAB.CARDS) {
      return (
        <SectionSessionProvider
          key={`review-${activeSessionId ?? 'all'}-${resolvedQueue.length}`}
        >
          {content}
        </SectionSessionProvider>
      );
    }

    return content;
  }

  /* ================= DASHBOARD ================= */

  const isCardsEmpty = totalCards === 0;
  const isQuestionsEmpty = totalQuestions === 0;
  const isCurrentTabEmpty = tab === TAB.CARDS ? isCardsEmpty : isQuestionsEmpty;
  const isAllEmpty = totalCount === 0;

  if (isAllEmpty && !hardOnly) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            مرور
          </h1>
        </header>
        <EmptyState
          icon={Repeat}
          title="هنوز چیزی برای مرور وجود ندارد."
          description="با علامت‌زدن دکمه‌ی «مرور» روی کارت‌ها یا سوالات، آن‌ها به سیستم مرور اضافه می‌شوند."
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
  const multiGroup = activeGroups.length > 1;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {hardOnly ? 'مرور سخت‌ها' : 'مرور'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {hardOnly
              ? 'کارت‌ها و سوالات سخت سررسید شده'
              : 'موارد در نوبت مرور امروز'}
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setTab(TAB.CARDS)}
          className={[
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            tab === TAB.CARDS
              ? 'bg-white text-rose-700 shadow-sm dark:bg-slate-800 dark:text-rose-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
          ].join(' ')}
        >
          <Layers className="h-4 w-4" />
          کارت‌ها
          {dueCardCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {dueCardCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab(TAB.QUESTIONS)}
          className={[
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            tab === TAB.QUESTIONS
              ? 'bg-white text-rose-700 shadow-sm dark:bg-slate-800 dark:text-rose-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
          ].join(' ')}
        >
          <FileQuestion className="h-4 w-4" />
          سوالات
          {dueQuestionCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {dueQuestionCount}
            </span>
          )}
        </button>
      </div>

      {isCurrentTabEmpty ? (
        <EmptyState
          icon={tab === TAB.CARDS ? Layers : FileQuestion}
          title={
            tab === TAB.CARDS
              ? 'هنوز کارتی برای مرور نداری'
              : 'هنوز سوالی برای مرور نداری'
          }
          description={
            tab === TAB.CARDS
              ? 'روی کارت‌ها دکمه‌ی «مرور» را بزن تا اینجا بیایند.'
              : 'در تب نمونه سوالات، روی سوال‌ها دکمه‌ی «مرور» را بزن تا اینجا بیایند.'
          }
        />
      ) : !hasAnyDue ? (
        <EmptyState
          icon={CalendarCheck}
          title="مروری برای امروز ندارید 🎉"
          description={
            upcomingCount > 0
              ? `${upcomingCount} ${
                  tab === TAB.CARDS ? 'کارت' : 'سوال'
                } در روزهای آینده زمان‌بندی شده است.`
              : 'چیزی در صف مرور امروز نیست.'
          }
        />
      ) : (
        <>
          {/* Summary */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                {tab === TAB.CARDS ? (
                  <Layers className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <FileQuestion className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                )}
                {tab === TAB.CARDS ? 'کارت‌های امروز' : 'سوالات امروز'}
              </h2>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {dueCount}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {dueCount} {tab === TAB.CARDS ? 'کارت' : 'سوال'} در{' '}
              {activeGroups.length}{' '}
              {activeGroups.length === 1 ? 'جلسه' : 'جلسه'} آماده‌ی مرور است.
              {overdueCount > 0 && (
                <span className="text-rose-600 dark:text-rose-400">
                  {' '}
                  ({overdueCount} عقب‌افتاده)
                </span>
              )}
            </p>

            {multiGroup && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={startAll}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
                >
                  <PlayCircle className="h-4 w-4" />
                  مرور همه ({dueCount})
                </button>
              </div>
            )}
          </section>

          {/* Groups */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {multiGroup ? 'یا یک جلسه را انتخاب کنید' : 'جلسه‌ی آماده‌ی مرور'}
            </h2>

            <ul className="space-y-2">
              {activeGroups.map((group) => (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => startGroup(group.id)}
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
                          {group.items.length}{' '}
                          {tab === TAB.CARDS ? 'کارت' : 'سوال'} برای مرور
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