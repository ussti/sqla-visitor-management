import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 min-h-[60px] text-lg bg-gray-900 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200";
    const borderClasses = error
      ? "border-red-500 focus:border-red-400"
      : "border-gray-600 focus:border-white";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-medium text-white mb-2">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={`${baseClasses} ${borderClasses} ${className}`}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';