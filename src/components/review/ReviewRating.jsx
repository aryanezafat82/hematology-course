import { X, Minus, Check } from 'lucide-react';

const OPTIONS = [
  {
    key: 'forgot',
    label: 'یادم نبود',
    hint: 'فردا دوباره',
    icon: X,
    tone: 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40',
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
  {
    key: 'partial',
    label: 'تا حدی یادم بود',
    hint: 'مرور بعدی دیرتر',
    icon: Minus,
    tone: 'border-amber-200 bg-white text-amber-800 hover:bg-amber-50 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-950/40',
    iconBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  {
    key: 'easy',
    label: 'کاملاً یادم بود',
    hint: 'مرور بعدی خیلی دیرتر',
    icon: Check,
    tone: 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40',
    iconBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
];

export default function ReviewRating({ onRate }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
        این مطلب را به خاطر آوردید؟
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onRate(opt.key)}
              aria-label={opt.label}
              className={[
                'flex items-center gap-3 rounded-lg border px-4 py-3 text-right text-sm font-medium transition-all duration-150 active:scale-[0.98]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500',
                opt.tone,
              ].join(' ')}
            >
              <span
                className={[
                  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  opt.iconBg,
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span>{opt.label}</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  {opt.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}