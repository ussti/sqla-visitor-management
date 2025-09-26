'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Implement error logging service
    console.log('Logging error to monitoring service:', { error, errorInfo });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onReload: () => void;
  showDetails?: boolean;
}

function ErrorFallback({ error, errorInfo, onRetry, onReload, showDetails }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm">
            We encountered an unexpected error. Please try again or reload the page.
          </p>
        </div>

        {showDetails && error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
            <div className="text-xs text-red-300 font-mono">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">
                    {errorInfo.componentStack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={onReload}
            className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Reload Page
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Error ID: {Date.now().toString(36)}</p>
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}

// Export the ErrorBoundary with proper typing
export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryClass {...props} />;
}

// Specialized error boundaries for different contexts
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Form Error:', error, errorInfo);
      }}
      fallback={
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 text-center">
          <h3 className="text-red-400 font-semibold mb-2">Form Error</h3>
          <p className="text-gray-300 text-sm mb-4">
            There was an error with the form. Please refresh the page and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function APIErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('API Error:', error, errorInfo);
      }}
      fallback={
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 text-center">
          <h3 className="text-yellow-400 font-semibold mb-2">Connection Error</h3>
          <p className="text-gray-300 text-sm mb-4">
            Unable to connect to our services. Please check your internet connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}