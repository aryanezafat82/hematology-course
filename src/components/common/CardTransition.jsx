/**
 * Wraps a card so each change re-triggers a subtle entrance animation.
 * The `key` prop on the parent should change per card.
 */
export default function CardTransition({ children }) {
  return <div className="animate-card-in">{children}</div>;
}