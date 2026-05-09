import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('Initial Render Error:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; text-align: center;">
      <h1 style="color: #e11d48;">שגיאת טעינה</h1>
      <p>חלה שגיאה בטעינת האפליקציה. ייתכן שחסרים משתני סביבה (Supabase) ב-Vercel.</p>
      <pre style="background: #f1f5f9; padding: 10px; border-radius: 8px; text-align: left; overflow: auto; max-width: 100%;">
        ${error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  `;
}

// Global Error Handler for Production
if (import.meta.env.PROD) {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global Error:', { message, source, lineno, colno, error });
    return false;
  };

  window.onunhandledrejection = function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
  };
}
