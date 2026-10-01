import { useEffect, useState } from 'react';
import {
  Share,
  Plus,
  SquarePlus,
  Download,
  X,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext.jsx';

/**
 * "Add to Home Screen" prompt.
 * - iOS Safari: shows visual instructions (Share → Add to Home Screen).
 * - Android Chrome: uses the native beforeinstallprompt event.
 * - Hidden forever once the user confirms with "متوجه شدم".
 */
export default function InstallPrompt() {
  const { hasSeen, markSeen } = useOnboarding();
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null); // 'ios' | 'android'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (hasSeen('install-prompt')) return;

    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) {
      markSeen('install-prompt');
      return;
    }

    const ua = window.navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      setPlatform('ios');
      // Small delay so the page settles before showing.
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }

    if (isAndroid) {
      // First, check if the event already fired (rare but possible).
      if (window.__deferredInstallPrompt) {
        setDeferredPrompt(window.__deferredInstallPrompt);
        setPlatform('android');
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }

      const handler = (e) => {
        e.preventDefault();
        window.__deferredInstallPrompt = e;
        setDeferredPrompt(e);
        setPlatform('android');
        setVisible(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
    // Desktop / other platforms: don't show.
  }, [hasSeen, markSeen]);

  function dismissForever() {
    setVisible(false);
    markSeen('install-prompt');
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        markSeen('install-prompt');
        setTimeout(() => setVisible(false), 1400);
      } else {
        setVisible(false);
      }
    } catch {
      setVisible(false);
    }
    setDeferredPrompt(null);
    window.__deferredInstallPrompt = null;
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="افزودن به صفحه اصلی"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl dark:bg-slate-900">
        {/* Close (persistent = same as "متوجه شدم") */}
        <button
          type="button"
          onClick={dismissForever}
          aria-label="بستن"
          className="absolute top-3 left-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-9 pb-6 sm:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60">
              <Smartphone className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              نصب به‌عنوان اپلیکیشن
            </h2>
            <p className="mt-1 text-sm leading-7 text-slate-500 dark:text-slate-400">
              این دوره را مثل یک اپ روی گوشی‌تان نصب کنید؛ بدون نیاز به مرورگر،
              سریع‌تر و راحت‌تر.
            </p>
          </div>

          {/* Platform-specific instructions */}
          {platform === 'ios' && <IOSInstructions />}
          {platform === 'android' && (
            <AndroidInstructions
              canInstall={Boolean(deferredPrompt)}
              onInstall={handleInstall}
              installed={installed}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={dismissForever}
            className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
          >
            متوجه شدم، دیگر نشان نده
          </button>
        </div>
      </div>
    </div>
  );
}

function IOSInstructions() {
  return (
    <ol className="mt-6 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
      <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
          <Share className="h-3.5 w-3.5" />
        </span>
        <span>
          در <strong>Safari</strong> روی دکمه‌ی <strong>اشتراک‌گذاری</strong>{' '}
          (مربع با فلش بالا) بزنید.
        </span>
      </li>
      <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          <SquarePlus className="h-3.5 w-3.5" />
        </span>
        <span>
          از منوی بازشده <strong>Add to Home Screen</strong> (افزودن به صفحه
          اصلی) را انتخاب کنید.
        </span>
      </li>
      <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
        <span>
          روی <strong>Add</strong> بزنید. حالا آیکون اپ روی صفحه‌ی گوشی‌تان
          ظاهر می‌شود.
        </span>
      </li>
    </ol>
  );
}

function AndroidInstructions({ canInstall, onInstall, installed }) {
  if (installed) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        اپ با موفقیت نصب شد!
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {canInstall ? (
        <button
          type="button"
          onClick={onInstall}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-500"
        >
          <Download className="h-4 w-4" />
          نصب اپلیکیشن
        </button>
      ) : (
        <ol className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              ⋮
            </span>
            <span>
              در <strong>Chrome</strong> روی منوی سه‌نقطه (بالا-راست) بزنید.
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <Plus className="h-3.5 w-3.5" />
            </span>
            <span>
              <strong>Install app</strong> یا{' '}
              <strong>Add to Home screen</strong> را انتخاب کنید.
            </span>
          </li>
        </ol>
      )}
    </div>
  );
}