import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import BottomNav from './BottomNav.jsx';
import InstallPrompt from '../onboarding/InstallPrompt.jsx';
import WelcomeTour from '../onboarding/WelcomeTour.jsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      <Sidebar />

      <div className="md:mr-64 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 pb-24 md:pb-10">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
      <WelcomeTour />
      <InstallPrompt />
    </div>
  );
}