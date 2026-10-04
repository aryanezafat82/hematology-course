import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Star,
  BarChart3,
  Repeat,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'خانه', icon: Home, end: true },
  { to: '/sessions', label: 'جلسات', icon: BookOpen },
  { to: '/review', label: 'مرور', icon: Repeat },
  { to: '/sample-questions', label: 'سوالات', icon: HelpCircle },
  { to: '/hard-points', label: 'نکات', icon: Star },
  { to: '/progress', label: 'پیشرفت', icon: BarChart3 },
];

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16 items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[9px] font-medium transition-all duration-150',
                  'active:scale-95',
                  isActive
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isActive ? 'bg-rose-50 dark:bg-rose-950/50' : '',
                    ].join(' ')}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}