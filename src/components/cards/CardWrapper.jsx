import { Star, Repeat } from 'lucide-react';
import { useHardPoints } from '../../context/HardPointsContext.jsx';
import { useReview } from '../../context/ReviewContext.jsx';

export default function CardWrapper({ sessionId, sectionId, cardId, children }) {
  const { isHardPoint, toggleHardPoint } = useHardPoints();
  const { isInReview, toggleReview } = useReview();

  const hard = isHardPoint(sessionId, sectionId, cardId);
  const inReview = isInReview(sessionId, sectionId, cardId);

  const baseBtn =
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ease-out active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <div className="relative">
      {children}

      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => toggleHardPoint(sessionId, sectionId, cardId)}
          aria-pressed={hard}
          aria-label={hard ? 'حذف از نکات سخت' : 'افزودن به نکات سخت'}
          title={hard ? 'حذف از نکات سخت' : 'افزودن به نکات سخت'}
          className={[
            baseBtn,
            'focus-visible:outline-amber-500',
            hard
              ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'border-slate-200 bg-white/95 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200',
          ].join(' ')}
        >
          <Star
            className={[
              'h-3.5 w-3.5 transition-transform duration-150',
              hard ? 'fill-current scale-110' : '',
            ].join(' ')}
          />
          <span>سخت بود</span>
        </button>

        <button
          type="button"
          onClick={() => toggleReview(sessionId, sectionId, cardId)}
          aria-pressed={inReview}
          aria-label={inReview ? 'حذف از مرور' : 'افزودن به مرور'}
          title={inReview ? 'حذف از سیستم مرور' : 'افزودن به سیستم مرور'}
          className={[
            baseBtn,
            'focus-visible:outline-indigo-500',
            inReview
              ? 'border-indigo-300 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'border-slate-200 bg-white/95 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200',
          ].join(' ')}
        >
          <Repeat
            className={[
              'h-3.5 w-3.5 transition-transform duration-150',
              inReview ? 'scale-110' : '',
            ].join(' ')}
          />
          <span>مرور</span>
        </button>
      </div>
    </div>
  );
}