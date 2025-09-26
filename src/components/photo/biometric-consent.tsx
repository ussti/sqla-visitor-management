'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';

interface BiometricConsentProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  visitorName?: string;
}

export function BiometricConsent({ isOpen, onAccept, onDecline, visitorName }: BiometricConsentProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onClose={onDecline} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-gray-900 p-6 shadow-xl">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>

            <Dialog.Title className="text-xl font-bold text-white mb-4">
              {t('photo.consentTitle')}
            </Dialog.Title>

            <div className="text-gray-300 text-sm space-y-3 mb-6 text-left">
              <p>
                {t('photo.consentText')}
              </p>

              {visitorName && (
                <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
                  <p className="text-white text-xs">
                    <strong>Visitor:</strong> {visitorName}
                  </p>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <p><strong className="text-white">Purpose:</strong> Security and identification during your visit</p>
                <p><strong className="text-white">Storage:</strong> Secure storage in SQLA systems</p>
                <p><strong className="text-white">Retention:</strong> As per SQLA privacy policy</p>
                <p><strong className="text-white">Your Rights:</strong> You may request deletion of your data</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onDecline}
                className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                {t('photo.disagree')}
              </button>

              <button
                onClick={onAccept}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {t('photo.agree')}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              By clicking "I Agree", you consent to the collection and processing of your biometric data (photograph) for the purposes stated above.
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}