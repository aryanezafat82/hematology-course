import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'hematology-hard-points';
const QUESTION_PREFIX = '__q__';

const HardPointsContext = createContext(null);

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
          typeof value.questionId === 'string'
        ) {
          cleaned[key] = {
            kind: 'question',
            examId: value.examId,
            questionId: value.questionId,
          };
        }
      } else {
        if (
          typeof value.sessionId === 'string' &&
          typeof value.sectionId === 'string' &&
          typeof value.cardId === 'string'
        ) {
          cleaned[key] = {
            kind: 'card',
            sessionId: value.sessionId,
            sectionId: value.sectionId,
            cardId: value.cardId,
          };
        }
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function HardPointsProvider({ children }) {
  const [map, setMap] = useState(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      /* noop */
    }
  }, [map]);

  /* ---------- Card APIs (existing) ---------- */

  const isHardPoint = useCallback(
    (sessionId, sectionId, cardId) =>
      Boolean(map[cardKey(sessionId, sectionId, cardId)]),
    [map]
  );

  const toggleHardPoint = useCallback((sessionId, sectionId, cardId) => {
    const k = cardKey(sessionId, sectionId, cardId);
    setMap((prev) => {
      if (prev[k]) {
        const next = { ...prev };
        delete next[k];
        return next;
      }
      return { ...prev, [k]: { kind: 'card', sessionId, sectionId, cardId } };
    });
  }, []);

  const removeHardPoint = useCallback((sessionId, sectionId, cardId) => {
    const k = cardKey(sessionId, sectionId, cardId);
    setMap((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  }, []);

  /* ---------- Question APIs (new) ---------- */

  const isQuestionHardPoint = useCallback(
    (examId, questionId) => Boolean(map[questionKey(examId, questionId)]),
    [map]
  );

  const toggleQuestionHardPoint = useCallback((examId, questionId) => {
    const k = questionKey(examId, questionId);
    setMap((prev) => {
      if (prev[k]) {
        const next = { ...prev };
        delete next[k];
        return next;
      }
      return { ...prev, [k]: { kind: 'question', examId, questionId } };
    });
  }, []);

  const removeQuestionHardPoint = useCallback((examId, questionId) => {
    const k = questionKey(examId, questionId);
    setMap((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  }, []);

  /* ---------- Queries ---------- */

  const getHardPoints = useCallback(
    (opts = {}) => {
      const { kind = 'all' } = opts;
      return Object.values(map).filter((it) => kind === 'all' || it.kind === kind);
    },
    [map]
  );

  const getHardPointCount = useCallback(
    (opts = {}) => getHardPoints(opts).length,
    [getHardPoints]
  );

  const clearHardPoints = useCallback(() => {
    setMap({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({
      // cards
      isHardPoint,
      toggleHardPoint,
      removeHardPoint,
      // questions
      isQuestionHardPoint,
      toggleQuestionHardPoint,
      removeQuestionHardPoint,
      // shared
      getHardPoints,
      getHardPointCount,
      clearHardPoints,
    }),
    [
      isHardPoint,
      toggleHardPoint,
      removeHardPoint,
      isQuestionHardPoint,
      toggleQuestionHardPoint,
      removeQuestionHardPoint,
      getHardPoints,
      getHardPointCount,
      clearHardPoints,
    ]
  );

  return (
    <HardPointsContext.Provider value={value}>{children}</HardPointsContext.Provider>
  );
}

export function useHardPoints() {
  const ctx = useContext(HardPointsContext);
  if (!ctx) throw new Error('useHardPoints must be used within <HardPointsProvider>');
  return ctx;
}