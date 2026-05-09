import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) return fallback;
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">משהו השתבש / Something went wrong</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              האפליקציה נתקלה בשגיאה לא צפויה. נסה לרענן את הדף.
              <br />
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
            >
              רענן דף / Refresh Page
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-8 p-4 bg-slate-200 rounded-xl text-left text-xs overflow-auto max-h-40">
                {error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
