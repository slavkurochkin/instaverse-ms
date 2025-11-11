import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a ResizeObserver error
    if (
      error.message &&
      error.message.includes('ResizeObserver loop limit exceeded')
    ) {
      // Don't update state for ResizeObserver errors, just suppress them
      return null;
    }
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Check if it's a ResizeObserver error
    if (
      error.message &&
      error.message.includes('ResizeObserver loop limit exceeded')
    ) {
      // Suppress ResizeObserver errors
      console.warn('ResizeObserver error suppressed:', error.message);
      return;
    }

    // Log other errors
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
