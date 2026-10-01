import { useEffect } from 'react';
import {
  X,
  Repeat,
  CalendarClock,
  CheckCircle2,
  XCircle,
  MinusCircle,
  BookOpenCheck,
  Star,
  Sparkles,
} from 'lucide-react';
import { REVIEW_INTERVALS } from '../../utils/reviewUtils.js';

export default function ReviewGuide({ variant = 'inline', onClose }) {
  useEffect(() => {
    if (variant !== 'modal' || !onClose) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [variant, onClose]);

  const content = <GuideContent />;

  if (variant === 'modal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="راهنمای سیستم مرور"
        dir="rtl"
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl dark:bg-slate-900">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <Repeat className="h-4 w-4 text-rose-500 dark:text-rose-400" />
              سیستم مرور چطور کار می‌کند؟
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="overflow-y-auto px-5 py-5">{content}</div>

          <footer className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
            >
              متوجه شدم
            </button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5 transition-colors duration-200 sm:p-6 dark:border-rose-900/60 dark:bg-rose-950/20">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
        <Repeat className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        سیستم مرور چطور کار می‌کند؟
      </h2>
      {content}
    </section>
  );
}

function GuideContent() {
  return (
    <div className="space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300">
      <IntroBlock />
      <HowCardsEnterBlock />
      <IntervalsBlock />
      <RatingBlock />
      <RelatedBlock />
    </div>
  );
}

function IntroBlock() {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        <Sparkles className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        مرور چرا؟
      </h3>
      <p className="mt-2">
        مطالبی که یک بار خوانده‌اید، اگر در فواصل مناسب دوباره مرور شوند، بهتر
        در حافظه‌ی بلندمدت می‌مانند. سیستم مرور اپلیکیشن به‌طور خودکار تعیین
        می‌کند هر کارت را چه زمانی دوباره به شما نشان بدهد تا وقت‌تان هدر نرود.
      </p>
    </div>
  );
}

function HowCardsEnterBlock() {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        <BookOpenCheck className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        کارت‌ها چطور وارد مرور می‌شوند؟
      </h3>
      <ol className="mt-2 space-y-2 pr-4">
        <li className="relative pr-4">
          <span className="absolute right-0 top-2.5 h-2 w-2 rounded-full bg-rose-400" />
          در هر بخش، کارت‌ها را مطالعه می‌کنید.
        </li>
        <li className="relative pr-4">
          <span className="absolute right-0 top-2.5 h-2 w-2 rounded-full bg-rose-400" />
          روی کارت‌هایی که می‌خواهید بعداً مرور کنید، دکمه‌ی «مرور» را بالای
          کارت می‌زنید.
        </li>
        <li className="relative pr-4">
          <span className="absolute right-0 top-2.5 h-2 w-2 rounded-full bg-rose-400" />
          اولین مرور برای <strong>فردا</strong> زمان‌بندی می‌شود.
        </li>
      </ol>
      <p className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
        برای حذف از مرور، دوباره روی همان دکمه بزنید.
      </p>
    </div>
  );
}

function IntervalsBlock() {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        <CalendarClock className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        برنامه‌ی زمانی مرور
      </h3>
      <p className="mt-2">با هر بار یادآوری موفق، فاصله‌ی مرور بعدی بیشتر می‌شود:</p>

      <div className="mt-4">
        <div className="relative flex items-center justify-between">
          <div className="absolute inset-x-2 top-3 h-0.5 bg-rose-200 dark:bg-rose-900" />
          {REVIEW_INTERVALS.map((days, i) => (
            <div
              key={days}
              className="relative z-10 flex flex-col items-center gap-1"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {days} روز
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          سطح ۵ و بالاتر در همان بازه‌ی ۳۰ روز باقی می‌ماند.
        </p>
      </div>
    </div>
  );
}

function RatingBlock() {
  const items = [
    {
      icon: XCircle,
      tone: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40',
      iconTone: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      label: 'یادم نبود',
      description: 'کارت به ابتدای برنامه برمی‌گردد و فردا دوباره مرور می‌شود.',
    },
    {
      icon: MinusCircle,
      tone: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
      iconTone: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      label: 'تا حدی یادم بود',
      description: 'یک پله در برنامه جلو می‌رود (مثلاً از ۱ روز به ۳ روز).',
    },
    {
      icon: CheckCircle2,
      tone: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
      iconTone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      label: 'کاملاً یادم بود',
      description: 'دو پله جلو می‌رود (مثلاً از ۱ روز به ۷ روز).',
    },
  ];

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        <CheckCircle2 className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        در پایان هر مرور، چطور ارزیابی کنم؟
      </h3>
      <p className="mt-2">بعد از دیدن هر کارت، صادقانه یکی از سه گزینه را انتخاب کنید:</p>
      <ul className="mt-3 space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li
              key={it.label}
              className={`flex items-start gap-3 rounded-lg border ${it.tone} p-3`}
            >
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${it.iconTone}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {it.label}
                </p>
                <p className="mt-0.5 text-xs leading-6 text-slate-600 dark:text-slate-400">
                  {it.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RelatedBlock() {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        <Star className="h-4 w-4 text-amber-500" />
        ارتباط با «نکات سخت»
      </h3>
      <p className="mt-2">«نکات سخت» و «مرور» دو سیستم جدا هستند:</p>
      <ul className="mt-2 space-y-1.5 pr-4">
        <li className="relative pr-4 text-xs leading-6">
          <span className="absolute right-0 top-2.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
          علامت‌زدن یک کارت به‌عنوان «سخت» آن را وارد مرور نمی‌کند.
        </li>
        <li className="relative pr-4 text-xs leading-6">
          <span className="absolute right-0 top-2.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
          وارد شدن کارت به مرور آن را «سخت» نمی‌کند.
        </li>
        <li className="relative pr-4 text-xs leading-6">
          <span className="absolute right-0 top-2.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
          اگر کارتی هم «سخت» باشد و هم سررسید مرورش رسیده باشد، می‌توانید از
          صفحه‌ی «نکات سخت» فقط همان‌ها را مرور کنید.
        </li>
      </ul>
    </div>
  );
}