import { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { useSectionSession } from '../../context/SectionSessionContext.jsx';
import RichText from '../common/RichText.jsx';

export default function Flashcard({ card }) {
  const sectionSession = useSectionSession();
  const alreadyRevealed = sectionSession?.isFlashcardRevealed(card.id) ?? false;
  const [revealed, setRevealed] = useState(alreadyRevealed);

  function toggle() {
    const next = !revealed;
    setRevealed(next);
    if (next) sectionSession?.markFlashcardRevealed(card.id);
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          <Layers className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-medium tracking-wide text-rose-700 dark:text-rose-400">
          فلش‌کارت
        </span>
      </header>

      <RichText
        text={card.question}
        className="text-base font-semibold leading-8 text-slate-900 dark:text-slate-100"
      />

      {revealed && (
        <div
          role="region"
          aria-label="پاسخ فلش‌کارت"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 animate-expand dark:border-emerald-900/60 dark:bg-emerald-950/30"
        >
          <p className="text-xs font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
            پاسخ
          </p>
          <RichText
            text={card.answer}
            className="mt-1 text-sm leading-8 text-emerald-900 dark:text-emerald-200"
          />
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={revealed}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      >
        {revealed ? (
          <>
            <EyeOff className="h-4 w-4" />
            پنهان کردن پاسخ
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            نمایش پاسخ
          </>
        )}
      </button>
    </article>
  );
}