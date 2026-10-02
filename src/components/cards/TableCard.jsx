import { Table2 } from 'lucide-react';

export default function TableCard({ card }) {
  const columns = Array.isArray(card.columns)
    ? card.columns
    : Array.isArray(card.headers)
      ? card.headers
      : [];

  const rows = Array.isArray(card.rows) ? card.rows : [];
  const hasTable = columns.length > 0;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <Table2 className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-medium tracking-wide text-violet-700 dark:text-violet-400">
          جدول
        </span>
      </header>

      {card.title && (
        <h2 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
          {card.title}
        </h2>
      )}

      {hasTable ? (
        <div className="-mx-1 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[480px] border-collapse text-right text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="border-b border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 sm:px-4 dark:border-slate-700 dark:text-slate-300"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-800/40"
                >
                  {Array.isArray(row) &&
                    row.map((cell, j) => (
                      <td
                        key={j}
                        className="border-b border-slate-100 px-3 py-3 align-top leading-7 text-slate-700 sm:px-4 dark:border-slate-800 dark:text-slate-300"
                      >
                        {cell}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          داده‌های جدول در دسترس نیست.
        </p>
      )}
    </article>
  );
}