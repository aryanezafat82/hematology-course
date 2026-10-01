import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Repeat,
} from 'lucide-react';
import {
  getSessionData,
  getSessionMeta,
  getSection,
  getSessions,
} from '../data/loaders.js';
import EmptyState from '../components/common/EmptyState.jsx';
import CardRenderer from '../components/cards/CardRenderer.jsx';
import CardTransition from '../components/common/CardTransition.jsx';
import Button from '../components/common/Button.jsx';
import SwipeTutorial from '../components/onboarding/SwipeTutorial.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useOnboarding } from '../context/OnboardingContext.jsx';
import {
  SectionSessionProvider,
  useSectionSession,
} from '../context/SectionSessionContext.jsx';
import QuizProgress from '../components/quiz/QuizProgress.jsx';
import QuizResults from '../components/quiz/QuizResults.jsx';
import WrongAnswerReview from '../components/quiz/WrongAnswerReview.jsx';

const PHASE = { CARDS: 'cards', SUMMARY: 'summary', WRONG_REVIEW: 'wrongReview' };

const SWIPE_MIN_DISTANCE = 60;
const SWIPE_MAX_DURATION = 800;
const SHAKE_DURATION = 350;

export default function Section() {
  const { sessionId, sectionId } = useParams();
  const meta = getSessionMeta(sessionId);
  const session = getSessionData(sessionId);
  const section = getSection(sessionId, sectionId);

  const { setLastStudied } = useProgress();

  useEffect(() => {
    if (session && section && sessionId && sectionId) {
      setLastStudied(sessionId, sectionId);
    }
  }, [session, section, sessionId, sectionId, setLastStudied]);

  if (!session || !section) {
    return (
      <EmptyState
        title="بخش پیدا نشد"
        description="بخش مورد نظر در این جلسه وجود ندارد."
        action={
          <Link
            to={`/session/${sessionId}`}
            className="text-sm font-medium text-rose-600 hover:underline dark:text-rose-400"
          >
            بازگشت به جلسه
          </Link>
        }
      />
    );
  }

  return (
    <SectionSessionProvider key={sectionId}>
      <SectionPlayer
        sessionId={sessionId}
        sectionId={sectionId}
        meta={meta}
        session={session}
        section={section}
      />
    </SectionSessionProvider>
  );
}

