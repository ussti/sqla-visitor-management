'use client';

import React, { useState } from 'react';
import { ErrorHandler } from '@/lib/api-recovery';

interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showTechnicalDetails?: boolean;
  variant?: 'banner' | 'card' | 'inline';
}

export function ErrorMessage({
  error,
  onRetry,
  onDismiss,
  className = '',
  showTechnicalDetails = false,
  variant = 'card'
}: ErrorMessageProps) {
  const [showDetails, setShowDetails] = useState(false);

  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const errorInfo = ErrorHandler.createUserFriendlyError(errorObj);

  const getVariantStyles = () => {
    const baseStyles = "rounded-lg p-4 border";

    switch (variant) {
      case 'banner':
        return `${baseStyles} w-full`;
      case 'inline':
        return `${baseStyles} text-sm`;
      default:
        return baseStyles;
    }
  };

  const getErrorStyles = () => {
    switch (errorInfo.severity) {
      case 'high':
        return 'bg-red-900/20 border-red-600 text-red-100';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-600 text-yellow-100';
      default:
        return 'bg-blue-900/20 border-blue-600 text-blue-100';
    }
  };

  const getErrorIcon = () => {
    switch (errorInfo.type) {
      case 'network':
        return '🌐';
      case 'authentication':
        return '🔒';
      case 'validation':
        return '⚠️';
      case 'service':
        return '🔧';
      default:
        return '❌';
    }
  };

  return (
    <div className={`${getVariantStyles()} ${getErrorStyles()} ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">{getErrorIcon()}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold mb-1">
                {errorInfo.type === 'network' && 'Connection Error'}
                {errorInfo.type === 'authentication' && 'Authentication Error'}
                {errorInfo.type === 'validation' && 'Validation Error'}
                {errorInfo.type === 'service' && 'Service Error'}
                {errorInfo.type === 'unknown' && 'Unexpected Error'}
              </h4>

              <p className="text-sm opacity-90">
                {errorInfo.userMessage}
              </p>

              {showTechnicalDetails && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs opacity-70 hover:opacity-100 underline"
                  >
                    {showDetails ? 'Hide' : 'Show'} Technical Details
                  </button>

                  {showDetails && (
                    <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono">
                      <div><strong>Error ID:</strong> {errorInfo.errorId}</div>
                      <div><strong>Type:</strong> {errorInfo.type}</div>
                      <div><strong>Severity:</strong> {errorInfo.severity}</div>
                      <div><strong>Time:</strong> {new Date(errorInfo.timestamp).toLocaleString()}</div>
                      <div className="mt-1">
                        <strong>Technical Message:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{errorInfo.technicalMessage}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs opacity-50 hover:opacity-100 ml-2 flex-shrink-0"
              >
                ✕
              </button>
            )}
          </div>

          {(onRetry && errorInfo.canRetry) && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized error message components
export function NetworkErrorMessage({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorMessage
      error="Network connection failed"
      onRetry={onRetry}
      className={className}
      variant="banner"
    />
  );
}

export function ValidationErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <ErrorMessage
      error={message}
      className={className}
      variant="inline"
    />
  );
}

export function ServiceErrorMessage({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorMessage
      error="Service temporarily unavailable"
      onRetry={onRetry}
      className={className}
    />
  );
}

// Toast-style error notifications
export function ErrorToast({
  error,
  onDismiss,
  duration = 5000
}: {
  error: Error | string;
  onDismiss: () => void;
  duration?: number;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="fixed top-4 right-4 max-w-md z-50 animate-slide-in">
      <ErrorMessage
        error={error}
        onDismiss={onDismiss}
        showTechnicalDetails={false}
        variant="card"
      />
    </div>
  );
}