import { useState } from 'react';
import { HelpCircle, Check, X } from 'lucide-react';
import { useSectionSession } from '../../context/SectionSessionContext.jsx';
import RichText from '../common/RichText.jsx';

export default function QuizCard({ card }) {
  const sectionSession = useSectionSession();
  const stored = sectionSession?.getQuizAnswer(card.id) ?? null;

  const [selected, setSelected] = useState(stored ? stored.selected : null);
  const [submitted, setSubmitted] = useState(Boolean(stored));
  const [justSubmitted, setJustSubmitted] = useState(false);

  const options = Array.isArray(card.options) ? card.options : [];
  const correctIndex =
    typeof card.correctAnswer === 'number' ? card.correctAnswer : -1;
  const isCorrect = submitted && selected === correctIndex;
  const canSubmit = selected !== null && !submitted;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitted(true);
    setJustSubmitted(true);
    sectionSession?.submitQuizAnswer(
      card.id,
      selected,
      selected === correctIndex
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <HelpCircle className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
          پرسش
        </span>
      </header>

      <RichText
        text={card.question}
        className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100"
      />

      <ul className="mt-4 space-y-2">
        {options.map((option, i) => {
          const isSelected = selected === i;
          const isTheAnswer = i === correctIndex;

          let tone =
            'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800';
          let extra = '';
          if (submitted) {
            if (isTheAnswer) {
              tone =
                'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200';
              if (justSubmitted) extra = 'animate-pop-in';
            } else if (isSelected) {
              tone =
                'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200';
              if (justSubmitted) extra = 'animate-shake';
            } else {
              tone =
                'border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600';
            }
          } else if (isSelected) {
            tone =
              'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200';
          }

          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => !submitted && setSelected(i)}
                disabled={submitted}
                aria-pressed={isSelected}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-right text-sm leading-7 transition-all duration-150',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
                  tone,
                  extra,
                  submitted
                    ? 'cursor-default'
                    : 'cursor-pointer active:scale-[0.99]',
                ].join(' ')}
              >
                <RichText text={option} className="flex-1" />
                {submitted && isTheAnswer && (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                {submitted && isSelected && !isTheAnswer && (
                  <X className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {!submitted && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
              canSubmit
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
            ].join(' ')}
          >
            <Check className="h-4 w-4" />
            بررسی پاسخ
          </button>
        </div>
      )}

      {submitted && (
        <div
          className={[
            'mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60',
            justSubmitted ? 'animate-expand' : '',
          ].join(' ')}
        >
          <p
            className={[
              'inline-flex items-center gap-2 text-sm font-semibold',
              isCorrect
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400',
            ].join(' ')}
          >
            {isCorrect ? (
              <>
                <Check className="h-4 w-4" />
                پاسخ درست
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                پاسخ نادرست
              </>
            )}
          </p>

          {card.explanation && (
            <RichText
              text={card.explanation}
              className="mt-2 text-sm leading-8 text-slate-700 dark:text-slate-300"
            />
          )}
        </div>
      )}
    </article>
  );
}