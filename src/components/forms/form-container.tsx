'use client';

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface FormContainerProps {
  title: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  previousHref?: string;
  nextHref?: string;
  isSubmitting?: boolean;
  canProceed?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export function FormContainer({
  title,
  children,
  onSubmit,
  previousHref,
  nextHref,
  isSubmitting = false,
  canProceed = true,
  nextLabel,
  previousLabel,
}: FormContainerProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          {title}
        </h1>
      </div>

      <div className="space-y-6">
        {children}
      </div>

      <div className="flex justify-between pt-6">
        {previousHref ? (
          <Link
            href={previousHref}
            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {previousLabel || t('common.previous')}
          </Link>
        ) : (
          <div />
        )}

        {nextHref && !onSubmit ? (
          <Link
            href={nextHref}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canProceed
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {nextLabel || t('common.next')}
          </Link>
        ) : onSubmit ? (
          <button
            type="submit"
            disabled={isSubmitting || !canProceed}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canProceed && !isSubmitting
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting
              ? t('common.loading')
              : nextLabel || t('common.next')
            }
          </button>
        ) : null}
      </div>
    </form>
  );
}