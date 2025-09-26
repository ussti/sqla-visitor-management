'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PRIVACY_POLICY } from '@/lib/privacy-policy';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  className?: string;
}

export function PrivacyPolicyModal({
  isOpen,
  onClose,
  onAccept,
  className = ''
}: PrivacyPolicyModalProps) {
  const { i18n } = useTranslation();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  if (!isOpen) return null;

  const policy = PRIVACY_POLICY[i18n.language as keyof typeof PRIVACY_POLICY] || PRIVACY_POLICY.en;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    onAccept?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-white">{policy.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{policy.lastUpdated}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {policy.sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <p key={itemIndex} className="text-gray-300 text-sm leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Data Deletion Notice */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-2">Data Deletion</h4>
            <p className="text-blue-100 text-sm">
              Data deletion is handled upon request. To request deletion of your personal data,
              please contact us at privacy@sqla.com. We will process your request within 30 days
              and confirm completion via email.
            </p>
          </div>

          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <div className="text-center py-4 border-t border-gray-700">
              <p className="text-yellow-400 text-sm flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>Please scroll to the bottom to continue</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>

          {onAccept && (
            <button
              onClick={handleAccept}
              disabled={!hasScrolledToBottom}
              className={`
                flex-1 px-6 py-3 rounded-lg font-medium transition-colors
                ${hasScrolledToBottom
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Accept Policy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for managing privacy policy modal state
export function usePrivacyPolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  React.useEffect(() => {
    // Check if user has previously accepted
    const accepted = sessionStorage.getItem('privacy_policy_accepted');
    if (accepted) {
      setHasAccepted(true);
    }
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const acceptPolicy = () => {
    setHasAccepted(true);
    sessionStorage.setItem('privacy_policy_accepted', 'true');
    setIsOpen(false);
  };

  const resetAcceptance = () => {
    setHasAccepted(false);
    sessionStorage.removeItem('privacy_policy_accepted');
  };

  return {
    isOpen,
    hasAccepted,
    openModal,
    closeModal,
    acceptPolicy,
    resetAcceptance
  };
}