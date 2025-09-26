'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from '@/contexts/form-context';
import { FormContainer } from '@/components/forms/form-container';
import { NDAPreview } from '@/components/nda/nda-preview';
import { NDATemplateData } from '@/lib/nda-template';
import { NotificationPipelineService } from '@/services/notification-pipeline.service';

// Lazy load SignaturePad component
const SignaturePad = dynamic(() => import('@/components/signature/signature-pad').then(mod => ({ default: mod.SignaturePad })), {
  loading: () => <div className="flex justify-center items-center p-4"><div className="text-white">Loading signature pad...</div></div>,
  ssr: false
});

export default function NDAPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, updateMultipleFields, completeStep } = useForm();

  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);
  const [signature, setSignature] = React.useState<string | null>(null);
  const [signatureError, setSignatureError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Prepare NDA data with current form state
  const ndaData: NDATemplateData = React.useMemo(() => ({
    visitorName: `${state.firstName || ''} ${state.lastName || ''}`.trim(),
    visitorEmail: state.email || '',
    companyName: state.companyName || '',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
  }), [state.firstName, state.lastName, state.email, state.companyName]);

  const handleScrollToBottom = () => {
    setHasScrolledToBottom(true);
  };

  const handleSignatureChange = (signatureData: string | null, signatureBlob?: Blob, signatureUrl?: string) => {
    setSignature(signatureData);
    setSignatureError('');
    updateMultipleFields({
      signature: signatureData || undefined,
      signatureBlob: signatureBlob,
      signatureUrl: signatureUrl,
      ndaAccepted: !!signatureData
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasScrolledToBottom) {
      alert(t('nda.scrollToSign'));
      return;
    }

    if (!signature) {
      setSignatureError(t('nda.signature.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Store signature data and mark NDA as signed
      updateMultipleFields({
        signature: signature,
        ndaAccepted: true,
        ndaSignedAt: new Date().toISOString(),
      });

      completeStep(5); // NDA step

      // Process registration immediately in background
      try {
        const pipelineService = new NotificationPipelineService();
        pipelineService.processVisitorRegistration(state as any);
      } catch (pipelineError) {
        console.error('Pipeline processing failed:', pipelineError);
        // Continue to redirect even if pipeline fails
      }

      // Redirect to completion page
      router.push('/registration/complete');

    } catch (error) {
      console.error('Error processing signature:', error);
      setSignatureError(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = hasScrolledToBottom && !!signature;

  return (
    <FormContainer
      title={t('nda.title')}
      onSubmit={handleSubmit}
      previousHref="/registration/photo"
      isSubmitting={isSubmitting}
      canProceed={canProceed}
      nextLabel={t('common.confirm')}
    >
      <div className="space-y-4">
        <p className="text-gray-300 text-center text-sm">
          {t('nda.subtitle')}
        </p>

        <NDAPreview
          data={ndaData}
          onScrollToBottom={handleScrollToBottom}
        />


        {hasScrolledToBottom && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">
                  {t('nda.signature.title')}
                </h3>
                <p className="text-gray-300 text-xs">
                  I, <strong>{ndaData.visitorName}</strong>, have read and understood the terms of this
                  Non-Disclosure Agreement. I agree to be bound by its terms and conditions.
                </p>
              </div>

              <SignaturePad
                onSignature={handleSignatureChange}
                required={true}
                error={signatureError}
                className="w-full"
              />

              <div className="text-xs text-gray-500 text-center">
                <p>Digital signature date: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </FormContainer>
  );
}