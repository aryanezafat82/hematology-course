import { useEffect, useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Eye,
  EyeOff,
  Star,
  Repeat,
  Check,
  X,
} from 'lucide-react';
import RichText from '../common/RichText.jsx';
import { useHardPoints } from '../../context/HardPointsContext.jsx';
import { useReview } from '../../context/ReviewContext.jsx';

const TYPE_LABEL = {
  mcq: 'چهارگزینه‌ای',
  short_answer: 'کوتاه‌پاسخ',
};

export default function QuestionCard({
  question,
  showAnswerByDefault = false,
  mode = 'browse',
  onRate,
}) {
  const [revealed, setRevealed] = useState(showAnswerByDefault);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // وقتی پرچم «نمایش پاسخ‌ها از ابتدا» تغییر می‌کنه،
    // همه‌ی state داخلی کارت ریست می‌شه تا با حالت جدید هماهنگ بشه.
    setRevealed(showAnswerByDefault);
    setSelectedOption(null);
    setSubmitted(false);
  }, [showAnswerByDefault]);

  const { isQuestionHardPoint, toggleQuestionHardPoint } = useHardPoints();
  const { isQuestionInReview, toggleQuestionReview } = useReview();

  const hard = isQuestionHardPoint(question.examId, question.id);
  const inReview = isQuestionInReview(question.examId, question.id);

  const isMCQ = question.type === 'mcq';
  const isShort = question.type === 'short_answer';

  const toggleReveal = () => setRevealed((r) => !r);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    setRevealed(true);
  };

  const isCorrect = submitted && selectedOption === question.correctAnswer;

  // در حالت review، دکمه‌های ⭐ و 🔄 نمایش داده نمی‌شن
  const showToggles = mode === 'browse';

  const baseBtn =
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      {/* === Header row: badges (right) + toggles (left, only in browse mode) === */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            <HelpCircle className="h-3 w-3" />
            {TYPE_LABEL[question.type] ?? question.type}
          </span>
          {question.examLabel && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {question.examLabel}
            </span>
          )}
          {question.sessionId && question.sessionId !== 'unknown' && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              {question.sessionId.replace('session-', 'جلسه ')}
            </span>
          )}
        </div>

        {showToggles && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleQuestionHardPoint(question.examId, question.id)}
              aria-pressed={hard}
              aria-label={hard ? 'حذف از نکات سخت' : 'افزودن به نکات سخت'}
              className={[
                baseBtn,
                'focus-visible:outline-amber-500',
                hard
                  ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              <Star
                className={['h-3.5 w-3.5', hard ? 'fill-current scale-110' : ''].join(' ')}
              />
              <span>سخت بود</span>
            </button>

            <button
              type="button"
              onClick={() => toggleQuestionReview(question.examId, question.id)}
              aria-pressed={inReview}
              aria-label={inReview ? 'حذف از مرور' : 'افزودن به مرور'}
              className={[
                baseBtn,
                'focus-visible:outline-indigo-500',
                inReview
                  ? 'border-indigo-300 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              <Repeat className={['h-3.5 w-3.5', inReview ? 'scale-110' : ''].join(' ')} />
              <span>مرور</span>
            </button>
          </div>
        )}
      </div>

      {/* === Question === */}
      <RichText
        text={question.question}
        className="text-sm font-semibold leading-7 text-slate-900 dark:text-slate-100"
      />

      {/* === MCQ options === */}
      {isMCQ && Array.isArray(question.options) && (
        <ul className="mt-4 space-y-2">
          {question.options.map((option, i) => {
            if (!option || !option.trim()) return null;

            const isSelected = selectedOption === i;
            const isTheAnswer = i === question.correctAnswer;

            let tone =
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600';
            if (submitted || revealed) {
              if (isTheAnswer) {
                tone =
                  'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200';
              } else if (isSelected && submitted) {
                tone =
                  'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200';
              } else {
                tone =
                  'border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600';
              }
            } else if (isSelected) {
              tone =
                'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200';
            }

            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    if (submitted || revealed) return;
                    setSelectedOption(i);
                  }}
                  disabled={submitted || revealed}
                  aria-pressed={isSelected}
                  className={[
                    'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-right text-sm leading-7 transition-all duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
                    tone,
                    submitted || revealed ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]',
                  ].join(' ')}
                >
                  <RichText text={option} className="flex-1" />
                  {(submitted || revealed) && isTheAnswer && (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {submitted && isSelected && !isTheAnswer && (
                    <X className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* === Submit button (MCQ) — both browse and review === */}
      {isMCQ && !submitted && !showAnswerByDefault && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
              selectedOption !== null
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
            ].join(' ')}
          >
            <Check className="h-4 w-4" />
            بررسی پاسخ
          </button>
        </div>
      )}

      {/* === Reveal button (short_answer) — both browse and review === */}
      {isShort && !showAnswerByDefault && (
        <div className="mt-4">
          <button
            type="button"
            onClick={toggleReveal}
            aria-expanded={revealed}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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
        </div>
      )}

      {/* === Reveal without answering (MCQ) — both browse and review === */}
      {isMCQ && !submitted && !showAnswerByDefault && (
        <div className="mt-3">
          <button
            type="button"
            onClick={toggleReveal}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {revealed ? 'پنهان کردن پاسخ' : 'نمایش پاسخ بدون پاسخ دادن'}
          </button>
        </div>
      )}

      {/* === Answer reveal (short) === */}
      {isShort && revealed && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 animate-expand dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="text-xs font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
            پاسخ
          </p>
          <RichText
            text={question.answerText || '—'}
            className="mt-1 text-sm leading-8 text-emerald-900 dark:text-emerald-200"
          />
        </div>
      )}

      {/* === Explanation === */}
      {revealed && question.explanation && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <MessageSquare className="h-3.5 w-3.5" />
            توضیح
          </p>
          <RichText
            text={question.explanation}
            className="mt-1 text-sm leading-8 text-slate-700 dark:text-slate-300"
          />
        </div>
      )}

      {/* === Rating (review mode) — appears after reveal/submit === */}
      {mode === 'review' && revealed && onRate && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
            این سوال را به خاطر آوردید؟
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => onRate('forgot')}
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-50 active:scale-[0.98] dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              یادم نبود
            </button>
            <button
              type="button"
              onClick={() => onRate('partial')}
              className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 transition-colors hover:bg-amber-50 active:scale-[0.98] dark:border-amber-900 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              تا حدی
            </button>
            <button
              type="button"
              onClick={() => onRate('easy')}
              className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-800 transition-colors hover:bg-emerald-50 active:scale-[0.98] dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              کاملاً
            </button>
          </div>
        </div>
      )}
    </article>
  );
}