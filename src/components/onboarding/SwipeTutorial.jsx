import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Hand, X } from 'lucide-react';

/**
 * Modal tutorial that appears the first time a user enters a section
 * with 2+ cards. Shows swipe directions and lets them opt out permanently.
 */
export default function SwipeTutorial({ onDismiss, onDismissForever }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="آموزش جابه‌جایی بین کارت‌ها"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="بستن"
          className="absolute top-3 left-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-10 pb-6 sm:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60">
              <Hand className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              جابه‌جایی بین کارت‌ها
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              می‌توانید انگشت خود را روی کارت بکشید.
            </p>
          </div>

          {/* Swipe visual */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {/* Previous side (left) */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex">
                <ArrowLeft className="h-5 w-5 text-slate-400 animate-swipe-hint-left dark:text-slate-500" />
                <ArrowLeft
                  className="h-5 w-5 text-slate-400 animate-swipe-hint-left dark:text-slate-500"
                  style={{ animationDelay: '150ms' }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                قبلی
              </span>
            </div>

            {/* Mock card */}
            <div className="flex h-24 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                کارت
              </span>
            </div>

            {/* Next side (right) */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex">
                <ArrowRight className="h-5 w-5 text-rose-500 animate-swipe-hint-right dark:text-rose-400" />
                <ArrowRight
                  className="h-5 w-5 text-rose-500 animate-swipe-hint-right dark:text-rose-400"
                  style={{ animationDelay: '150ms' }}
                />
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                بعدی
              </span>
            </div>
          </div>

          {/* Hint about buttons */}
          <p className="mt-6 text-center text-xs leading-6 text-slate-500 dark:text-slate-400">
            می‌توانید از دکمه‌های «قبلی» و «بعدی» در پایین صفحه هم استفاده کنید.
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onDismissForever}
            className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
          >
            متوجه شدم، دیگر نشان نده
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-2 w-full rounded-lg px-4 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            فقط این بار
          </button>
        </div>
      </div>
    </div>
  );
}