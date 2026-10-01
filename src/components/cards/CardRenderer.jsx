import InfoCard from './InfoCard.jsx';
import KeyPointCard from './KeyPointCard.jsx';
import TableCard from './TableCard.jsx';
import Flashcard from './Flashcard.jsx';
import QuizCard from './QuizCard.jsx';
import CardWrapper from './CardWrapper.jsx';
import { AlertTriangle } from 'lucide-react';

/**
 * Central dispatcher for educational cards.
 * card.type from JSON determines which component renders.
 *
 * When sessionId + sectionId + card.id are provided, the card is
 * wrapped in CardWrapper which adds the ⭐ "سخت بود" toggle.
 */
const CARD_COMPONENTS = {
  info: InfoCard,
  key_point: KeyPointCard,
  table: TableCard,
  flashcard: Flashcard,
  quiz: QuizCard,
};

export default function CardRenderer({ card, sessionId, sectionId }) {
  if (!card || typeof card !== 'object') {
    return <UnknownCard type="—" />;
  }

  const Component = CARD_COMPONENTS[card.type];
  if (!Component) {
    return <UnknownCard type={card.type} />;
  }

  const content = <Component card={card} />;

  const canToggleHardPoint =
    typeof sessionId === 'string' &&
    typeof sectionId === 'string' &&
    typeof card.id === 'string' &&
    card.id.length > 0;

  if (!canToggleHardPoint) {
    return content;
  }

  return (
    <CardWrapper sessionId={sessionId} sectionId={sectionId} cardId={card.id}>
      {content}
    </CardWrapper>
  );
}

function UnknownCard({ type }) {
  return (
    <article
      dir="rtl"
      className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            نوع کارت پشتیبانی نمی‌شود.
          </p>
          {type && type !== '—' && (
            <p className="mt-1 font-mono text-xs text-amber-700">
              type: {String(type)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}