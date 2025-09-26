'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from '@/contexts/form-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NotificationPipelineService } from '@/services/notification-pipeline.service';
import type { NotificationStep } from '@/services/notification-pipeline.service';

export default function CompletePage() {
  const { t } = useTranslation();
  const { state, resetForm } = useForm();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isProcessing, setIsProcessing] = useState(true);
  const [pipelineSteps, setPipelineSteps] = useState<NotificationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<NotificationStep | null>(null);
  const [pipelineSuccess, setPipelineSuccess] = useState(false);

  // Process registration completion
  useEffect(() => {
    const processRegistration = async () => {
      if (!state.firstName || !state.email) {
        setIsProcessing(false);
        return;
      }

      try {
        const pipelineService = new NotificationPipelineService();

        const result = await pipelineService.processVisitorRegistration(
          state as any,
          (step) => {
            setCurrentStep({ ...step });
          }
        );

        setPipelineSteps(result.steps);
        setPipelineSuccess(result.success);

      } catch (error) {
        console.error('Pipeline processing failed:', error);
        setPipelineSuccess(false);
      } finally {
        setIsProcessing(false);
      }
    };

    processRegistration();
  }, [state]);

  // Auto-redirect countdown after processing completes
  useEffect(() => {
    if (isProcessing) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            resetForm();
            router.push('/');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isProcessing, resetForm, router]);

  const handleReturnToMain = () => {
    resetForm();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="min-h-screen flex flex-col justify-center px-4">
        <div className="max-w-2xl mx-auto w-full text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t('completion.title')}
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            {t('completion.subtitle')}
          </p>

          {isProcessing ? (
            <div className="bg-gray-900 rounded-lg p-6 mb-8 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Processing Registration...</h3>

              {currentStep && (
                <div className="bg-black rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full animate-pulse ${
                      currentStep.status === 'processing' ? 'bg-yellow-500' :
                      currentStep.status === 'retrying' ? 'bg-blue-500' :
                      currentStep.status === 'completed' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{currentStep.name}</div>
                      <div className="text-xs text-gray-400">
                        Attempt {currentStep.attempts}/{currentStep.maxAttempts}
                        {currentStep.duration && ` • ${currentStep.duration}ms`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pipelineSteps.length > 0 && (
                <div className="space-y-2">
                  {pipelineSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        step.status === 'pending' ? 'bg-gray-500' :
                        step.status === 'processing' || step.status === 'retrying' ? 'bg-yellow-500 animate-pulse' :
                        step.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-sm ${
                        step.status === 'failed' ? 'text-red-400' : 'text-gray-300'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`rounded-lg p-6 mb-8 ${
              pipelineSuccess ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${
                pipelineSuccess ? 'text-green-400' : 'text-red-400'
              }`}>
                Registration {pipelineSuccess ? 'Completed Successfully' : 'Completed with Errors'}
              </h3>
              <p className="text-gray-300 text-sm">
                {pipelineSuccess
                  ? 'All notifications have been sent and files have been uploaded.'
                  : 'Registration completed but some notifications may have failed.'
                }
              </p>
              {pipelineSteps.length > 0 && (
                <div className="mt-4 space-y-1">
                  {pipelineSteps.map((step) => (
                    <div key={step.id} className="flex items-center space-x-2 text-xs">
                      <span className={
                        step.status === 'completed' ? 'text-green-400' :
                        step.status === 'failed' ? 'text-red-400' : 'text-gray-400'
                      }>
                        {step.status === 'completed' ? '✓' : step.status === 'failed' ? '✗' : '•'}
                      </span>
                      <span className="text-gray-300">{step.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleReturnToMain}
              disabled={isProcessing}
              className={`w-full py-4 px-8 rounded-lg text-xl font-semibold transition-colors ${
                isProcessing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Return to Main Menu'}
            </button>

            {!isProcessing && (
              <p className="text-sm text-gray-400">
                Automatically redirecting in {countdown} seconds...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}