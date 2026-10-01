import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center"
    >
      <p className="text-6xl font-bold text-rose-600">۴۰۴</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">
        صفحه پیدا نشد
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        آدرس وارد شده معتبر نیست.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
      >
        بازگشت به خانه
      </Link>
    </div>
  );
}