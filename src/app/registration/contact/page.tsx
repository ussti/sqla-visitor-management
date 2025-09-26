'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@/contexts/form-context';
import { contactSchema, ContactInfo } from '@/lib/validation';
import { FormContainer } from '@/components/forms/form-container';
import { FormField } from '@/components/ui/form-field';
import { mondayService } from '@/services/monday';

export default function ContactPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, updateMultipleFields, completeStep, setError, clearError } = useForm();
  const [isCheckingVisitor, setIsCheckingVisitor] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useReactHookForm<ContactInfo>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: state.email || '',
    },
    mode: 'onChange',
  });

  const watchedFields = watch();

  // Update form context when fields change
  React.useEffect(() => {
    const { email } = watchedFields;
    if (email !== state.email) {
      updateMultipleFields({ email });
    }
  }, [watchedFields.email, state.email, updateMultipleFields]);

  // Clear errors when user types
  React.useEffect(() => {
    if (errors.email) {
      clearError('email');
    }
  }, [watchedFields.email, errors, clearError]);

  // Check for existing visitor when email is valid
  React.useEffect(() => {
    const checkExistingVisitor = async () => {
      if (watchedFields.email && !errors.email && watchedFields.email.includes('@')) {
        setIsCheckingVisitor(true);
        try {
          const visitor = await mondayService.findVisitorByEmail(watchedFields.email);
          if (visitor) {
            // Pre-fill form with existing visitor data without showing notification
            if (visitor.firstName && !state.firstName) {
              setValue('email', watchedFields.email);
              updateMultipleFields({
                firstName: visitor.firstName,
                lastName: visitor.lastName,
                companyName: visitor.companyName,
                position: visitor.position,
              });
            }
          }
        } catch (error) {
          console.error('Error checking existing visitor:', error);
        } finally {
          setIsCheckingVisitor(false);
        }
      }
    };

    const timeoutId = setTimeout(checkExistingVisitor, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [watchedFields.email, errors.email, setValue, updateMultipleFields, state.firstName]);

  const onSubmit = async (data: ContactInfo) => {
    try {
      updateMultipleFields(data);
      completeStep(2);
      router.push('/registration/host');
    } catch (error) {
      console.error('Error submitting contact info:', error);
      setError('form', 'Failed to save contact information');
    }
  };

  const isValid = !errors.email && watchedFields.email;

  return (
    <FormContainer
      title={t('contact.title')}
      onSubmit={handleSubmit(onSubmit)}
      previousHref="/registration/organization"
      isSubmitting={isSubmitting}
      canProceed={Boolean(isValid)}
    >
      <FormField
        {...register('email')}
        id="email"
        type="email"
        label={t('contact.email')}
        placeholder={t('contact.emailPlaceholder')}
        error={errors.email?.message}
        required
        helperText={isCheckingVisitor ? t('common.loading') : undefined}
      />

    </FormContainer>
  );
}