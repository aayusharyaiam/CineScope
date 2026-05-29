import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
          <span className="material-symbols-outlined text-6xl text-brand-coral-pink/60 mb-4">error_outline</span>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all active:scale-95"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
