'use client';

import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-4xl font-bold mb-8">
            {t('welcome.title')}
          </h1>
          <Link
            href="/registration/personal"
            className="w-full bg-white text-black py-4 px-8 rounded-lg text-xl font-semibold hover:bg-gray-200 transition-colors inline-block text-center"
          >
            {t('welcome.startRegistration')}
          </Link>
        </div>
      </div>
    </div>
  );
}
