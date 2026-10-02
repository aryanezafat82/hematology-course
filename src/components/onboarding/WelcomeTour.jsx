import { useEffect, useState } from 'react';
import {
  BookOpen,
  Star,
  Repeat,
  BarChart3,
  Moon,
  Hand,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  X,
  Droplet,
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext.jsx';

const STEPS = [
  {
    icon: Droplet,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
    title: 'به هماتولوژی خوش آمدید',
    description:
      'دوره‌ی هماتولوژی به‌صورت کارت‌های کوتاه ارائه می‌شود. هر بخش را در چند دقیقه می‌خوانید و بعد به بخش بعدی می‌روید.',
  },
  {
    icon: BookOpen,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
    title: 'جلسات و بخش‌ها',
    description:
      'از منوی «جلسات» وارد می‌شوید، جلسه را انتخاب می‌کنید و بخش‌ها را به ترتیب می‌خوانید. بعد از هر بخش، روی «تکمیل بخش» بزنید تا پیشرفت ثبت شود.',
  },
  {
    icon: Hand,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'جابه‌جایی بین کارت‌ها',
    description:
      'می‌توانید با کشیدن انگشت روی کارت به راست یا چپ، بین کارت‌ها جابه‌جا شوید؛ یا از دکمه‌های «قبلی» و «بعدی» پایین صفحه استفاده کنید.',
  },
  {
    icon: Star,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    title: '⭐ سخت بود',
    description:
      'بالای هر کارت، دکمه‌ی «سخت بود» هست. هر کارتی که برایتان دشوار است را علامت بزنید تا بعداً راحت پیدایش کنید.',
  },
  {
    icon: Repeat,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    title: '🔄 مرور',
    description:
      'در کنار «سخت بود»، دکمه‌ی «مرور» هست. با زدنش، کارت وارد سیستم مرور می‌شود و در فواصل مناسب (۱، ۳، ۷، ۱۴ و ۳۰ روز) دوباره به شما نشان داده می‌شود.',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
    title: 'پیشرفت و آمار',
    description:
      'در صفحه‌ی «پیشرفت» می‌بینید چقدر از دوره را خوانده‌اید، چند کارت در صف مرور دارید و چند نکته‌ی سخت ذخیره کرده‌اید.',
  },
  {
    icon: Moon,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
    title: 'حالت تاریک و نصب اپ',
    description:
      'از پایین منو، حالت تاریک را روشن کنید. روی موبایل هم می‌توانید اپ را به صفحه‌ی اصلی اضافه کنید تا مثل اپ واقعی باز شود.',
  },
];

export default function WelcomeTour() {
  const { hasSeen, markSeen } = useOnboarding();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (hasSeen('welcome-tour')) return;
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, [hasSeen]);

  useEffect(() => {
    if (!visible) return;
    function onKey(e) {
      if (e.key === 'Escape') dismiss(false);
      else if (e.key === 'ArrowLeft') next();
      else if (e.key === 'ArrowRight') prev();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step]);

  function dismiss(permanently) {
    setVisible(false);
    if (permanently) markSeen('welcome-tour');
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss(true);
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="آموزش شروع"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in"
    >
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl dark:bg-slate-900">
        {/* Close (skip without permanent) */}
        <button
          type="button"
          onClick={() => dismiss(false)}
          aria-label="بستن"
          className="absolute top-3 left-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-6">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                i === step
                  ? 'w-6 bg-rose-500'
                  : 'w-1.5 bg-slate-200 dark:bg-slate-700',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-6 pb-2 pt-6 text-center sm:px-8">
          <div
            className={[
              'mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl',
              current.iconBg,
            ].join(' ')}
          >
            <Icon className={['h-7 w-7', current.iconColor].join(' ')} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            {current.title}
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
            {current.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={isFirst}
              className={[
                'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                isFirst
                  ? 'cursor-not-allowed text-slate-300 dark:text-slate-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              ].join(' ')}
            >
              <ChevronRight className="h-4 w-4" />
              قبلی
            </button>

            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {step + 1} از {STEPS.length}
            </span>

            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
            >
              {isLast ? 'شروع می‌کنم' : 'بعدی'}
              {!isLast && <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Permanent dismissal */}
          <button
            type="button"
            onClick={() => dismiss(true)}
            className="mt-2 w-full text-center text-[11px] font-medium text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
          >
            متوجه شدم، دیگر نشان نده
          </button>
        </div>
      </div>
    </div>
  );
}