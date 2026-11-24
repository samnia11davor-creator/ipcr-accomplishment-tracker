import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  private handleClearStorageAndReset = () => {
    if (window.confirm('This will reset your local session data to default preloaded state. Proceed?')) {
      localStorage.clear();
      window.location.hash = '#/';
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-rose-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Application Notice
            </h1>
            <p className="text-slate-600 mb-6 text-sm">
              The application encountered an unexpected runtime issue while rendering this section.
              Your data is safe in local storage.
            </p>

            {this.state.error && (
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-left text-xs font-mono overflow-x-auto mb-6 max-h-48 border border-slate-800 shadow-inner">
                <p className="font-semibold text-rose-400 mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-slate-400 text-[11px] whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/';
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </button>

              <button
                type="button"
                onClick={this.handleClearStorageAndReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                title="Clears corrupted state if necessary"
              >
                <Trash2 className="w-4 h-4" />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
