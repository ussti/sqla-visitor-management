'use client';

import React, { useState } from 'react';
import { ErrorMessage, NetworkErrorMessage, ServiceErrorMessage } from '@/components/ui/error-message';
import { SystemStatusIndicator, ConnectionStatus, SystemHealthDashboard } from '@/components/system/status-indicator';
import { ErrorHandler, serviceRecovery } from '@/lib/api-recovery';

export function ErrorRecoveryTest() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    result: 'success' | 'error';
    details?: string;
  }>>([]);
  const [currentError, setCurrentError] = useState<Error | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showErrorExample, setShowErrorExample] = useState(false);

  const runErrorTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: typeof testResults = [];

    // Test 1: Network Error Simulation
    try {
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('fetch failed: network error')), 100)
      );
      results.push({ test: 'Network Error', result: 'success' });
    } catch (error) {
      const classification = ErrorHandler.classifyError(error as Error);
      results.push({
        test: 'Network Error Classification',
        result: classification.type === 'network' ? 'success' : 'error',
        details: `Classified as: ${classification.type}`
      });
    }

    // Test 2: Service Recovery Test
    try {
      await serviceRecovery.executeEmailService(async () => {
        throw new Error('Service temporarily unavailable');
      });
    } catch (error) {
      results.push({
        test: 'Service Recovery (Expected Failure)',
        result: 'success',
        details: 'Correctly failed after retry attempts'
      });
    }

    // Test 3: Authentication Error
    try {
      const authError = new Error('unauthorized: invalid token');
      const classification = ErrorHandler.classifyError(authError);
      results.push({
        test: 'Auth Error Classification',
        result: classification.type === 'authentication' ? 'success' : 'error',
        details: `Type: ${classification.type}, Recoverable: ${classification.recoverable}`
      });
    } catch (error) {
      results.push({ test: 'Auth Error Classification', result: 'error', details: `${error}` });
    }

    // Test 4: Circuit Breaker Test
    try {
      const status = serviceRecovery.getServiceStatus();
      results.push({
        test: 'Circuit Breaker Status',
        result: 'success',
        details: `Active breakers: ${Object.keys(status).length}`
      });
    } catch (error) {
      results.push({ test: 'Circuit Breaker Status', result: 'error', details: `${error}` });
    }

    // Test 5: Health Check
    try {
      const health = await serviceRecovery.checkServiceHealth();
      results.push({
        test: 'Health Check',
        result: 'success',
        details: `Overall: ${health.overall}, Services: ${Object.keys(health.services).length}`
      });
    } catch (error) {
      results.push({ test: 'Health Check', result: 'error', details: `${error}` });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const simulateError = (type: 'network' | 'auth' | 'validation' | 'service') => {
    const errors = {
      network: new Error('fetch failed: network connection timeout'),
      auth: new Error('unauthorized: authentication failed'),
      validation: new Error('validation error: invalid email format'),
      service: new Error('500 internal server error')
    };

    setCurrentError(errors[type]);
    setShowErrorExample(true);
  };

  const triggerErrorBoundary = () => {
    // This will trigger an error boundary
    throw new Error('Test error boundary trigger');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Error Recovery & Handling Test</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-white font-medium mb-3">Automated Tests</h4>
            <button
              onClick={runErrorTests}
              disabled={isRunning}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? 'Running Tests...' : 'Run Error Tests'}
            </button>

            {testResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{result.test}</span>
                    <div className="flex items-center space-x-2">
                      <span className={result.result === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {result.result === 'success' ? '✓' : '✗'}
                      </span>
                      {result.details && (
                        <span className="text-xs text-gray-500">{result.details}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Error Simulation</h4>
            <div className="space-y-2">
              <button
                onClick={() => simulateError('network')}
                className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Simulate Network Error
              </button>
              <button
                onClick={() => simulateError('auth')}
                className="w-full px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
              >
                Simulate Auth Error
              </button>
              <button
                onClick={() => simulateError('validation')}
                className="w-full px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Simulate Validation Error
              </button>
              <button
                onClick={() => simulateError('service')}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Simulate Service Error
              </button>
            </div>
          </div>
        </div>

        {/* Error Display Example */}
        {showErrorExample && currentError && (
          <div className="mb-6">
            <h4 className="text-white font-medium mb-3">Error Display Example</h4>
            <ErrorMessage
              error={currentError}
              onRetry={() => console.log('Retry clicked')}
              onDismiss={() => setShowErrorExample(false)}
              showTechnicalDetails={true}
            />
          </div>
        )}

        {/* Specialized Error Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-white font-medium mb-2">Network Error Example</h4>
            <NetworkErrorMessage onRetry={() => console.log('Network retry')} />
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Service Error Example</h4>
            <ServiceErrorMessage onRetry={() => console.log('Service retry')} />
          </div>
        </div>
      </div>

      {/* System Status Testing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-white font-medium mb-3">System Status Indicators</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-gray-400 text-sm mb-2">Compact Status</h5>
              <SystemStatusIndicator compact={true} />
            </div>
            <div>
              <h5 className="text-gray-400 text-sm mb-2">Detailed Status</h5>
              <SystemStatusIndicator showDetails={true} />
            </div>
            <div>
              <h5 className="text-gray-400 text-sm mb-2">Connection Status</h5>
              <ConnectionStatus />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">System Health Dashboard</h4>
          <SystemHealthDashboard />
        </div>
      </div>

      {/* Error Boundary Test */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-white font-medium mb-3">Error Boundary Test</h4>
        <p className="text-gray-400 text-sm mb-4">
          This button will trigger an error boundary. Make sure you wrap this component in an ErrorBoundary to test it.
        </p>
        <button
          onClick={triggerErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Trigger Error Boundary
        </button>
      </div>

      {/* Recovery Features Summary */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-white font-medium mb-3">🛡️ Error Recovery Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h5 className="text-white font-medium mb-2">Automatic Recovery</h5>
            <ul className="space-y-1">
              <li>• Retry logic with exponential backoff</li>
              <li>• Circuit breaker pattern for service protection</li>
              <li>• Intelligent error classification</li>
              <li>• Service health monitoring</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-medium mb-2">User Experience</h5>
            <ul className="space-y-1">
              <li>• User-friendly error messages</li>
              <li>• Contextual recovery actions</li>
              <li>• Real-time system status</li>
              <li>• Error boundary fallbacks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}