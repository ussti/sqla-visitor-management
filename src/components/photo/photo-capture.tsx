'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from './camera-capture';
import { PhotoPreview } from './photo-preview';
import { processImage } from '@/lib/image-processing';

interface PhotoCaptureProps {
  onPhotoComplete: (photoBlob: Blob, photoUrl: string) => void;
  onError: (error: string) => void;
  className?: string;
}

type CaptureStep = 'capture' | 'preview';

export function PhotoCapture({ onPhotoComplete, onError, className = '' }: PhotoCaptureProps) {
  const [currentStep, setCurrentStep] = useState<CaptureStep>('capture');
  const [capturedPhoto, setCapturedPhoto] = useState<{
    blob: Blob;
    url: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);


  const handlePhotoCapture = async (photoBlob: Blob, photoUrl: string) => {
    setIsProcessing(true);

    try {
      // Process and optimize the image
      const processedImage = await processImage(photoBlob, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.85,
        format: 'jpeg',
        maxFileSizeKB: 500
      });

      // Clean up original URL
      URL.revokeObjectURL(photoUrl);

      // Set processed photo
      setCapturedPhoto({
        blob: processedImage.blob,
        url: processedImage.url
      });

      setCurrentStep('preview');
    } catch (error) {
      console.error('Photo processing error:', error);
      onError('Failed to process photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoAccept = () => {
    if (capturedPhoto) {
      onPhotoComplete(capturedPhoto.blob, capturedPhoto.url);
    }
  };

  const handleRetake = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto.url);
      setCapturedPhoto(null);
    }
    setCurrentStep('capture');
  };

  const handleCameraError = (error: string) => {
    onError(error);
  };

  // Cleanup URLs on unmount
  React.useEffect(() => {
    return () => {
      if (capturedPhoto) {
        URL.revokeObjectURL(capturedPhoto.url);
      }
    };
  }, [capturedPhoto]);

  if (isProcessing) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-white mb-4">Processing Photo</h3>
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Camera Capture */}
      {currentStep === 'capture' && (
        <div className="space-y-4">
          <CameraCapture
            onPhotoCapture={handlePhotoCapture}
            onError={handleCameraError}
          />

          {/* Photo capture notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Your photo will be captured for security identification purposes during your visit.
            </p>
          </div>
        </div>
      )}

      {/* Photo Preview */}
      {currentStep === 'preview' && capturedPhoto && (
        <PhotoPreview
          photoUrl={capturedPhoto.url}
          photoBlob={capturedPhoto.blob}
          onRetake={handleRetake}
          onAccept={handlePhotoAccept}
        />
      )}
    </div>
  );
}