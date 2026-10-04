import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { OnboardingProvider } from './context/OnboardingContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SamplePreferencesProvider } from './context/SamplePreferencesContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { HardPointsProvider } from './context/HardPointsContext.jsx';
import { ReviewProvider } from './context/ReviewContext.jsx';
import './styles/index.css';

import * as __loaders from './data/loaders.js';
import * as __sampleLoaders from './data/sampleQuestionsLoader.js';

if (import.meta.env.DEV) {
  window.__loaders = __loaders;
  window.__sampleLoaders = __sampleLoaders;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OnboardingProvider>
      <ThemeProvider>
        <SamplePreferencesProvider>
          <ProgressProvider>
            <HardPointsProvider>
              <ReviewProvider>
                <App />
              </ReviewProvider>
            </HardPointsProvider>
          </ProgressProvider>
        </SamplePreferencesProvider>
      </ThemeProvider>
    </OnboardingProvider>
  </React.StrictMode>
);