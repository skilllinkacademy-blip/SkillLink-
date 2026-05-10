import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

console.log('SkillLink: Starting application...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('SkillLink: Root element not found!');
  document.body.innerHTML = '<div style="color:red; padding:20px; text-align:center;"><h1>Critical Error</h1><p>Root element not found.</p></div>';
} else {
  try {
    console.log('SkillLink: Initializing React root...');
    const root = createRoot(rootElement);
    
    console.log('SkillLink: Importing App component...');
    // We import App dynamically or just trust the static import above.
    // To be safe, we wrap the whole render.
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('SkillLink: Render called successfully.');
  } catch (error) {
    console.error('SkillLink: Initial Render Error:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center; direction: rtl;">
        <h1 style="color: #e11d48;">שגיאת טעינה / Loading Error</h1>
        <p>חלה שגיאה בטעינת האפליקציה. / Error loading application.</p>
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: left; overflow: auto; max-width: 100%; margin-top: 20px;">
          <pre style="margin: 0; white-space: pre-wrap;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">
          נסה שוב / Try Again
        </button>
      </div>
    `;
  }
}

// Global Error Handler for Production
if (import.meta.env.PROD) {
  console.log('SkillLink: Running in Production mode.');
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global Error:', { message, source, lineno, colno, error });
    return false;
  };
} else {
  console.log('SkillLink: Running in Development mode.');
}
  window.onunhandledrejection = function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
  };
