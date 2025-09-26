'use client';

import React, { useState } from 'react';
import { useForm } from '@/contexts/form-context';
import { NotificationPipelineService } from '@/services/notification-pipeline.service';
import type { NotificationStep, NotificationPipelineResult } from '@/services/notification-pipeline.service';

export function NotificationPipelineTest() {
  const { state } = useForm();
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<NotificationPipelineResult | null>(null);
  const [currentStep, setCurrentStep] = useState<NotificationStep | null>(null);
  const [showDetailedLog, setShowDetailedLog] = useState(false);

  const pipelineService = new NotificationPipelineService({
    maxRetries: 2,
    retryDelayMs: 1000,
    timeoutMs: 15000,
    continueOnFailure: true
  });

  const runPipelineTest = async () => {
    if (!state.firstName || !state.email || !state.hostName) {
      alert('Please complete the registration form first');
      return;
    }

    setIsRunning(true);
    setPipelineResult(null);
    setCurrentStep(null);

    try {
      const result = await pipelineService.processVisitorRegistration(
        state as any,
        (step) => {
          setCurrentStep({ ...step });
        }
      );

      setPipelineResult(result);
    } catch (error) {
      console.error('Pipeline test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const retryFailedSteps = async () => {
    if (!pipelineResult) return;

    setIsRunning(true);

    try {
      const retryResult = await pipelineService.retryFailedSteps(
        pipelineResult,
        state as any,
        (step) => {
          setCurrentStep({ ...step });
        }
      );

      setPipelineResult(retryResult);
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'retrying': return '🔄';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'retrying': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Notification Pipeline Test</h3>

      <div className="space-y-2 text-sm">
        <p className="text-gray-300">Test complete visitor registration pipeline:</p>
        <ul className="text-gray-400 space-y-1">
          <li>👤 Visitor: {state.firstName} {state.lastName} ({state.email})</li>
          <li>👥 Host: {state.hostName}</li>
          <li>📄 PDF: {state.pdfBlob ? '✅' : '❌'} | 📷 Photo: {state.photoBlob ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={runPipelineTest}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Pipeline...' : 'Run Complete Pipeline'}
        </button>

        {pipelineResult && pipelineResult.failedSteps > 0 && !isRunning && (
          <button
            onClick={retryFailedSteps}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry Failed Steps
          </button>
        )}

        <button
          onClick={() => setShowDetailedLog(!showDetailedLog)}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          {showDetailedLog ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Current Step Display */}
      {currentStep && isRunning && (
        <div className="bg-black rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Current Step</h4>
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getStatusIcon(currentStep.status)}</span>
            <div className="flex-1">
              <div className={`font-medium ${getStatusColor(currentStep.status)}`}>
                {currentStep.name}
              </div>
              <div className="text-xs text-gray-400">
                Attempt {currentStep.attempts}/{currentStep.maxAttempts}
                {currentStep.duration && ` • ${currentStep.duration}ms`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Results */}
      {pipelineResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`rounded-lg p-4 ${
            pipelineResult.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              pipelineResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              Pipeline {pipelineResult.success ? 'Completed' : 'Failed'}
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total Steps:</span>
                <div className="text-white font-medium">{pipelineResult.totalSteps}</div>
              </div>
              <div>
                <span className="text-gray-400">Completed:</span>
                <div className="text-green-400 font-medium">{pipelineResult.completedSteps}</div>
              </div>
              <div>
                <span className="text-gray-400">Failed:</span>
                <div className="text-red-400 font-medium">{pipelineResult.failedSteps}</div>
              </div>
            </div>
            {pipelineResult.mondayRecordUrl && (
              <div className="mt-3">
                <a
                  href={pipelineResult.mondayRecordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:underline"
                >
                  View Monday.com Record
                </a>
              </div>
            )}
          </div>

          {/* Step Details */}
          <div className="space-y-2">
            <h4 className="text-white font-medium">Pipeline Steps</h4>
            {pipelineResult.steps.map((step, index) => (
              <div key={step.id} className="bg-black rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(step.status)}</span>
                    <div>
                      <div className={`font-medium ${getStatusColor(step.status)}`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {step.attempts}/{step.maxAttempts} attempts
                        {step.duration && ` • ${step.duration}ms`}
                      </div>
                    </div>
                  </div>
                </div>

                {showDetailedLog && step.error && (
                  <div className="mt-2 text-xs text-red-300 bg-red-900/20 p-2 rounded">
                    Error: {step.error}
                  </div>
                )}

                {showDetailedLog && step.result && (
                  <div className="mt-2 text-xs text-gray-400">
                    <pre className="whitespace-pre-wrap">
                      {typeof step.result === 'object' ? JSON.stringify(step.result, null, 2) : step.result}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>🔄 Pipeline Features:</p>
        <ul className="ml-4 space-y-1">
          <li>• Sequential step execution with retry logic</li>
          <li>• Monday.com status tracking and file uploads</li>
          <li>• Email notifications (host + welcome package)</li>
          <li>• Google Chat team notifications</li>
          <li>• Delivery confirmation tracking</li>
          <li>• Automatic error handling and recovery</li>
        </ul>
      </div>
    </div>
  );
}