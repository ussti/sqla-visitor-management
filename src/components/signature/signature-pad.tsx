'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useTranslation } from 'react-i18next';

interface SignaturePadProps {
  onSignature: (signature: string | null) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export function SignaturePad({
  onSignature,
  required = false,
  error,
  className = ''
}: SignaturePadProps) {
  const { t } = useTranslation();
  const sigPadRef = useRef<SignatureCanvas>(null);
  const onSignatureRef = useRef(onSignature);
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasStartedSigning, setHasStartedSigning] = useState(false);

  // Keep the callback reference current
  useEffect(() => {
    onSignatureRef.current = onSignature;
  });

  const checkIfEmpty = useCallback(() => {
    if (sigPadRef.current) {
      const isEmpty = sigPadRef.current.isEmpty();
      setIsEmpty(isEmpty);

      if (isEmpty) {
        onSignatureRef.current(null);
      } else {
        const signature = sigPadRef.current.toDataURL('image/png');
        onSignatureRef.current(signature);
      }
    }
  }, []);

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setIsEmpty(true);
      setHasStartedSigning(false);
      onSignatureRef.current(null);
    }
  };

  const handleBegin = () => {
    setHasStartedSigning(true);
  };

  const handleEnd = () => {
    checkIfEmpty();
  };

  useEffect(() => {
    // Initial check
    checkIfEmpty();
  }, [checkIfEmpty]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          {t('nda.signature.label')} {required && <span className="text-red-400">*</span>}
        </label>

        <div className={`relative bg-white rounded-lg border-2 w-full ${error ? 'border-red-400' : 'border-gray-300'}`}>
          <SignatureCanvas
            ref={sigPadRef}
            canvasProps={{
              width: 600,
              height: 200,
              className: 'signature-canvas rounded-lg cursor-crosshair w-full'
            }}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
            minWidth={2}
            maxWidth={4}
            velocityFilterWeight={0.7}
            onBegin={handleBegin}
            onEnd={handleEnd}
          />

          {/* Placeholder text when empty and not started signing */}
          {isEmpty && !hasStartedSigning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-lg">
                {t('nda.signature.placeholder')}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={clearSignature}
          disabled={isEmpty}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isEmpty
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {t('nda.signature.clear')}
        </button>

        <div className="text-sm text-gray-400">
          {isEmpty ? t('nda.signature.empty') : t('nda.signature.signed')}
        </div>
      </div>
    </div>
  );
}