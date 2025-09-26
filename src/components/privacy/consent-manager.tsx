'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface ConsentData {
  dataProcessing: boolean;
  biometricData: boolean;
  photoCapture: boolean;
  emailNotifications: boolean;
  dataRetention: boolean;
  thirdPartySharing: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ConsentManagerProps {
  onConsentGiven: (consent: ConsentData) => void;
  onConsentDeclined: () => void;
  requiredConsents?: (keyof ConsentData)[];
  className?: string;
}

export function ConsentManager({
  onConsentGiven,
  onConsentDeclined,
  requiredConsents = ['dataProcessing', 'biometricData', 'photoCapture'],
  className = ''
}: ConsentManagerProps) {
  const { t } = useTranslation();
  const [consents, setConsents] = useState<Partial<ConsentData>>({});
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const consentItems = [
    {
      key: 'dataProcessing' as const,
      title: 'Data Processing Consent',
      description: 'I consent to the processing of my personal data for visitor management purposes.',
      required: true,
      details: 'Your personal information (name, email, organization) will be processed to manage your visit and maintain security records. Data is stored securely and accessed only by authorized personnel.'
    },
    {
      key: 'biometricData' as const,
      title: 'Biometric Data Consent',
      description: 'I consent to the capture and storage of my photograph for identification purposes.',
      required: true,
      details: 'A photograph will be taken for security identification. This image is stored securely and used solely for visitor identification and security purposes during your visit.'
    },
    {
      key: 'photoCapture' as const,
      title: 'Photo Capture Consent',
      description: 'I understand that my photo will be attached to my visitor record.',
      required: true,
      details: 'Your photograph will be attached to your visitor record in our system for identification and security purposes. The image is encrypted and stored securely.'
    },
    {
      key: 'emailNotifications' as const,
      title: 'Email Communications',
      description: 'I consent to receive welcome emails and visit-related communications.',
      required: false,
      details: 'You will receive a welcome email with visit information, studio guidelines, and relevant materials. You can opt out of future communications at any time.'
    },
    {
      key: 'dataRetention' as const,
      title: 'Data Retention',
      description: 'I understand that my data will be retained for security and compliance purposes.',
      required: false,
      details: 'Visitor records are retained for security auditing and compliance purposes. Data is automatically reviewed and purged according to our retention policy.'
    },
    {
      key: 'thirdPartySharing' as const,
      title: 'Third-Party Services',
      description: 'I consent to data processing through secure third-party services (Monday.com, email providers).',
      required: false,
      details: 'Your data is processed through secure, GDPR-compliant third-party services including Monday.com for record keeping and email services for communications. All providers maintain appropriate security standards.'
    }
  ];

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const canSubmit = () => {
    return requiredConsents.every(key => consents[key] === true);
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setIsSubmitting(true);

    try {
      // Get user's IP and browser info for consent record
      const response = await fetch('/api/client-info');
      const clientInfo = await response.json();

      const consentData: ConsentData = {
        dataProcessing: consents.dataProcessing || false,
        biometricData: consents.biometricData || false,
        photoCapture: consents.photoCapture || false,
        emailNotifications: consents.emailNotifications || false,
        dataRetention: consents.dataRetention || false,
        thirdPartySharing: consents.thirdPartySharing || false,
        timestamp: new Date().toISOString(),
        ipAddress: clientInfo.ip,
        userAgent: clientInfo.userAgent
      };

      onConsentGiven(consentData);
    } catch (error) {
      console.error('Error submitting consent:', error);
      // Continue with consent without client info
      const consentData: ConsentData = {
        dataProcessing: consents.dataProcessing || false,
        biometricData: consents.biometricData || false,
        photoCapture: consents.photoCapture || false,
        emailNotifications: consents.emailNotifications || false,
        dataRetention: consents.dataRetention || false,
        thirdPartySharing: consents.thirdPartySharing || false,
        timestamp: new Date().toISOString()
      };

      onConsentGiven(consentData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    onConsentDeclined();
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 border border-gray-700 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Privacy & Data Consent
        </h2>
        <p className="text-gray-300 text-sm">
          We respect your privacy and are committed to protecting your personal data.
          Please review and provide consent for the processing of your information.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {consentItems.map((item) => {
          const isRequired = requiredConsents.includes(item.key);
          const isChecked = consents[item.key] || false;

          return (
            <div key={item.key} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleConsentChange(item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`
                      w-5 h-5 border-2 rounded transition-colors
                      ${isChecked
                        ? 'bg-white border-white'
                        : 'border-gray-500 bg-transparent'
                      }
                      ${isRequired && !isChecked ? 'border-red-500' : ''}
                    `}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-black m-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-white font-medium text-sm">
                      {item.title}
                    </h3>
                    {isRequired && (
                      <span className="text-red-400 text-xs font-medium">
                        Required
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mb-2">
                    {item.description}
                  </p>

                  <button
                    onClick={() => setShowDetails(showDetails === item.key ? false : item.key)}
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    {showDetails === item.key ? 'Hide' : 'Show'} Details
                  </button>

                  {showDetails === item.key && (
                    <div className="mt-2 p-3 bg-black/20 rounded text-xs text-gray-400">
                      {item.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GDPR/CCPA Rights Information */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
        <h4 className="text-blue-200 font-medium text-sm mb-2">Your Rights</h4>
        <div className="text-blue-100 text-xs space-y-1">
          <p>• Right to access your personal data</p>
          <p>• Right to correct inaccurate information</p>
          <p>• Right to delete your data (right to be forgotten)</p>
          <p>• Right to restrict processing</p>
          <p>• Right to data portability</p>
          <p>• Right to object to processing</p>
        </div>
        <p className="text-blue-200 text-xs mt-2">
          To exercise these rights, contact our Data Protection Officer at privacy@sqla.com
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleDecline}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Decline
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit() || isSubmitting}
          className={`
            flex-1 px-6 py-3 rounded-lg font-medium transition-colors
            ${canSubmit()
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? 'Processing...' : 'Accept & Continue'}
        </button>
      </div>

      {!canSubmit() && (
        <p className="text-red-400 text-sm mt-3 text-center">
          Please provide consent for all required items to continue
        </p>
      )}
    </div>
  );
}

// Hook for managing consent state
export function useConsentManager() {
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check for existing consent in session storage
    const savedConsent = sessionStorage.getItem('visitor_consent');
    if (savedConsent) {
      try {
        const consent = JSON.parse(savedConsent);
        setConsentData(consent);
        setHasConsent(true);
      } catch (error) {
        console.error('Error parsing saved consent:', error);
      }
    }
  }, []);

  const saveConsent = (consent: ConsentData) => {
    setConsentData(consent);
    setHasConsent(true);
    sessionStorage.setItem('visitor_consent', JSON.stringify(consent));
  };

  const clearConsent = () => {
    setConsentData(null);
    setHasConsent(false);
    sessionStorage.removeItem('visitor_consent');
  };

  return {
    consentData,
    hasConsent,
    saveConsent,
    clearConsent
  };
}