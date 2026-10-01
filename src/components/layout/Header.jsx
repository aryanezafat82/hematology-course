import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle.jsx';

export default function Header() {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95">
      <Link to="/" className="flex items-center gap-2">
        <Droplet className="h-5 w-5 text-rose-600 dark:text-rose-500" />
        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
          هماتولوژی
        </span>
      </Link>
      <ThemeToggle variant="icon" />
    </header>
  );
}