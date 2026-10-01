import courseData from './course.json';

/**
 * Vite eagerly imports every session JSON file inside ./sessions.
 * Adding a new session only requires:
 *   1. Adding the JSON file to ./sessions
 *   2. Registering it in course.json
 */
const sessionModules = import.meta.glob('./sessions/*.json', { eager: true });

export function getCourse() {
  return courseData;
}

export function getSessions() {
  return courseData.sessions ?? [];
}

export function getSessionMeta(sessionId) {
  return getSessions().find((s) => s.id === sessionId) ?? null;
}

export function getSessionData(sessionId) {
  const meta = getSessionMeta(sessionId);
  if (!meta) return null;

  const mod = sessionModules[`./sessions/${meta.file}`];
  if (!mod) return null;

  const raw = mod.default ?? mod;
  // Support both `{ session: {...} }` and a bare session object
  return raw.session ?? raw;
}

export function getSection(sessionId, sectionId) {
  const data = getSessionData(sessionId);
  if (!data) return null;
  return data.sections?.find((s) => s.id === sectionId) ?? null;
}