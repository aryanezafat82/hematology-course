import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Trash2,
  ExternalLink,
  AlertTriangle,
  BookOpen,
  Repeat,
  ChevronDown,
  Layers,
  FileQuestion,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getSessionData, getSessionMeta } from '../data/loaders.js';
import { getExamData, getExamMeta } from '../data/sampleQuestionsLoader.js';
import { useHardPoints } from '../context/HardPointsContext.jsx';
import { useReview } from '../context/ReviewContext.jsx';
import { useSamplePreferences } from '../context/SamplePreferencesContext.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import QuestionCard from '../components/questions/QuestionCard.jsx';

const TYPE_LABELS = {
  info: 'اطلاعات',
  key_point: 'نکته کلیدی',
  table: 'جدول',
  flashcard: 'فلش‌کارت',
  quiz: 'پرسش',
};

const TAB = { CARDS: 'cards', QUESTIONS: 'questions' };

/* ---------- Card helpers ---------- */

function resolveHardPoint(hp) {
  const meta = getSessionMeta(hp.sessionId);
  const session = getSessionData(hp.sessionId);
  if (!session) return { meta, session: null, section: null, card: null };

  const section = session.sections?.find((s) => s.id === hp.sectionId) ?? null;
  if (!section) return { meta, session, section: null, card: null };

  const card = section.cards?.find((c) => c.id === hp.cardId) ?? null;
  return { meta, session, section, card };
}

function getPreview(card) {
  if (!card) return '';
  if (card.type === 'info' || card.type === 'key_point') {
    return card.title || (card.content ? card.content.slice(0, 80) : '');
  }
  if (card.type === 'table') return card.title || 'جدول مقایسه‌ای';
  if (card.type === 'flashcard' || card.type === 'quiz') return card.question || '';
  return card.title || '';
}

function getSubPreview(card) {
  if (!card) return '';
  if (card.type === 'info' || card.type === 'key_point') return card.content ?? '';
  return '';
}

/* ---------- Question helpers ---------- */

function resolveHardQuestion(hq) {
  const exam = getExamData(hq.examId);
  const meta = getExamMeta(hq.examId);
  if (!exam) return { exam: null, meta, question: null };
  const question = exam.questions?.find((q) => q.id === hq.questionId) ?? null;
  if (!question) return { exam, meta, question: null };
  return {
    exam,
    meta,
    question: { ...question, examId: hq.examId, examLabel: exam.label },
  };
}

/* ================= Main ================= */

