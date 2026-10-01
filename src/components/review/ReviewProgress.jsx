export default function ReviewProgress({ current, total }) {
  if (!total) return null;
  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
        کارت {current} از {total}
      </span>
    </div>
  );
}