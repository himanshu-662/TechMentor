import React from 'react';
import { AlertTriangle, RotateCcw, Home, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TechMentor caught unhandled render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleResetStep = () => {
    try {
      localStorage.setItem('datamentor_current_step', 'collection');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearAllStorage = () => {
    try {
      localStorage.removeItem('datamentor_active_dataset');
      localStorage.removeItem('datamentor_current_step');
      localStorage.removeItem('datamentor_step_states');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Something Went Wrong</h1>
                <p className="text-xs text-slate-400 mt-1">
                  A component error occurred while rendering the interface.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto space-y-1">
              <div className="font-bold text-rose-400">{this.state.error?.toString()}</div>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-slate-500 max-h-36 overflow-y-auto mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleResetStep}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <Home className="w-4 h-4" />
                <span>Return to Step 01 (Collection)</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleClearAllStorage}
                className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors ml-auto"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Clear Storage & Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
