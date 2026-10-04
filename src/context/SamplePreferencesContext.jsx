import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'hematology-sample-show-answers';

const SamplePreferencesContext = createContext(null);

export function SamplePreferencesProvider({ children }) {
  const [showAnswersByDefault, setShowState] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(showAnswersByDefault));
    } catch {
      /* noop */
    }
  }, [showAnswersByDefault]);

  const value = useMemo(
    () => ({ showAnswersByDefault, setShowAnswersByDefault: setShowState }),
    [showAnswersByDefault]
  );

  return (
    <SamplePreferencesContext.Provider value={value}>
      {children}
    </SamplePreferencesContext.Provider>
  );
}

export function useSamplePreferences() {
  const ctx = useContext(SamplePreferencesContext);
  if (!ctx) {
    throw new Error('useSamplePreferences must be used within <SamplePreferencesProvider>');
  }
  return ctx;
}