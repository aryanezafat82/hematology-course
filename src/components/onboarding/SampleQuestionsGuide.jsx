import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  HelpCircle,
  MessageSquare,
  Star,
  Repeat,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Filter,
  PlayCircle,
} from 'lucide-react';

const STEPS = [
  {
    icon: Sparkles,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
    title: 'به بخش نمونه سوالات خوش آمدید',
    description:
      'اینجا می‌توانید سوالات امتحانی ادوار گذشته را ببینید و خودتان را برای امتحان آماده کنید. سوالات از منابع مختلف گردآوری شده‌اند.',
  },
  {
    icon: Filter,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
    title: 'دو روش دسته‌بندی',
    description:
      'سوالات به دو روش دسته‌بندی شده‌اند: «بر اساس جلسه» یعنی می‌توانید همه‌ی سوالات مربوط به یه مبحث خاص را ببینید (مثلاً همه‌ی سوالات AML از تمام دوره‌ها)، و «بر اساس دوره امتحان» یعنی می‌توانید سوالات یک دوره‌ی خاص را کامل مرور کنید.',
  },
  {
    icon: HelpCircle,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'دو نوع سوال',
    description:
      'سوالات چهارگزینه‌ای (MCQ) دارید که باید یه گزینه رو انتخاب کنید و روی «بررسی پاسخ» بزنید، و سوالات کوتاه‌پاسخ که خودتان فکر می‌کنید و بعد روی «نمایش پاسخ» می‌زنید.',
  },
  {
    icon: Eye,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    title: 'حالت «نمایش پاسخ از ابتدا»',
    description:
      'با فعال کردن این گزینه (توگل بالای صفحه)، همه‌ی پاسخ‌ها از همون اول نمایش داده می‌شن و نیازی به پاسخ دادن ندارید. مناسب برای وقتی که فقط می‌خواهید یه مرور سریع بکنید. هر وقت خواستید، خاموشش کنید تا از حالت تست استفاده کنید.',
  },
  {
    icon: Star,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    title: '⭐ سخت بود',
    description:
      'اگه سوالی برایتان دشوار بود، روی دکمه‌ی «سخت بود» بالای سوال بزنید. همه‌ی این‌ها در صفحه‌ی «نکات سخت» جمع می‌شن و می‌تونید اونجا مرور کنید.',
  },
  {
    icon: Repeat,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    title: '🔄 مرور',
    description:
      'با زدن دکمه‌ی «مرور»، سوال وارد سیستم مرور می‌شه و در فواصل زمانی مناسب (۱، ۳، ۷، ۱۴ و ۳۰ روز) دوباره به شما نشون داده می‌شه. اینطوری می‌تونید مطالب رو در حافظه‌ی بلندمدت خودتون تثبیت کنید.',
  },
  {
    icon: MessageSquare,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
    title: 'توضیح پاسخ',
    description:
      'بعد از هر سوال، توضیح کاملی ارائه شده که کمکتون می‌کنه بفهمید چرا یه گزینه درسته. حتی اگه پاسخ رو درست داده باشید، خوندن توضیح به یادگیری کمک می‌کنه.',
  },
];

export default function SampleQuestionsGuide({ onDismiss, onDismissForever }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onDismiss();
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
  }, [step]);

  function handleClose(permanently) {
    setVisible(false);
    if (permanently) onDismissForever?.();
    else onDismiss?.();
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleClose(true);
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
      aria-label="راهنمای نمونه سوالات"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in"
    >
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl dark:bg-slate-900">
        {/* Close */}
        <button
          type="button"
          onClick={() => handleClose(false)}
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

          <button
            type="button"
            onClick={() => handleClose(true)}
            className="mt-2 w-full text-center text-[11px] font-medium text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
          >
            متوجه شدم، دیگر نشان نده
          </button>
        </div>
      </div>
    </div>
  );
}