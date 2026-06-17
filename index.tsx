import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './src/i18n'; // Initialize i18n

import { PrivacyProvider } from './context/PrivacyContext';

import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <PrivacyProvider>
        <App />
      </PrivacyProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
