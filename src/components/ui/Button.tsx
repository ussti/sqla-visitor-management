import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 active:bg-gray-300",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500",
    outline: "border-2 border-white text-white hover:bg-white hover:text-black active:bg-gray-200 active:text-black"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[48px]", // iPad-friendly touch target
    md: "px-6 py-3 text-base min-h-[60px]", // Default iPad touch target
    lg: "px-8 py-4 text-lg min-h-[72px]" // Large iPad touch target
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}