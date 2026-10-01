import { BookOpen } from 'lucide-react';

export default function InfoCard({ card }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
          <BookOpen className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-medium tracking-wide text-sky-700 dark:text-sky-400">
          اطلاعات
        </span>
      </header>

      {card.title && (
        <h3 className="text-base font-semibold leading-7 text-slate-900 sm:text-lg dark:text-slate-100">
          {card.title}
        </h3>
      )}

      {card.content && (
        <p className="mt-2 whitespace-pre-line text-sm leading-8 text-slate-700 sm:text-[15px] dark:text-slate-300">
          {card.content}
        </p>
      )}
    </article>
  );
}