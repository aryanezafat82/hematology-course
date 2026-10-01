import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { getSessions, getSessionData } from '../data/loaders.js';

/**
 * Single source of truth for the user's learning state.
 * Persisted to localStorage under ONE key.
 *
 * Shape:
 * {
 *   completedSections: ["session-01/section-01", ...],
 *   lastStudied: { sessionId, sectionId } | null
 * }
 *
 * Content JSON is NEVER stored here — only user state.
 */
const STORAGE_KEY = 'hematology-progress';

const ProgressContext = createContext(null);

function emptyState() {
  return { completedSections: [], lastStudied: null };
}

function keyOf(sessionId, sectionId) {
  return `${sessionId}/${sectionId}`;
}

function readInitialState() {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const parsed = JSON.parse(raw);

    const completedSections = Array.isArray(parsed?.completedSections)
      ? parsed.completedSections.filter((x) => typeof x === 'string')
      : [];

    let lastStudied = null;
    if (
      parsed?.lastStudied &&
      typeof parsed.lastStudied.sessionId === 'string' &&
      typeof parsed.lastStudied.sectionId === 'string'
    ) {
      lastStudied = {
        sessionId: parsed.lastStudied.sessionId,
        sectionId: parsed.lastStudied.sectionId,
      };
    }

    return { completedSections, lastStudied };
  } catch {
    // Corrupt JSON → start fresh, never crash.
    return emptyState();
  }
}

export function ProgressProvider({ children }) {
  const [state, setState] = useState(readInitialState);

  // Persist on every change. Quota / private-mode errors are swallowed.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state]);

  /**
   * Content-derived totals. Recomputed once from the JSON layer.
   * `validKeys` lets us ignore stale completion entries if content changes.
   */
  const content = useMemo(() => {
    const sessions = getSessions();
    const perSession = {};
    const validKeys = new Set();
    let totalSections = 0;

    for (const s of sessions) {
      const data = getSessionData(s.id);
      const sections = data?.sections ?? [];
      perSession[s.id] = sections.length;
      totalSections += sections.length;
      for (const sec of sections) {
        validKeys.add(keyOf(s.id, sec.id));
      }
    }

    return { sessions, perSession, totalSections, validKeys };
  }, []);

  const isSectionCompleted = useCallback(
    (sessionId, sectionId) =>
      state.completedSections.includes(keyOf(sessionId, sectionId)),
    [state.completedSections]
  );

  const completeSection = useCallback((sessionId, sectionId) => {
    const key = keyOf(sessionId, sectionId);
    setState((prev) => {
      const completedSections = prev.completedSections.includes(key)
        ? prev.completedSections
        : [...prev.completedSections, key];
      return {
        completedSections,
        lastStudied: { sessionId, sectionId },
      };
    });
  }, []);

  const setLastStudied = useCallback((sessionId, sectionId) => {
    setState((prev) => {
      if (
        prev.lastStudied?.sessionId === sessionId &&
        prev.lastStudied?.sectionId === sectionId
      ) {
        return prev;
      }
      return { ...prev, lastStudied: { sessionId, sectionId } };
    });
  }, []);

  const getLastStudied = useCallback(() => state.lastStudied, [state.lastStudied]);

  const getSessionProgress = useCallback(
    (sessionId) => {
      const total = content.perSession[sessionId] ?? 0;
      let completed = 0;
      const prefix = `${sessionId}/`;
      for (const key of state.completedSections) {
        if (key.startsWith(prefix) && content.validKeys.has(key)) {
          completed += 1;
        }
      }
      if (completed > total) completed = total;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { completed, total, percent };
    },
    [state.completedSections, content]
  );

  const getOverallProgress = useCallback(() => {
    let completed = 0;
    for (const key of state.completedSections) {
      if (content.validKeys.has(key)) completed += 1;
    }
    const total = content.totalSections;
    if (completed > total) completed = total;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percent };
  }, [state.completedSections, content]);

  const getCompletedSessionsCount = useCallback(() => {
    let count = 0;
    for (const s of content.sessions) {
      const { completed, total } = getSessionProgress(s.id);
      if (total > 0 && completed === total) count += 1;
    }
    return count;
  }, [content, getSessionProgress]);

  const resetProgress = useCallback(() => {
    setState(emptyState());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({
      isSectionCompleted,
      completeSection,
      setLastStudied,
      getLastStudied,
      getSessionProgress,
      getOverallProgress,
      getCompletedSessionsCount,
      resetProgress,
    }),
    [
      isSectionCompleted,
      completeSection,
      setLastStudied,
      getLastStudied,
      getSessionProgress,
      getOverallProgress,
      getCompletedSessionsCount,
      resetProgress,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within <ProgressProvider>');
  }
  return ctx;
}