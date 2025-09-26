'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PrivacyPolicyModal } from './privacy-policy-modal';

interface PrivacyBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  className?: string;
}

export function PrivacyBanner({
  onAccept,
  onDecline,
  className = ''
}: PrivacyBannerProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/declined
    const cookieConsent = localStorage.getItem('cookie_consent');
    const privacyAccepted = sessionStorage.getItem('privacy_policy_accepted');

    if (!cookieConsent && !privacyAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-gray-700 p-4 z-40 ${className}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-white font-medium mb-1">Privacy & Cookie Notice</h3>
            <p className="text-gray-300 text-sm">
              We use essential cookies and collect minimal data to provide our visitor management service.
              By continuing, you consent to our data practices as outlined in our{' '}
              <button
                onClick={openModal}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>

          <div className="flex space-x-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Decline
            </button>

            <button
              onClick={openModal}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Learn More
            </button>

            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-white text-black hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={showModal}
        onClose={closeModal}
        onAccept={handleAccept}
      />
    </>
  );
}

// Hook for managing privacy banner state
export function usePrivacyBanner() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    setHasConsent(consent === 'accepted');
  }, []);

  const acceptConsent = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setHasConsent(true);
  };

  const declineConsent = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setHasConsent(false);
  };

  const resetConsent = () => {
    localStorage.removeItem('cookie_consent');
    setHasConsent(null);
  };

  return {
    hasConsent,
    acceptConsent,
    declineConsent,
    resetConsent
  };
}