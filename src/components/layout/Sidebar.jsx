import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Star,
  BarChart3,
  Droplet,
  Repeat,
  HelpCircle,
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle.jsx';

const navItems = [
  { to: '/', label: 'خانه', icon: Home, end: true },
  { to: '/sessions', label: 'جلسات', icon: BookOpen },
  { to: '/review', label: 'مرور', icon: Repeat },
  { to: '/hard-points', label: 'نکات سخت', icon: Star },
  { to: '/sample-questions', label: 'نمونه سوالات', icon: HelpCircle },
  { to: '/progress', label: 'پیشرفت', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed top-0 right-0 h-screen w-64 flex-col border-l border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <Droplet className="h-6 w-6 text-rose-600 dark:text-rose-500" />
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
          هماتولوژی
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-3 py-3 dark:border-slate-800">
        <ThemeToggle variant="full" />
      </div>

      <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        نسخه ۰.۱
      </div>
    </aside>
  );
}