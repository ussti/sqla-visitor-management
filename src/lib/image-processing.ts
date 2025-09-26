/**
 * Image processing utilities using Canvas API
 * Handles photo optimization, resizing, and quality adjustment
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maxFileSizeKB?: number;
}

export interface ProcessedImage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

/**
 * Process and optimize an image blob
 */
export async function processImage(
  imageBlob: Blob,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.85,
    format = 'jpeg',
    maxFileSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate dimensions maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Set canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Configure canvas for better image quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and resize image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob with quality optimization
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          let finalBlob = blob;

          // If file is still too large, reduce quality further
          if (blob.size > maxFileSizeKB * 1024) {
            finalBlob = await reduceQuality(canvas, format, maxFileSizeKB);
          }

          const url = URL.createObjectURL(finalBlob);

          resolve({
            blob: finalBlob,
            url,
            width: newWidth,
            height: newHeight,
            fileSize: finalBlob.size,
            format: finalBlob.type
          });

          // Cleanup image URL
          URL.revokeObjectURL(imageUrl);
        }, `image/${format}`, quality);

      } catch (error) {
        URL.revokeObjectURL(imageUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image'));
    };

    // Load image from blob
    const imageUrl = URL.createObjectURL(imageBlob);
    img.src = imageUrl;
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Scale down if larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > height) {
      width = maxWidth;
      height = width / aspectRatio;
    } else {
      height = maxHeight;
      width = height * aspectRatio;
    }

    // Ensure we don't exceed either dimension
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Reduce image quality to meet file size requirements
 */
async function reduceQuality(
  canvas: HTMLCanvasElement,
  format: string,
  maxFileSizeKB: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let quality = 0.7;
    const minQuality = 0.1;
    const maxAttempts = 10;
    let attempts = 0;

    const tryQuality = () => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }

        if (blob.size <= maxFileSizeKB * 1024 || quality <= minQuality || attempts >= maxAttempts) {
          resolve(blob);
        } else {
          quality *= 0.8; // Reduce quality by 20%
          attempts++;
          tryQuality();
        }
      }, `image/${format}`, quality);
    };

    tryQuality();
  });
}

/**
 * Convert image to specific format and quality
 */
export async function convertImageFormat(
  imageBlob: Blob,
  format: 'jpeg' | 'png' | 'webp',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image'));
        }
      }, `image/${format}`, quality);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(imageBlob);
  });
}

/**
 * Create a thumbnail from an image
 */
export async function createThumbnail(
  imageBlob: Blob,
  size: number = 150
): Promise<ProcessedImage> {
  return processImage(imageBlob, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8,
    format: 'jpeg'
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, or WebP' };
  }

  // Check file size (10MB max before processing)
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'Image file too large. Maximum size is 10MB' };
  }

  return { valid: true };
}

/**
 * Get image dimensions without full loading
 */
export async function getImageDimensions(imageBlob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(imageBlob);
  });
}