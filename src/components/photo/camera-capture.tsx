'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface CameraCaptureProps {
  onPhotoCapture: (photoBlob: Blob, photoUrl: string) => void;
  onError: (error: string) => void;
  className?: string;
}

export function CameraCapture({ onPhotoCapture, onError, className = '' }: CameraCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setIsStreamActive(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Stop any existing stream first
    stopCamera();

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera for visitor photos
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Handle the play promise properly
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn('Video play interrupted:', playError);
          // Try again after a short delay
          setTimeout(async () => {
            if (videoRef.current) {
              try {
                await videoRef.current.play();
              } catch (retryError) {
                console.error('Video play retry failed:', retryError);
              }
            }
          }, 100);
        }

        setIsStreamActive(true);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setHasPermission(false);

      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            onError(t('errors.camera'));
            break;
          case 'NotFoundError':
            onError('No camera found on this device');
            break;
          case 'NotSupportedError':
            onError('Camera is not supported in this browser');
            break;
          default:
            onError('Failed to access camera');
        }
      } else {
        onError('Unknown camera error occurred');
      }
    }
  }, [onError, t, stopCamera]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) {
      onError('Camera not ready');
      return;
    }

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        onError('Canvas context not available');
        return;
      }

      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const photoUrl = URL.createObjectURL(blob);
          onPhotoCapture(blob, photoUrl);
          stopCamera(); // Stop camera after successful capture
        } else {
          onError('Failed to capture photo');
        }
        setIsCapturing(false);
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Photo capture error:', error);
      onError('Failed to capture photo');
      setIsCapturing(false);
    }
  }, [isStreamActive, onPhotoCapture, onError, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Check for camera support and auto-start camera
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      onError('Camera is not supported in this browser');
    } else {
      // Auto-start camera when component mounts
      startCamera();
    }
  }, [onError, startCamera]);

  if (hasPermission === false) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-white/10 border-2 border-white rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-2">Camera Access Required</h3>
          <p className="text-gray-300 text-sm mb-4">
            Please enable camera permissions to capture your photo
          </p>
          <button
            onClick={startCamera}
            className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-auto max-h-96 object-cover"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie
        />

        {!isStreamActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <p className="text-white mb-4">Camera is loading...</p>
            </div>
          </div>
        )}

        {/* Camera controls overlay */}
        {isStreamActive && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className={`w-16 h-16 rounded-full border-4 border-white transition-colors ${
                isCapturing
                  ? 'bg-white/50 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 active:scale-95'
              }`}
            >
              {isCapturing ? (
                <div className="w-6 h-6 bg-gray-600 rounded mx-auto"></div>
              ) : (
                <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto"></div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {!isStreamActive && hasPermission === null && (
        <div className="text-center">
          <button
            onClick={startCamera}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            {t('photo.takePhoto')}
          </button>
        </div>
      )}
    </div>
  );
}