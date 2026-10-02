import { Star } from 'lucide-react';

export default function KeyPointCard({ card }) {
  return (
    <article className="rounded-xl border border-amber-200 border-r-4 border-r-amber-400 bg-amber-50/50 p-5 transition-colors duration-200 sm:p-6 dark:border-amber-900/60 dark:border-r-amber-600 dark:bg-amber-950/20">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
          <Star className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-amber-800 dark:text-amber-300">
          نکته کلیدی
        </span>
      </header>

      {card.title && (
        <h2 className="text-base font-bold leading-7 text-amber-900 sm:text-lg dark:text-amber-100">
          {card.title}
        </h2>
      )}

      {card.content && (
        <p className="mt-2 whitespace-pre-line text-sm leading-8 text-amber-900/90 sm:text-[15px] dark:text-amber-100/90">
          {card.content}
        </p>
      )}
    </article>
  );
}