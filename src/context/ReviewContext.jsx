import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addDays,
  computeNextInterval,
  reviewKey,
  startOfToday,
} from '../utils/reviewUtils.js';

const STORAGE_KEY = 'hematology-review';

const ReviewContext = createContext(null);

function readInitial() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const cleaned = {};
    for (const value of Object.values(parsed)) {
      if (
        value &&
        typeof value === 'object' &&
        typeof value.sessionId === 'string' &&
        typeof value.sectionId === 'string' &&
        typeof value.cardId === 'string' &&
        typeof value.nextReviewAt === 'string' &&
        typeof value.interval === 'number' &&
        typeof value.reviewCount === 'number'
      ) {
        cleaned[reviewKey(value.sessionId, value.sectionId, value.cardId)] = {
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
    return cleaned;
  } catch {
    return {};
  }
}

function makeInitialItem(sessionId, sectionId, cardId) {
  const firstDue = addDays(new Date(), 1).toISOString();
  return {
    sessionId,
    sectionId,
    cardId,
    status: 'learning',
    nextReviewAt: firstDue,
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
      /* quota / private mode */
    }
  }, [items]);

  const getReviewItem = useCallback(
    (sessionId, sectionId, cardId) =>
      items[reviewKey(sessionId, sectionId, cardId)] ?? null,
    [items]
  );

  const isInReview = useCallback(
    (sessionId, sectionId, cardId) =>
      Boolean(items[reviewKey(sessionId, sectionId, cardId)]),
    [items]
  );

  const addToReview = useCallback((sessionId, sectionId, cardId) => {
    const key = reviewKey(sessionId, sectionId, cardId);
    setItems((prev) => {
      if (prev[key]) return prev;
      return {
        ...prev,
        [key]: makeInitialItem(sessionId, sectionId, cardId),
      };
    });
  }, []);

  const removeFromReview = useCallback((sessionId, sectionId, cardId) => {
    const key = reviewKey(sessionId, sectionId, cardId);
    setItems((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const toggleReview = useCallback((sessionId, sectionId, cardId) => {
    const key = reviewKey(sessionId, sectionId, cardId);
    setItems((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: makeInitialItem(sessionId, sectionId, cardId),
      };
    });
  }, []);

  const rateReview = useCallback((sessionId, sectionId, cardId, rating) => {
    const key = reviewKey(sessionId, sectionId, cardId);
    const now = new Date();

    setItems((prev) => {
      const item = prev[key];
      if (!item) return prev;

      const newInterval = computeNextInterval(item.interval ?? 1, rating);
      const nextDate = addDays(now, newInterval);

      return {
        ...prev,
        [key]: {
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

  const getDueReviews = useCallback(() => {
    const now = new Date();
    return Object.values(items)
      .filter((it) => new Date(it.nextReviewAt).getTime() <= now.getTime())
      .sort((a, b) => {
        const ta = new Date(a.nextReviewAt).getTime();
        const tb = new Date(b.nextReviewAt).getTime();
        if (ta !== tb) return ta - tb;
        return reviewKey(a.sessionId, a.sectionId, a.cardId).localeCompare(
          reviewKey(b.sessionId, b.sectionId, b.cardId)
        );
      });
  }, [items]);

  const getDueCount = useCallback(
    () => getDueReviews().length,
    [getDueReviews]
  );

  const getOverdueCount = useCallback(() => {
    const cutoff = startOfToday().getTime();
    return Object.values(items).filter(
      (it) => new Date(it.nextReviewAt).getTime() < cutoff
    ).length;
  }, [items]);

  const getUpcomingCount = useCallback(() => {
    const now = new Date().getTime();
    return Object.values(items).filter(
      (it) => new Date(it.nextReviewAt).getTime() > now
    ).length;
  }, [items]);

  const getTotalCount = useCallback(
    () => Object.keys(items).length,
    [items]
  );

  const getAllItems = useCallback(() => Object.values(items), [items]);

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
      getReviewItem,
      isInReview,
      addToReview,
      removeFromReview,
      toggleReview,
      rateReview,
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
      getDueReviews,
      getDueCount,
      getOverdueCount,
      getUpcomingCount,
      getTotalCount,
      getAllItems,
      clearAll,
    ]
  );

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error('useReview must be used within <ReviewProvider>');
  }
  return ctx;
}