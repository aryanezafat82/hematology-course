import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { OnboardingProvider } from './context/OnboardingContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { HardPointsProvider } from './context/HardPointsContext.jsx';
import { ReviewProvider } from './context/ReviewContext.jsx';
import './styles/index.css';

// Capture the install prompt event as early as possible.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
});

// Register the service worker (required for PWA installability).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* ignore — non-fatal */
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OnboardingProvider>
      <ThemeProvider>
        <ProgressProvider>
          <HardPointsProvider>
            <ReviewProvider>
              <App />
            </ReviewProvider>
          </HardPointsProvider>
        </ProgressProvider>
      </ThemeProvider>
    </OnboardingProvider>
  </React.StrictMode>
);