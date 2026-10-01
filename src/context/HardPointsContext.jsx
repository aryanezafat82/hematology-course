import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Hard Points = USER STATE. Never stored inside content JSON.
 *
 * Storage shape (single key):
 * {
 *   "session-01/section-02/card-05": {
 *     "sessionId": "session-01",
 *     "sectionId": "section-02",
 *     "cardId": "session-01-section-02-card-05"
 *   },
 *   ...
 * }
 */
const STORAGE_KEY = 'hematology-hard-points';

const HardPointsContext = createContext(null);

function keyOf(sessionId, sectionId, cardId) {
  return `${sessionId}/${sectionId}/${cardId}`;
}

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
        typeof value.cardId === 'string'
      ) {
        cleaned[keyOf(value.sessionId, value.sectionId, value.cardId)] = {
          sessionId: value.sessionId,
          sectionId: value.sectionId,
          cardId: value.cardId,
        };
      }
    }
    return cleaned;
  } catch {
    // Corrupt JSON → empty collection, never crash.
    return {};
  }
}

export function HardPointsProvider({ children }) {
  const [map, setMap] = useState(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      /* quota / private mode — silently ignore */
    }
  }, [map]);

  const isHardPoint = useCallback(
    (sessionId, sectionId, cardId) =>
      Boolean(map[keyOf(sessionId, sectionId, cardId)]),
    [map]
  );

  const addHardPoint = useCallback((sessionId, sectionId, cardId) => {
    const k = keyOf(sessionId, sectionId, cardId);
    setMap((prev) => {
      if (prev[k]) return prev;
      return { ...prev, [k]: { sessionId, sectionId, cardId } };
    });
  }, []);

  const removeHardPoint = useCallback((sessionId, sectionId, cardId) => {
    const k = keyOf(sessionId, sectionId, cardId);
    setMap((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  }, []);

  const toggleHardPoint = useCallback((sessionId, sectionId, cardId) => {
    const k = keyOf(sessionId, sectionId, cardId);
    setMap((prev) => {
      if (prev[k]) {
        const next = { ...prev };
        delete next[k];
        return next;
      }
      return { ...prev, [k]: { sessionId, sectionId, cardId } };
    });
  }, []);

  const getHardPoints = useCallback(() => Object.values(map), [map]);
  const getHardPointCount = useCallback(() => Object.keys(map).length, [map]);

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
      isHardPoint,
      addHardPoint,
      removeHardPoint,
      toggleHardPoint,
      getHardPoints,
      getHardPointCount,
      clearHardPoints,
    }),
    [
      isHardPoint,
      addHardPoint,
      removeHardPoint,
      toggleHardPoint,
      getHardPoints,
      getHardPointCount,
      clearHardPoints,
    ]
  );

  return (
    <HardPointsContext.Provider value={value}>
      {children}
    </HardPointsContext.Provider>
  );
}

export function useHardPoints() {
  const ctx = useContext(HardPointsContext);
  if (!ctx) {
    throw new Error('useHardPoints must be used within <HardPointsProvider>');
  }
  return ctx;
}