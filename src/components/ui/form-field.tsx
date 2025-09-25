'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, required, helperText, className = '', ...props }, ref) => {
    const { t } = useTranslation();

    return (
      <div className="space-y-2">
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-transparent transition-colors ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-700 hover:border-gray-600'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400">
            {error.includes('.') ? t(error) : error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';