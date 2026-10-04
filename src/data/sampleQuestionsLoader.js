import indexData from './sample-questions/index.json';

const examModules = import.meta.glob('./sample-questions/*.json', {
  eager: true,
});

export function getSampleIndex() {
  return indexData;
}

export function getExams() {
  return indexData.exams ?? [];
}

export function getExamMeta(examId) {
  return getExams().find((e) => e.id === examId) ?? null;
}

export function getExamData(examId) {
  const meta = getExamMeta(examId);
  if (!meta) return null;
  const mod = examModules[`./sample-questions/${meta.file}`];
  if (!mod) return null;
  const raw = mod.default ?? mod;
  return raw.exam ?? raw;
}

/**
 * همه‌ی سوالات همه‌ی دوره‌ها، با examId و examLabel اضافه‌شده.
 */
export function getAllQuestions() {
  const all = [];
  for (const meta of getExams()) {
    const exam = getExamData(meta.id);
    if (!exam) continue;
    for (const q of exam.questions ?? []) {
      all.push({ ...q, examId: meta.id, examLabel: meta.label });
    }
  }
  return all;
}

/**
 * سوالات یک جلسه‌ی خاص از همه‌ی دوره‌ها.
 */
export function getQuestionsBySession(sessionId) {
  return getAllQuestions().filter((q) => q.sessionId === sessionId);
}

/**
 * تعداد سوالات هر جلسه.
 */
export function getQuestionsCountBySession() {
  const counts = {};
  for (const q of getAllQuestions()) {
    const sid = q.sessionId || 'unknown';
    counts[sid] = (counts[sid] || 0) + 1;
  }
  return counts;
}

// Dev-only expose
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__sampleLoaders = {
    getSampleIndex,
    getExams,
    getExamMeta,
    getExamData,
    getAllQuestions,
    getQuestionsBySession,
    getQuestionsCountBySession,
  };
}