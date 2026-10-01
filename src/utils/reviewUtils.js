export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfToday(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isDue(item, now = new Date()) {
  if (!item?.nextReviewAt) return false;
  return new Date(item.nextReviewAt).getTime() <= now.getTime();
}

export function isOverdue(item, now = new Date()) {
  if (!item?.nextReviewAt) return false;
  return new Date(item.nextReviewAt).getTime() < startOfToday(now).getTime();
}

/**
 * Deterministic interval progression.
 *   forgot  → reset to level 0
 *   partial → advance 1 level
 *   easy    → advance 2 levels
 */
export function computeNextInterval(currentInterval, rating) {
  const currentIndex = REVIEW_INTERVALS.indexOf(currentInterval);
  const base = currentIndex >= 0 ? currentIndex : 0;

  let nextIndex;
  if (rating === 'forgot') nextIndex = 0;
  else if (rating === 'partial') nextIndex = Math.min(base + 1, REVIEW_INTERVALS.length - 1);
  else if (rating === 'easy') nextIndex = Math.min(base + 2, REVIEW_INTERVALS.length - 1);
  else nextIndex = 0;

  return REVIEW_INTERVALS[nextIndex];
}

export function formatReviewDate(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function reviewKey(sessionId, sectionId, cardId) {
  return `${sessionId}/${sectionId}/${cardId}`;
}