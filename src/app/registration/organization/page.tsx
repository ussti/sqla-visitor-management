'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@/contexts/form-context';
import { organizationSchema, OrganizationInfo } from '@/lib/validation';
import { FormContainer } from '@/components/forms/form-container';
import { FormField } from '@/components/ui/form-field';

export default function OrganizationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, updateMultipleFields, completeStep, setError, clearError } = useForm();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useReactHookForm<OrganizationInfo>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      companyName: state.companyName || '',
      position: state.position || '',
    },
    mode: 'onChange',
  });

  const watchedFields = watch();

  // Update form context when fields change
  React.useEffect(() => {
    const { companyName, position } = watchedFields;
    if (companyName !== state.companyName || position !== state.position) {
      updateMultipleFields({ companyName, position });
    }
  }, [watchedFields.companyName, watchedFields.position, state.companyName, state.position, updateMultipleFields]);

  // Clear errors when user types
  React.useEffect(() => {
    if (errors.companyName) {
      clearError('companyName');
    }
  }, [watchedFields.companyName, errors, clearError]);

  const onSubmit = async (data: OrganizationInfo) => {
    try {
      updateMultipleFields(data);
      completeStep(1);
      router.push('/registration/contact');
    } catch (error) {
      console.error('Error submitting organization info:', error);
      setError('form', 'Failed to save organization information');
    }
  };

  const isValid = !errors.companyName && watchedFields.companyName;

  return (
    <FormContainer
      title={t('organization.title')}
      onSubmit={handleSubmit(onSubmit)}
      previousHref="/registration/personal"
      isSubmitting={isSubmitting}
      canProceed={Boolean(isValid)}
    >
      <FormField
        {...register('companyName')}
        id="companyName"
        label={t('organization.companyName')}
        placeholder={t('organization.companyNamePlaceholder')}
        error={errors.companyName?.message}
        required
      />

      <FormField
        {...register('position')}
        id="position"
        label={t('organization.position')}
        placeholder={t('organization.positionPlaceholder')}
        error={errors.position?.message}
      />
    </FormContainer>
  );
}