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
} from 'lucide-react';
import { getSessionData, getSessionMeta } from '../data/loaders.js';
import { useHardPoints } from '../context/HardPointsContext.jsx';
import { useReview } from '../context/ReviewContext.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const TYPE_LABELS = {
  info: 'اطلاعات',
  key_point: 'نکته کلیدی',
  table: 'جدول',
  flashcard: 'فلش‌کارت',
  quiz: 'پرسش',
};

function resolveHardPoint(hp) {
  const meta = getSessionMeta(hp.sessionId);
  const session = getSessionData(hp.sessionId);
  if (!session) return { meta, session: null, section: null, card: null };

  const section =
    session.sections?.find((s) => s.id === hp.sectionId) ?? null;
  if (!section) return { meta, session, section: null, card: null };

  const card = section.cards?.find((c) => c.id === hp.cardId) ?? null;
  return { meta, session, section, card };
}

function getPreview(card) {
  if (!card) return '';
  if (card.type === 'info' || card.type === 'key_point') {
    return card.title || (card.content ? card.content.slice(0, 80) : '');
  }
  if (card.type === 'table') {
    return card.title || 'جدول مقایسه‌ای';
  }
  if (card.type === 'flashcard' || card.type === 'quiz') {
    return card.question || '';
  }
  return card.title || '';
}

function getSubPreview(card) {
  if (!card) return '';
  if (card.type === 'info' || card.type === 'key_point') {
    return card.content ?? '';
  }
  return '';
}

export default function HardPoints() {
  const {
    getHardPoints,
    getHardPointCount,
    isHardPoint,
    removeHardPoint,
    clearHardPoints,
  } = useHardPoints();

  const { getDueReviews } = useReview();

  const list = getHardPoints();
  const count = getHardPointCount();

  // ---- Group by session ----
  const grouped = useMemo(() => {
    const map = new Map();
    for (const hp of list) {
      if (!map.has(hp.sessionId)) {
        const data = getSessionData(hp.sessionId);
        const meta = getSessionMeta(hp.sessionId);
        map.set(hp.sessionId, {
          sessionId: hp.sessionId,
          title: data?.title ?? meta?.title ?? hp.sessionId,
          items: [],
        });
      }
      map.get(hp.sessionId).items.push(hp);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.sessionId.localeCompare(b.sessionId)
    );
  }, [list]);

  // ---- Expanded state (first session open by default) ----
  const [manual, setManual] = useState({});

  function isExpanded(sessionId) {
    if (sessionId in manual) return manual[sessionId];
    return sessionId === grouped[0]?.sessionId;
  }

  function toggle(sessionId) {
    setManual((prev) => ({
      ...prev,
      [sessionId]: !isExpanded(sessionId),
    }));
  }

  const dueHardCount = useMemo(
    () =>
      getDueReviews().filter((it) =>
        isHardPoint(it.sessionId, it.sectionId, it.cardId)
      ).length,
    [getDueReviews, isHardPoint]
  );

  function handleClearAll() {
    const ok = window.confirm(
      'آیا مطمئن هستید که می‌خواهید همه نکات سخت را حذف کنید؟'
    );
    if (ok) clearHardPoints();
  }

  // ---- Empty state ----
  if (count === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            نکات سخت
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            مرور کارت‌های دشوار
          </p>
        </header>

        <EmptyState
          icon={Star}
          title="هنوز کارت سختی ذخیره نکرده‌اید."
          description="هنگام مطالعه، روی «سخت بود» بزنید تا کارت برای مرور بعدی اینجا ذخیره شود."
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            نکات سخت
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {count} کارت در {grouped.length}{' '}
            {grouped.length === 1 ? 'جلسه' : 'جلسه'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {dueHardCount > 0 && (
            <Link
              to="/review?mode=hard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
            >
              <Repeat className="h-3.5 w-3.5" />
              مرور کارت‌های سخت ({dueHardCount})
            </Link>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            پاک کردن همه
          </button>
        </div>
      </header>

      {/* Session groups (accordion) */}
      <div className="space-y-3">
        {grouped.map((group) => {
          const expanded = isExpanded(group.sessionId);

          return (
            <div
              key={group.sessionId}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Header (clickable) */}
              <button
                type="button"
                onClick={() => toggle(group.sessionId)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-3 p-4 text-right transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-slate-800/50"
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
                      {group.items.length} کارت
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

              {/* Items */}
              {expanded && (
                <ul className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
                  {group.items.map((hp) => {
                    const { section, card } = resolveHardPoint(hp);
                    const key = `${hp.sessionId}/${hp.sectionId}/${hp.cardId}`;
                    const missing = !card || !section;

                    return (
                      <li
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
                              <p className="mt-1 break-all font-mono text-[11px] text-slate-400 dark:text-slate-500">
                                {key}
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
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
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

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Link
                                to={`/session/${hp.sessionId}/section/${hp.sectionId}?card=${encodeURIComponent(hp.cardId)}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                مشاهده کارت
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  removeHardPoint(
                                    hp.sessionId,
                                    hp.sectionId,
                                    hp.cardId
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                حذف
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}