export default function HardPoints() {
  const {
    getHardPoints,
    isHardPoint,
    isQuestionHardPoint,
    removeHardPoint,
    clearHardPoints,
  } = useHardPoints();

  const { getDueReviews } = useReview();
  const { showAnswersByDefault, setShowAnswersByDefault } = useSamplePreferences();

  const [tab, setTab] = useState(TAB.CARDS);

  const cardList = getHardPoints({ kind: 'card' });
  const questionList = getHardPoints({ kind: 'question' });

  const cardCount = cardList.length;
  const questionCount = questionList.length;
  const totalCount = cardCount + questionCount;

  /* ---------- Group cards by session ---------- */

  const cardsGrouped = useMemo(() => {
    const map = new Map();
    for (const hp of cardList) {
      if (!map.has(hp.sessionId)) {
        const data = getSessionData(hp.sessionId);
        const meta = getSessionMeta(hp.sessionId);
        map.set(hp.sessionId, {
          id: hp.sessionId,
          title: data?.title ?? meta?.title ?? hp.sessionId,
          items: [],
        });
      }
      map.get(hp.sessionId).items.push(hp);
    }
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
  }, [cardList]);

  /* ---------- Group questions by session ---------- */

  const questionsGrouped = useMemo(() => {
    const map = new Map();
    for (const hq of questionList) {
      const { question } = resolveHardQuestion(hq);
      const sessionId = question?.sessionId ?? 'unknown';
      if (!map.has(sessionId)) {
        const data = getSessionData(sessionId);
        const meta = getSessionMeta(sessionId);
        map.set(sessionId, {
          id: sessionId,
          title: data?.title ?? meta?.title ?? 'سوالات بدون دسته',
          items: [],
        });
      }
      map.get(sessionId).items.push({ ...hq, resolved: question });
    }
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
  }, [questionList]);

  const activeGroups = tab === TAB.CARDS ? cardsGrouped : questionsGrouped;
  const activeCount = tab === TAB.CARDS ? cardCount : questionCount;

  /* ---------- Expanded state ---------- */

  const [manual, setManual] = useState({});

  function isExpanded(groupId) {
    if (groupId in manual) return manual[groupId];
    return groupId === activeGroups[0]?.id;
  }

  function toggle(groupId) {
    setManual((prev) => ({ ...prev, [groupId]: !isExpanded(groupId) }));
  }

  /* ---------- Due counts ---------- */

  const dueHardCards = useMemo(
    () =>
      getDueReviews({ kind: 'card' }).filter((it) =>
        isHardPoint(it.sessionId, it.sectionId, it.cardId)
      ).length,
    [getDueReviews, isHardPoint]
  );

  const dueHardQuestions = useMemo(
    () =>
      getDueReviews({ kind: 'question' }).filter((it) =>
        isQuestionHardPoint(it.examId, it.questionId)
      ).length,
    [getDueReviews, isQuestionHardPoint]
  );

  function handleClearAll() {
    const ok = window.confirm(
      'آیا مطمئن هستید که می‌خواهید همه نکات سخت (کارت‌ها و سوالات) را حذف کنید؟'
    );
    if (ok) clearHardPoints();
  }

  /* ---------- Empty state ---------- */

  if (totalCount === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            نکات سخت
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            مرور کارت‌ها و سوالات دشوار
          </p>
        </header>

        <EmptyState
          icon={Star}
          title="هنوز چیزی ذخیره نکرده‌اید."
          description="هنگام مطالعه، روی «سخت بود» بزنید تا کارت یا سوال برای مرور بعدی اینجا ذخیره شود."
          action={
            <Link
              to="/sessions"
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 dark:hover:bg-rose-500"
            >
              <BookOpen className="h-4 w-4" />
              شروع مطالعه
            </Link>
          }
        />
      </div>
    );
  }

  /* ---------- Main render ---------- */

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            نکات سخت
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {totalCount} مورد
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          پاک کردن همه
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
              ? 'bg-white text-amber-700 shadow-sm dark:bg-slate-800 dark:text-amber-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
          ].join(' ')}
        >
          <Layers className="h-4 w-4" />
          کارت‌ها
          {cardCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              {cardCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab(TAB.QUESTIONS)}
          className={[
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            tab === TAB.QUESTIONS
              ? 'bg-white text-amber-700 shadow-sm dark:bg-slate-800 dark:text-amber-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
          ].join(' ')}
        >
          <FileQuestion className="h-4 w-4" />
          سوالات
          {questionCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              {questionCount}
            </span>
          )}
        </button>
      </div>

      {/* Review buttons */}
      {tab === TAB.CARDS && dueHardCards > 0 && (
        <Link
          to="/review?mode=hard"
          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <Repeat className="h-4 w-4" />
          مرور کارت‌های سخت ({dueHardCards})
        </Link>
      )}

      {tab === TAB.QUESTIONS && dueHardQuestions > 0 && (
        <Link
          to="/review?mode=hard"
          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <Repeat className="h-4 w-4" />
          مرور سوالات سخت ({dueHardQuestions})
        </Link>
      )}

      {/* Toggle (only for questions tab) */}
      {tab === TAB.QUESTIONS && questionCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAnswersByDefault(!showAnswersByDefault)}
          role="switch"
          aria-checked={showAnswersByDefault}
          className={[
            'flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-right transition-all',
            showAnswersByDefault
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
          ].join(' ')}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={[
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                showAnswersByDefault
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
              ].join(' ')}
            >
              {showAnswersByDefault ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                نمایش پاسخ‌ها از ابتدا
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {showAnswersByDefault
                  ? 'پاسخ‌ها بدون نیاز به پاسخ دادن نمایش داده می‌شوند'
                  : 'ابتدا باید پاسخ دهید یا روی «نمایش پاسخ» بزنید'}
              </p>
            </div>
          </div>

          <span
            aria-hidden="true"
            className={[
              'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
              showAnswersByDefault ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700',
            ].join(' ')}
          >
            <span
              className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
              style={{
                transform: showAnswersByDefault
                  ? 'translateX(-20px)'
                  : 'translateX(0)',
              }}
            />
          </span>
        </button>
      )}

      {/* Empty state for current tab */}
      {activeCount === 0 && (
        <EmptyState
          icon={tab === TAB.CARDS ? Layers : FileQuestion}
          title={
            tab === TAB.CARDS
              ? 'هنوز کارت سختی ذخیره نکرده‌اید'
              : 'هنوز سوال سختی ذخیره نکرده‌اید'
          }
          description={
            tab === TAB.CARDS
              ? 'روی کارت‌های دشوار دکمه‌ی ⭐ را بزنید.'
              : 'در صفحه‌ی نمونه سوالات یا مرور، روی سوال‌های دشوار دکمه‌ی ⭐ را بزنید.'
          }
        />
      )}

      {/* Group list */}
      {activeCount > 0 && (
        <div className="space-y-3">
          {activeGroups.map((group) => {
            const expanded = isExpanded(group.id);
            return (
              <div
                key={group.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => toggle(group.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-3 p-4 text-right transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {group.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {group.items.length}{' '}
                        {tab === TAB.CARDS ? 'کارت' : 'سوال'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={[
                      'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500',
                      expanded ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                </button>

                {expanded && (
                  <div className="space-y-4 border-t border-slate-100 p-4 dark:border-slate-800">
                    {tab === TAB.CARDS
                      ? group.items.map((hp) => {
                          const { section, card } = resolveHardPoint(hp);
                          const key = `${hp.sessionId}/${hp.sectionId}/${hp.cardId}`;
                          const missing = !card || !section;

                          return (
                            <div
                              key={key}
                              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-800/30"
                            >
                              {missing ? (
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      این کارت دیگر در محتوای دوره موجود نیست.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeHardPoint(
                                        hp.sessionId,
                                        hp.sectionId,
                                        hp.cardId
                                      )
                                    }
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    حذف
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                      {TYPE_LABELS[card.type] ?? card.type}
                                    </span>
                                    <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                                      {section.title}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-900 dark:text-slate-100">
                                    {getPreview(card)}
                                  </p>

                                  {getSubPreview(card) && (
                                    <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                                      {getSubPreview(card)}
                                    </p>
                                  )}

                                  <div className="mt-3">
                                    <Link
                                      to={`/session/${hp.sessionId}/section/${hp.sectionId}?card=${encodeURIComponent(hp.cardId)}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      مشاهده کارت
                                    </Link>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      : group.items.map((hq) => {
                          const { question } = hq.resolved
                            ? { question: hq.resolved }
                            : resolveHardQuestion(hq);
                          const key = `${hq.examId}-${hq.questionId}`;

                          if (!question) {
                            return (
                              <div
                                key={key}
                                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30"
                              >
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      این سوال دیگر موجود نیست.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <QuestionCard
                              key={key}
                              question={question}
                              showAnswerByDefault={showAnswersByDefault}
                              mode="browse"
                            />
                          );
                        })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}