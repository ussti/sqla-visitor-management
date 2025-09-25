'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface Step {
  id: string;
  path: string;
  titleKey: string;
}

const steps: Step[] = [
  { id: 'personal', path: '/registration/personal', titleKey: 'personalInfo.title' },
  { id: 'organization', path: '/registration/organization', titleKey: 'organization.title' },
  { id: 'contact', path: '/registration/contact', titleKey: 'contact.title' },
  { id: 'host', path: '/registration/host', titleKey: 'host.title' },
  { id: 'photo', path: '/registration/photo', titleKey: 'photo.title' },
  { id: 'nda', path: '/registration/nda', titleKey: 'nda.title' },
];

export function ProgressIndicator() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentStepIndex = steps.findIndex(step => pathname.startsWith(step.path));
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>
          {currentStepIndex >= 0 ? t(steps[currentStepIndex].titleKey) : ''}
        </span>
        <span>
          {currentStepIndex >= 0 ? `${currentStepIndex + 1} / ${steps.length}` : ''}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}