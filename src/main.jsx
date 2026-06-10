import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

/* Register the service worker in production. In dev the SW will
   intercept Vite's HMR and break reloads, so we skip it then. */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // eslint-disable-next-line no-console
        console.info('[DNDN] Service worker registered:', reg.scope);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('[DNDN] Service worker registration failed:', error);
      });
  });
}
