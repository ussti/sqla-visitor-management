'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from '@/contexts/form-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NotificationPipelineService } from '@/services/notification-pipeline.service';

export default function CompletePage() {
  const { t } = useTranslation();
  const { state, resetForm } = useForm();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Process registration completion in background
  useEffect(() => {
    const processRegistration = async () => {
      if (!state.firstName || !state.email) {
        return;
      }

      try {
        const pipelineService = new NotificationPipelineService();
        // Process in background without showing details
        await pipelineService.processVisitorRegistration(state as any);
      } catch (error) {
        console.error('Pipeline processing failed:', error);
      }
    };

    processRegistration();
  }, [state]);

  // Auto-redirect countdown
  useEffect(() => {
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
  }, [resetForm, router]);

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

          <div className="space-y-4">
            <button
              onClick={handleReturnToMain}
              className="w-full py-4 px-8 rounded-lg text-xl font-semibold bg-white text-black hover:bg-gray-200 transition-colors"
            >
              Return to Main Menu
            </button>

            <p className="text-sm text-gray-400">
              Automatically redirecting in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}