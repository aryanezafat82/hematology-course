import CardRenderer from '../cards/CardRenderer.jsx';
import ReviewRating from './ReviewRating.jsx';
import { useSectionSession } from '../../context/SectionSessionContext.jsx';

export default function ReviewCard({ card, sessionId, sectionId, onRate }) {
  const sectionSession = useSectionSession();

  const isQuiz = card?.type === 'quiz';
  const isFlashcard = card?.type === 'flashcard';

  const quizAnswered =
    isQuiz && Boolean(sectionSession?.getQuizAnswer(card.id));
  const flashcardRevealed =
    isFlashcard && Boolean(sectionSession?.isFlashcardRevealed(card.id));

  const readyToRate =
    !isQuiz && !isFlashcard ? true : quizAnswered || flashcardRevealed;

  return (
    <div className="space-y-4">
      <CardRenderer card={card} sessionId={sessionId} sectionId={sectionId} />

      {readyToRate ? (
        <ReviewRating onRate={onRate} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          {isQuiz &&
            'پس از پاسخ به سوال، می‌توانید میزان یادآوری خود را ثبت کنید.'}
          {isFlashcard && 'برای ادامه، پاسخ فلش‌کارت را نمایش دهید.'}
        </div>
      )}
    </div>
  );
}