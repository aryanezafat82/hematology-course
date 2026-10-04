import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { getQuestionsBySession } from '../data/sampleQuestionsLoader.js';
import { getSessionData, getSessionMeta } from '../data/loaders.js';
import { useSamplePreferences } from '../context/SamplePreferencesContext.jsx';
import QuestionCard from '../components/questions/QuestionCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function SampleSession() {
  const { sessionId } = useParams();
  const isUnknown = sessionId === 'unknown';

  const session = isUnknown ? null : getSessionData(sessionId);
  const meta = isUnknown ? null : getSessionMeta(sessionId);
  const questions = getQuestionsBySession(sessionId);
  const { showAnswersByDefault, setShowAnswersByDefault } = useSamplePreferences();

  const headerTitle = isUnknown
    ? 'سوالات بدون دسته'
    : session?.title ?? meta?.title ?? 'جلسه';

  return (
    <div className="space-y-6">
      <Link
        to="/sample-questions"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowRight className="h-4 w-4" />
        نمونه سوالات
      </Link>

      <header
        className={[
          'rounded-2xl border p-6',
          isUnknown
            ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/30'
            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
        ].join(' ')}
      >
        {isUnknown ? (
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              دسته‌بندی‌نشده
            </p>
          </div>
        ) : (
          meta?.title && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {meta.title}
            </p>
          )
        )}

        <h1
          className={[
            'mt-2 text-2xl font-bold',
            isUnknown
              ? 'text-amber-900 dark:text-amber-100'
              : 'text-slate-900 dark:text-slate-100',
          ].join(' ')}
        >
          {headerTitle}
        </h1>

        {isUnknown && (
          <p className="mt-3 text-sm leading-7 text-amber-800/90 dark:text-amber-200/90">
            این سوالات هنوز به جلسه‌ی درسی مشخصی نسبت داده نشده‌اند. می‌توانید همین‌جا
            آن‌ها را مطالعه کنید یا اگر به نظرتان مربوط به یک جلسه‌ی خاص هستند، به
            ما اطلاع دهید تا در به‌روزرسانی بعدی اضافه شوند.
          </p>
        )}

        <p
          className={[
            'mt-2 text-sm',
            isUnknown
              ? 'text-amber-800/80 dark:text-amber-200/80'
              : 'text-slate-500 dark:text-slate-400',
          ].join(' ')}
        >
          {questions.length} سوال
        </p>
      </header>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setShowAnswersByDefault(!showAnswersByDefault)}
        role="switch"
        aria-checked={showAnswersByDefault}
        className={[
          'flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-right transition-all',
          showAnswersByDefault
            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
        ].join(' ')}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={[
              'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              showAnswersByDefault
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
            ].join(' ')}
          >
            {showAnswersByDefault ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              نمایش پاسخ‌ها از ابتدا
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {showAnswersByDefault
                ? 'پاسخ‌ها بدون نیاز به پاسخ دادن نمایش داده می‌شوند'
                : 'ابتدا باید پاسخ دهید یا روی «نمایش پاسخ» بزنید'}
            </p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className={[
            'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
            showAnswersByDefault ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700',
          ].join(' ')}
        >
          <span
            className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
            style={{
              transform: showAnswersByDefault
                ? 'translateX(-20px)'
                : 'translateX(0)',
            }}
          />
        </span>
      </button>

      {questions.length === 0 ? (
        <EmptyState
          title="سوالی برای این جلسه نیست"
          description="هنوز سوالی به این جلسه اختصاص داده نشده."
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard
              key={`${q.examId}-${q.id}`}
              question={q}
              showAnswerByDefault={showAnswersByDefault}
              mode="browse"
            />
          ))}
        </div>
      )}
    </div>
  );
}