export default function QuizProgress({ current, total }) {
  if (!total || total === 0) return null;
  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        سوال {current} از {total}
      </span>
    </div>
  );
}