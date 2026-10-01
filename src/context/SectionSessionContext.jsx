import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

/**
 * Temporary per-section interaction state.
 * Lives only in React memory — NEVER persisted to localStorage.
 *
 * Tracks:
 *   - quiz answers  (selected index + correctness)
 *   - flashcard reveal flags
 *
 * Scoped per section by using key={sectionId} on the Provider,
 * so navigating to another section resets the state.
 */
const SectionSessionContext = createContext(null);

export function SectionSessionProvider({ children }) {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [revealedFlashcards, setRevealedFlashcards] = useState({});

  const submitQuizAnswer = useCallback((cardId, selected, isCorrect) => {
    setQuizAnswers((prev) =>
      prev[cardId] ? prev : { ...prev, [cardId]: { selected, isCorrect } }
    );
  }, []);

  const getQuizAnswer = useCallback(
    (cardId) => quizAnswers[cardId] ?? null,
    [quizAnswers]
  );

  const markFlashcardRevealed = useCallback((cardId) => {
    setRevealedFlashcards((prev) =>
      prev[cardId] ? prev : { ...prev, [cardId]: true }
    );
  }, []);

  const isFlashcardRevealed = useCallback(
    (cardId) => Boolean(revealedFlashcards[cardId]),
    [revealedFlashcards]
  );

  const getQuizStats = useCallback(() => {
    const values = Object.values(quizAnswers);
    const total = values.length;
    const correct = values.filter((a) => a.isCorrect).length;
    const incorrect = total - correct;
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
    return { total, correct, incorrect, percent };
  }, [quizAnswers]);

  const reset = useCallback(() => {
    setQuizAnswers({});
    setRevealedFlashcards({});
  }, []);

  const value = useMemo(
    () => ({
      quizAnswers,
      submitQuizAnswer,
      getQuizAnswer,
      revealedFlashcards,
      markFlashcardRevealed,
      isFlashcardRevealed,
      getQuizStats,
      reset,
    }),
    [
      quizAnswers,
      submitQuizAnswer,
      getQuizAnswer,
      revealedFlashcards,
      markFlashcardRevealed,
      isFlashcardRevealed,
      getQuizStats,
      reset,
    ]
  );

  return (
    <SectionSessionContext.Provider value={value}>
      {children}
    </SectionSessionContext.Provider>
  );
}

/**
 * Returns null when used outside a provider, so components like
 * QuizCard/Flashcard still work standalone.
 */
export function useSectionSession() {
  return useContext(SectionSessionContext);
}