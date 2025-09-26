'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface PhotoPreviewProps {
  photoUrl: string;
  photoBlob: Blob;
  onRetake: () => void;
  onAccept: () => void;
  className?: string;
}

export function PhotoPreview({ photoUrl, onRetake, onAccept, className = '' }: PhotoPreviewProps) {
  const { t } = useTranslation();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Please review your photo before proceeding
        </p>
      </div>

      <div className="bg-black rounded-lg overflow-hidden">
        <img
          src={photoUrl}
          alt="Visitor photo preview"
          className="w-full h-auto max-h-96 object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror effect to match camera view
        />
      </div>


      {/* Action buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onRetake}
          className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          {t('photo.retakePhoto')}
        </button>

        <button
          onClick={onAccept}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {t('photo.usePhoto')}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your photo will be securely stored and used for identification purposes during your visit
        </p>
      </div>
    </div>
  );
}