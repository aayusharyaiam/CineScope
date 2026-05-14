import { Component } from 'react';
import { ErrorState } from './AppState';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Route crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] px-4 py-12 flex items-center justify-center">
          <ErrorState
            title="This page missed its cue"
            message="CineScope hit an unexpected UI problem. Your account data is still safe; try refreshing the scene."
            actionLabel="Reload page"
            onAction={() => window.location.reload()}
            className="w-full max-w-2xl"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
