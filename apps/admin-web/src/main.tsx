// Fix "global is not defined" error for SockJS/STOMP in Vite
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Clear invalid tokens on startup (surgical removal — do NOT clear all)
const _badToken = localStorage.getItem('token');
if (_badToken === 'undefined' || _badToken === 'null' || (_badToken !== null && _badToken.length < 20)) {
  console.warn('[Startup] Removing invalid token from localStorage');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage'); // Also reset Zustand persisted store
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error: any) => {
        console.error('Query Error:', error);
      }
    },
  },
})

// Simple Error Boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('React Crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
          <div className="glass-card p-10 rounded-[2.5rem] max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-slate-400 mb-6">The application crashed due to a runtime error. This has been logged.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>,
)