function SectionPlayer({ sessionId, sectionId, meta, session, section }) {
  const cards = useMemo(() => section.cards ?? [], [section]);

  const { isSectionCompleted, completeSection } = useProgress();
  const { hasSeen, markSeen } = useOnboarding();
  const {
    getQuizAnswer,
    isFlashcardRevealed,
    getQuizStats,
  } = useSectionSession();

  const completed = isSectionCompleted(sessionId, sectionId);

  const [phase, setPhase] = useState(PHASE.CARDS);
  const [index, setIndex] = useState(0);

  // ---- Swipe tutorial ----
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);

  useEffect(() => {
    if (cards.length > 1 && !hasSeen('swipe-navigation')) {
      setShowSwipeTutorial(true);
    }
  }, [cards.length, hasSeen]);

  function dismissTutorial({ permanently }) {
    setShowSwipeTutorial(false);
    if (permanently) markSeen('swipe-navigation');
  }

  // ---- Shake feedback ----
  const [shakeActive, setShakeActive] = useState(false);
  const shakeTimerRef = useRef(null);

  function triggerShake() {
    setShakeActive(false);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    requestAnimationFrame(() => {
      setShakeActive(true);
      shakeTimerRef.current = setTimeout(
        () => setShakeActive(false),
        SHAKE_DURATION
      );
    });
  }

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  // ---- Swipe visual state ----
  const swipeAreaRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const [searchParams] = useSearchParams();
  const targetCardId = searchParams.get('card');
  const appliedTargetRef = useRef(null);

  useEffect(() => {
    if (!targetCardId) return;
    if (appliedTargetRef.current === targetCardId) return;

    const idx = cards.findIndex((c) => c.id === targetCardId);
    if (idx >= 0) {
      appliedTargetRef.current = targetCardId;
      setIndex(idx);
      setPhase(PHASE.CARDS);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [targetCardId, cards]);

  const currentCard = cards[index] ?? null;
  const isLast = index === cards.length - 1;

  const quizCards = useMemo(
    () => cards.filter((c) => c.type === 'quiz'),
    [cards]
  );

  const canProceed = useMemo(() => {
    if (!currentCard) return true;
    if (currentCard.type === 'quiz') {
      return Boolean(getQuizAnswer(currentCard.id));
    }
    if (currentCard.type === 'flashcard') {
      return isFlashcardRevealed(currentCard.id);
    }
    return true;
  }, [currentCard, getQuizAnswer, isFlashcardRevealed]);

  const quizStats = getQuizStats();
  const hasQuiz = quizStats.total > 0;

  // ---- Next navigation targets ----
  const sections = session.sections ?? [];

  const { nextSection, nextSession, nextSessionFirstSection } = useMemo(() => {
    const currentSectionIdx = sections.findIndex((s) => s.id === sectionId);
    const nextSec =
      currentSectionIdx >= 0 && currentSectionIdx < sections.length - 1
        ? sections[currentSectionIdx + 1]
        : null;

    const allSessions = getSessions();
    const currentSessionIdx = allSessions.findIndex((s) => s.id === sessionId);
    const nextSess =
      currentSessionIdx >= 0 && currentSessionIdx < allSessions.length - 1
        ? allSessions[currentSessionIdx + 1]
        : null;

    let nextSessFirstSec = null;
    if (nextSess) {
      const data = getSessionData(nextSess.id);
      nextSessFirstSec = data?.sections?.[0] ?? null;
    }

    return {
      nextSection: nextSec,
      nextSession: nextSess,
      nextSessionFirstSection: nextSessFirstSec,
    };
  }, [sections, sectionId, sessionId]);

  function handleComplete() {
    completeSection(sessionId, sectionId);
  }

  function tryGoNext() {
    if (!canProceed) {
      triggerShake();
      return;
    }
    if (!isLast) {
      setIndex((i) => i + 1);
    } else {
      setPhase(PHASE.SUMMARY);
    }
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  // Keep the latest callbacks in refs so the touch-effect can stay attached once.
  const callbacksRef = useRef({ tryGoNext, goPrev });
  callbacksRef.current.tryGoNext = tryGoNext;
  callbacksRef.current.goPrev = goPrev;

  // ---- Swipe via touch events ----
  useEffect(() => {
    const el = swipeAreaRef.current;
    if (!el) return;

    // Skip if the browser doesn't support touch (desktop-only).
    if (!('ontouchstart' in window)) return;

    let state = null;
    // state = { mode: 'undecided' | 'swipe' | 'scroll' | 'native', startX, startY, time }

    function isInteractiveTarget(t) {
      if (!t || !(t instanceof Element)) return false;
      return Boolean(
        t.closest('button, a, input, textarea, select, [role="button"]')
      );
    }

    function isInsideHorizontalScroll(t) {
      let node = t;
      while (node && node !== document.body) {
        if (node instanceof Element) {
          const style = window.getComputedStyle(node);
          const ox = style.overflowX;
          if (
            (ox === 'auto' || ox === 'scroll') &&
            node.scrollWidth > node.clientWidth
          ) {
            return true;
          }
        }
        node = node.parentElement;
      }
      return false;
    }

    function onStart(e) {
      if (e.touches.length !== 1) {
        state = null;
        return;
      }
      const t = e.touches[0];

      // Ignore touches that start on interactive controls or on a
      // horizontally scrollable container (e.g. a wide table).
      if (isInteractiveTarget(t.target) || isInsideHorizontalScroll(t.target)) {
        state = { mode: 'native' };
        return;
      }

      state = {
        mode: 'undecided',
        startX: t.clientX,
        startY: t.clientY,
        time: Date.now(),
      };
    }

    function onMove(e) {
      if (!state || state.mode === 'native') return;
      if (e.touches.length !== 1) return;

      const t = e.touches[0];
      const dx = t.clientX - state.startX;
      const dy = t.clientY - state.startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (state.mode === 'undecided') {
        if (absDx < 8 && absDy < 8) return;
        if (absDx > absDy) {
          state.mode = 'swipe';
          setDragging(true);
        } else {
          state.mode = 'scroll';
          return;
        }
      }

      if (state.mode === 'swipe') {
        // Prevent the browser from interpreting this as a pan.
        if (e.cancelable) e.preventDefault();
        const dampened = Math.sign(dx) * Math.min(absDx * 0.4, 90);
        setDragX(dampened);
      }
    }

    function onEnd(e) {
      const s = state;
      state = null;
      setDragging(false);
      setDragX(0);

      if (!s || s.mode !== 'swipe') return;

      const t = e.changedTouches?.[0];
      if (!t) return;

      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;
      const dt = Date.now() - s.time;

      if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return;
      if (dt > SWIPE_MAX_DURATION) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.7) return;

      // RTL: swipe right (dx > 0) → next, swipe left (dx < 0) → previous.
      if (dx > 0) callbacksRef.current.tryGoNext();
      else callbacksRef.current.goPrev();
    }

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const backLink = (
    <Link
      to={`/session/${sessionId}`}
      className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
    >
      <ArrowRight className="h-4 w-4" />
      {meta?.title ?? 'بازگشت به جلسه'}
    </Link>
  );

  // ---- Empty section ----
  if (cards.length === 0) {
    return (
      <div className="space-y-6">
        {backLink}
        <header className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {section.title}
          </h1>
          {section.description && (
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              {section.description}
            </p>
          )}
        </header>
        <EmptyState
          title="کارتی برای نمایش نیست"
          description="این بخش هیچ کارتی ندارد."
        />
        <footer className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <Button
            variant={completed ? 'secondary' : 'primary'}
            onClick={handleComplete}
            disabled={completed}
          >
            <CheckCircle2 className="h-4 w-4" />
            {completed ? 'تکمیل شده' : 'تکمیل بخش'}
          </Button>
        </footer>
      </div>
    );
  }

  // ---- Wrong-answer review ----
  if (phase === PHASE.WRONG_REVIEW) {
    return (
      <div className="space-y-6">
        {backLink}
        <WrongAnswerReview
          cards={cards}
          onBack={() => setPhase(PHASE.SUMMARY)}
        />
      </div>
    );
  }

  // ---- Summary ----
  if (phase === PHASE.SUMMARY) {
    const hasNextSection = Boolean(nextSection);
    const hasNextSession = !hasNextSection && Boolean(nextSessionFirstSection);
    const isCourseEnd = !hasNextSection && !hasNextSession;

    return (
      <div className="space-y-6">
        {backLink}

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center animate-pop-in dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-emerald-900 dark:text-emerald-200">
            {completed ? 'بخش تکمیل شد 🎉' : 'به پایان بخش رسیدید'}
          </h2>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-300/80">
            {section.title}
          </p>
        </div>

        <header className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {section.title}
            </h1>
            {completed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                تکمیل شده
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Circle className="h-3.5 w-3.5" />
                تکمیل نشده
              </span>
            )}
          </div>
        </header>

        {hasQuiz ? (
          <QuizResults
            stats={quizStats}
            onReviewWrong={() => setPhase(PHASE.WRONG_REVIEW)}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              این بخش سوالی ندارد. می‌توانید آن را تکمیل کنید.
            </p>
          </div>
        )}

        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              <Repeat className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                کارت‌ها را به مرور اضافه کنید
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-400">
                روی هر کارتی که می‌خواهید بعداً مرور کنید، دکمه‌ی «مرور» را
                بالای کارت بزنید. کارت‌های علامت‌خورده در فواصل زمانی مناسب
                دوباره به شما نشان داده می‌شوند.
              </p>
            </div>
          </div>
        </section>

        <footer className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {completed
                  ? hasNextSection
                    ? 'این بخش را تکمیل کرده‌اید. آماده‌ی بخش بعدی هستید؟'
                    : hasNextSession
                      ? 'این آخرین بخش این جلسه بود.'
                      : 'این آخرین بخش دوره است.'
                  : 'پس از مطالعه می‌توانید این بخش را تکمیل کنید.'}
              </p>

              {completed && hasNextSection && (
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  بخش بعدی: {nextSection.title}
                </p>
              )}

              {completed && hasNextSession && (
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  جلسه بعدی: {nextSession.title}
                </p>
              )}

              {!completed && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  تکمیل هر بخش در پیشرفت دوره ثبت می‌شود.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setIndex(0);
                  setPhase(PHASE.CARDS);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                بازگشت به ابتدای بخش
              </button>

              {!completed && (
                <Button variant="primary" onClick={handleComplete}>
                  <CheckCircle2 className="h-4 w-4" />
                  تکمیل بخش
                </Button>
              )}

              {completed && hasNextSection && (
                <Button
                  variant="primary"
                  to={`/session/${sessionId}/section/${nextSection.id}`}
                >
                  بخش بعدی
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              {completed && hasNextSession && (
                <Button
                  variant="primary"
                  to={`/session/${nextSession.id}/section/${nextSessionFirstSection.id}`}
                >
                  جلسه بعدی
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              {completed && isCourseEnd && (
                <Button variant="secondary" disabled>
                  <CheckCircle2 className="h-4 w-4" />
                  پایان دوره
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ---- Card-by-card flow ----
  const currentQuizNumber =
    currentCard?.type === 'quiz'
      ? quizCards.findIndex((c) => c.id === currentCard.id) + 1
      : 0;

  const dragStyle = {
    transform: dragX !== 0 ? `translateX(${dragX}px)` : undefined,
    transition: dragging ? 'none' : 'transform 220ms ease-out',
  };

  return (
    <div className="space-y-6">
      {backLink}

      <header className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {section.title}
          </h1>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            کارت {index + 1} از {cards.length}
          </span>
        </div>
      </header>

      {currentCard?.type === 'quiz' && (
        <QuizProgress
          current={currentQuizNumber}
          total={quizCards.length}
        />
      )}

      {/* Swipe-aware card area (touch events attached via ref) */}
      <div ref={swipeAreaRef}>
        <div className={shakeActive ? 'animate-shake' : ''}>
          <div style={dragStyle}>
            {currentCard ? (
              <CardTransition key={currentCard.id ?? index}>
                <CardRenderer
                  card={currentCard}
                  sessionId={sessionId}
                  sectionId={sectionId}
                />
              </CardTransition>
            ) : null}
          </div>
        </div>
      </div>

      {!canProceed && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {currentCard?.type === 'quiz' &&
            'برای ادامه، پاسخ سوال را ثبت کنید.'}
          {currentCard?.type === 'flashcard' &&
            'برای ادامه، پاسخ فلش‌کارت را نمایش دهید.'}
        </p>
      )}

      <footer className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className={[
            'inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500',
            index === 0
              ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          <ChevronRight className="h-4 w-4" />
          قبلی
        </button>

        <button
          type="button"
          onClick={tryGoNext}
          aria-disabled={!canProceed}
          className={[
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500',
            canProceed
              ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] dark:hover:bg-rose-500'
              : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
          ].join(' ')}
        >
          {isLast ? 'پایان بخش' : 'بعدی'}
          <ChevronLeft className="h-4 w-4" />
        </button>
      </footer>

      {showSwipeTutorial && (
        <SwipeTutorial
          onDismiss={() => dismissTutorial({ permanently: false })}
          onDismissForever={() => dismissTutorial({ permanently: true })}
        />
      )}
    </div>
  );
}