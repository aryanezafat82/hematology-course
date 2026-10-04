import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { addDays, computeNextInterval, startOfToday } from '../utils/reviewUtils.js';

const STORAGE_KEY = 'hematology-review';
const QUESTION_PREFIX = '__q__';

const ReviewContext = createContext(null);

function cardKey(sessionId, sectionId, cardId) {
  return `${sessionId}/${sectionId}/${cardId}`;
}

function questionKey(examId, questionId) {
  return `${QUESTION_PREFIX}/${examId}/${questionId}`;
}

function readInitial() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const cleaned = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!value || typeof value !== 'object') continue;

      if (key.startsWith(QUESTION_PREFIX)) {
        if (
          typeof value.examId === 'string' &&
          typeof value.questionId === 'string' &&
          typeof value.nextReviewAt === 'string' &&
          typeof value.interval === 'number' &&
          typeof value.reviewCount === 'number'
        ) {
          cleaned[key] = {
            kind: 'question',
            examId: value.examId,
            questionId: value.questionId,
            status: typeof value.status === 'string' ? value.status : 'learning',
            nextReviewAt: value.nextReviewAt,
            interval: value.interval,
            reviewCount: value.reviewCount,
            lastReviewedAt:
              typeof value.lastReviewedAt === 'string' ? value.lastReviewedAt : null,
          };
        }
      } else {
        if (
          typeof value.sessionId === 'string' &&
          typeof value.sectionId === 'string' &&
          typeof value.cardId === 'string' &&
          typeof value.nextReviewAt === 'string' &&
          typeof value.interval === 'number' &&
          typeof value.reviewCount === 'number'
        ) {
          cleaned[key] = {
            kind: 'card',
            sessionId: value.sessionId,
            sectionId: value.sectionId,
            cardId: value.cardId,
            status: typeof value.status === 'string' ? value.status : 'learning',
            nextReviewAt: value.nextReviewAt,
            interval: value.interval,
            reviewCount: value.reviewCount,
            lastReviewedAt:
              typeof value.lastReviewedAt === 'string' ? value.lastReviewedAt : null,
          };
        }
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

function makeInitialCardItem(sessionId, sectionId, cardId) {
  return {
    kind: 'card',
    sessionId,
    sectionId,
    cardId,
    status: 'learning',
    nextReviewAt: addDays(new Date(), 1).toISOString(),
    interval: 1,
    reviewCount: 0,
    lastReviewedAt: null,
  };
}

function makeInitialQuestionItem(examId, questionId) {
  return {
    kind: 'question',
    examId,
    questionId,
    status: 'learning',
    nextReviewAt: addDays(new Date(), 1).toISOString(),
    interval: 1,
    reviewCount: 0,
    lastReviewedAt: null,
  };
}

export function ReviewProvider({ children }) {
  const [items, setItems] = useState(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* noop */
    }
  }, [items]);

  /* ---------- Card APIs (existing) ---------- */

  const getReviewItem = useCallback(
    (sessionId, sectionId, cardId) =>
      items[cardKey(sessionId, sectionId, cardId)] ?? null,
    [items]
  );

  const isInReview = useCallback(
    (sessionId, sectionId, cardId) =>
      Boolean(items[cardKey(sessionId, sectionId, cardId)]),
    [items]
  );

  const addToReview = useCallback((sessionId, sectionId, cardId) => {
    const k = cardKey(sessionId, sectionId, cardId);
    setItems((prev) => {
      if (prev[k]) return prev;
      return { ...prev, [k]: makeInitialCardItem(sessionId, sectionId, cardId) };
    });
  }, []);

  const removeFromReview = useCallback((sessionId, sectionId, cardId) => {
    const k = cardKey(sessionId, sectionId, cardId);
    setItems((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  }, []);

  const toggleReview = useCallback((sessionId, sectionId, cardId) => {
    const k = cardKey(sessionId, sectionId, cardId);
    setItems((prev) => {
      if (prev[k]) {
        const next = { ...prev };
        delete next[k];
        return next;
      }
      return { ...prev, [k]: makeInitialCardItem(sessionId, sectionId, cardId) };
    });
  }, []);

  const rateReview = useCallback((sessionId, sectionId, cardId, rating) => {
    const k = cardKey(sessionId, sectionId, cardId);
    const now = new Date();
    setItems((prev) => {
      const item = prev[k];
      if (!item) return prev;
      const newInterval = computeNextInterval(item.interval ?? 1, rating);
      const nextDate = addDays(now, newInterval);
      return {
        ...prev,
        [k]: {
          ...item,
          interval: newInterval,
          nextReviewAt: nextDate.toISOString(),
          lastReviewedAt: now.toISOString(),
          reviewCount: (item.reviewCount ?? 0) + 1,
          status: rating === 'forgot' ? 'learning' : 'review',
        },
      };
    });
  }, []);

  /* ---------- Question APIs (new) ---------- */

  const isQuestionInReview = useCallback(
    (examId, questionId) => Boolean(items[questionKey(examId, questionId)]),
    [items]
  );

  const toggleQuestionReview = useCallback((examId, questionId) => {
    const k = questionKey(examId, questionId);
    setItems((prev) => {
      if (prev[k]) {
        const next = { ...prev };
        delete next[k];
        return next;
      }
      return { ...prev, [k]: makeInitialQuestionItem(examId, questionId) };
    });
  }, []);

  const rateQuestionReview = useCallback((examId, questionId, rating) => {
    const k = questionKey(examId, questionId);
    const now = new Date();
    setItems((prev) => {
      const item = prev[k];
      if (!item) return prev;
      const newInterval = computeNextInterval(item.interval ?? 1, rating);
      const nextDate = addDays(now, newInterval);
      return {
        ...prev,
        [k]: {
          ...item,
          interval: newInterval,
          nextReviewAt: nextDate.toISOString(),
          lastReviewedAt: now.toISOString(),
          reviewCount: (item.reviewCount ?? 0) + 1,
          status: rating === 'forgot' ? 'learning' : 'review',
        },
      };
    });
  }, []);

  /* ---------- Queries (with optional kind filter) ---------- */

  const getDueReviews = useCallback(
    (opts = {}) => {
      const { kind = 'all' } = opts;
      const now = new Date();
      return Object.values(items)
        .filter((it) => {
          if (kind !== 'all' && it.kind !== kind) return false;
          return new Date(it.nextReviewAt).getTime() <= now.getTime();
        })
        .sort((a, b) => {
          const ta = new Date(a.nextReviewAt).getTime();
          const tb = new Date(b.nextReviewAt).getTime();
          if (ta !== tb) return ta - tb;
          return 0;
        });
    },
    [items]
  );

  const getDueCount = useCallback(
    (opts) => getDueReviews(opts).length,
    [getDueReviews]
  );

  const getOverdueCount = useCallback(
    (opts = {}) => {
      const { kind = 'all' } = opts;
      const cutoff = startOfToday().getTime();
      return Object.values(items).filter((it) => {
        if (kind !== 'all' && it.kind !== kind) return false;
        return new Date(it.nextReviewAt).getTime() < cutoff;
      }).length;
    },
    [items]
  );

  const getUpcomingCount = useCallback(
    (opts = {}) => {
      const { kind = 'all' } = opts;
      const now = new Date().getTime();
      return Object.values(items).filter((it) => {
        if (kind !== 'all' && it.kind !== kind) return false;
        return new Date(it.nextReviewAt).getTime() > now;
      }).length;
    },
    [items]
  );

  const getTotalCount = useCallback(
    (opts = {}) => {
      const { kind = 'all' } = opts;
      return Object.values(items).filter(
        (it) => kind === 'all' || it.kind === kind
      ).length;
    },
    [items]
  );

  const getAllItems = useCallback(
    (opts = {}) => {
      const { kind = 'all' } = opts;
      return Object.values(items).filter(
        (it) => kind === 'all' || it.kind === kind
      );
    },
    [items]
  );

  const clearAll = useCallback(() => {
    setItems({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({
      // cards
      getReviewItem,
      isInReview,
      addToReview,
      removeFromReview,
      toggleReview,
      rateReview,
      // questions
      isQuestionInReview,
      toggleQuestionReview,
      rateQuestionReview,
      // shared
      getDueReviews,
      getDueCount,
      getOverdueCount,
      getUpcomingCount,
      getTotalCount,
      getAllItems,
      clearAll,
    }),
    [
      getReviewItem,
      isInReview,
      addToReview,
      removeFromReview,
      toggleReview,
      rateReview,
      isQuestionInReview,
      toggleQuestionReview,
      rateQuestionReview,
      getDueReviews,
      getDueCount,
      getOverdueCount,
      getUpcomingCount,
      getTotalCount,
      getAllItems,
      clearAll,
    ]
  );

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReview must be used within <ReviewProvider>');
  return ctx;
}