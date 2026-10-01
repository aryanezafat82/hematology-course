import { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { useSectionSession } from '../../context/SectionSessionContext.jsx';

export default function WrongAnswerReview({ cards, onBack }) {
  const sectionSession = useSectionSession();
  const [index, setIndex] = useState(0);

  const wrongCards = (cards ?? []).filter((c) => {
    if (c.type !== 'quiz') return false;
    const a = sectionSession?.getQuizAnswer(c.id);
    return Boolean(a) && a.isCorrect === false;
  });

  if (wrongCards.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          پاسخ غلطی برای مرور وجود ندارد.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به پایان بخش
        </button>
      </section>
    );
  }

  const card = wrongCards[index];
  const answer = sectionSession?.getQuizAnswer(card.id) ?? null;
  const selected = answer?.selected ?? -1;
  const correctIndex =
    typeof card.correctAnswer === 'number' ? card.correctAnswer : -1;

  const isFirst = index === 0;
  const isLast = index === wrongCards.length - 1;

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            مرور پاسخ‌های غلط
          </h2>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {index + 1} از {wrongCards.length}
          </span>
        </div>
      </header>

      <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
          {card.question}
        </h3>

        <ul className="mt-4 space-y-2">
          {(card.options ?? []).map((opt, i) => {
            const isCorrect = i === correctIndex;
            const isUser = i === selected;
            const isWrongSelected = isUser && !isCorrect;

            let tone =
              'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400';
            if (isCorrect) {
              tone =
                'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200';
            } else if (isWrongSelected) {
              tone =
                'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200';
            }

            return (
              <li
                key={i}
                className={[
                  'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-right text-sm leading-7',
                  tone,
                ].join(' ')}
              >
                <span className="flex-1">{opt}</span>
                {isCorrect && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    پاسخ درست
                  </span>
                )}
                {isWrongSelected && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                    <X className="h-3.5 w-3.5" />
                    پاسخ شما
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {card.explanation && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              توضیح
            </p>
            <p className="mt-1 text-sm leading-8 text-slate-700 dark:text-slate-300">
              {card.explanation}
            </p>
          </div>
        )}
      </article>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className={[
            'inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150',
            isFirst
              ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          قبلی
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] dark:hover:bg-rose-500"
          >
            بعدی
          </button>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به پایان بخش
          </button>
        )}
      </div>
    </div>
  );
}