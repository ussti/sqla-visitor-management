'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useForm } from '@/contexts/form-context';
import { FormContainer } from '@/components/forms/form-container';

export default function PhotoPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { completeStep } = useForm();

  const handleNext = () => {
    completeStep(4); // Photo step
    router.push('/registration/nda');
  };

  return (
    <FormContainer
      title={t('photo.title')}
      previousHref="/registration/host"
      onSubmit={handleNext}
      canProceed={true}
    >
      <div className="text-center py-8">
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-12">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-semibold mb-2">{t('photo.title')}</h3>
          <p className="text-gray-400">
            {t('photo.subtitle')}
          </p>
          <p className="text-sm text-yellow-400 mt-4">
            🚧 Coming Soon - Photo capture functionality will be implemented in Week 3
          </p>
        </div>
      </div>
    </FormContainer>
  );
}