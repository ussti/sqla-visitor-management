'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useForm } from '@/contexts/form-context';
import { FormContainer } from '@/components/forms/form-container';
import { PhotoCapture } from '@/components/photo/photo-capture';

export default function PhotoPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateMultipleFields, completeStep } = useForm();

  const [photoData, setPhotoData] = useState<{
    blob: Blob;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handlePhotoComplete = (photoBlob: Blob, photoUrl: string) => {
    setPhotoData({ blob: photoBlob, url: photoUrl });
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setPhotoData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoData) {
      setError('Photo is required to proceed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store photo data in form context
      updateMultipleFields({
        photoBlob: photoData.blob,
        photoUrl: photoData.url
      });

      completeStep(4); // Photo step
      router.push('/registration/nda');
    } catch (error) {
      console.error('Error saving photo:', error);
      setError('Failed to save photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = !!photoData && !isSubmitting;

  return (
    <FormContainer
      title={t('photo.title')}
      previousHref="/registration/host"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      canProceed={canProceed}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-white rounded-lg p-4">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        <PhotoCapture
          onPhotoComplete={handlePhotoComplete}
          onError={handleError}
        />
      </div>
    </FormContainer>
  );
}