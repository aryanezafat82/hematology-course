import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'hematology-onboarding';

const OnboardingContext = createContext(null);

function readInitial() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

export function OnboardingProvider({ children }) {
  const [seen, setSeen] = useState(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    } catch {
      /* noop */
    }
  }, [seen]);

  const hasSeen = useCallback((key) => Boolean(seen[key]), [seen]);

  const markSeen = useCallback((key) => {
    setSeen((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const reset = useCallback((key) => {
    setSeen((prev) => {
      if (!key) return {};
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ hasSeen, markSeen, reset }),
    [hasSeen, markSeen, reset]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within <OnboardingProvider>');
  }
  return ctx;
}