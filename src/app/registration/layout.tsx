'use client';

import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { FormProvider } from '@/contexts/form-context';

interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  return (
    <FormProvider>
      <div className="min-h-screen bg-black text-white relative">
        <div className="absolute top-6 right-6">
          <LanguageSwitcher />
        </div>
        <div className="min-h-screen flex flex-col justify-center px-4">
          <div className="max-w-2xl mx-auto w-full">
            <ProgressIndicator />
            <div className="mt-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}