import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-[#0f172a]/80 backdrop-blur-md border border-red-500/30 p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <AlertCircle className="w-16 h-16 text-red-500/80 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-slate-400 text-sm">
              We encountered an unexpected error rendering this component. Our team has been notified.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
