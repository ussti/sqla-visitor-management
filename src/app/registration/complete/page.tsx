'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from '@/contexts/form-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CompletePage() {
  const { t } = useTranslation();
  const { resetForm } = useForm();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use setTimeout to avoid updating during render
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

          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <p className="text-gray-300">
              {t('completion.message')}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleReturnToMain}
              className="w-full bg-white text-black py-4 px-8 rounded-lg text-xl font-semibold hover:bg-gray-200 transition-colors"
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