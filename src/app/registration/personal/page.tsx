'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@/contexts/form-context';
import { personalInfoSchema, PersonalInfo } from '@/lib/validation';
import { FormContainer } from '@/components/forms/form-container';
import { FormField } from '@/components/ui/form-field';

export default function PersonalInfoPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, updateMultipleFields, completeStep, setError, clearError } = useForm();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useReactHookForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: state.firstName || '',
      lastName: state.lastName || '',
    },
    mode: 'onChange',
  });

  const watchedFields = watch();

  // Update form context when fields change
  React.useEffect(() => {
    const { firstName, lastName } = watchedFields;
    if (firstName !== state.firstName || lastName !== state.lastName) {
      updateMultipleFields({ firstName, lastName });
    }
  }, [watchedFields.firstName, watchedFields.lastName, state.firstName, state.lastName, updateMultipleFields]);

  // Clear errors when user types
  React.useEffect(() => {
    if (errors.firstName) {
      clearError('firstName');
    }
    if (errors.lastName) {
      clearError('lastName');
    }
  }, [watchedFields.firstName, watchedFields.lastName, errors, clearError]);

  const onSubmit = async (data: PersonalInfo) => {
    try {
      updateMultipleFields(data);
      completeStep(0);
      router.push('/registration/organization');
    } catch (error) {
      console.error('Error submitting personal info:', error);
      setError('form', 'Failed to save personal information');
    }
  };

  const isValid = !errors.firstName && !errors.lastName && watchedFields.firstName && watchedFields.lastName;

  return (
    <FormContainer
      title={t('personalInfo.title')}
      onSubmit={handleSubmit(onSubmit)}
      previousHref="/"
      isSubmitting={isSubmitting}
      canProceed={Boolean(isValid)}
    >
      <FormField
        {...register('firstName')}
        id="firstName"
        label={t('personalInfo.firstName')}
        placeholder={t('personalInfo.firstNamePlaceholder')}
        error={errors.firstName?.message}
        required
      />

      <FormField
        {...register('lastName')}
        id="lastName"
        label={t('personalInfo.lastName')}
        placeholder={t('personalInfo.lastNamePlaceholder')}
        error={errors.lastName?.message}
        required
      />
    </FormContainer>
  );
}