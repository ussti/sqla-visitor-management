import sharp from 'sharp';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  maxSizeKB?: number;
}

export interface OptimizedImageResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

export class ImageOptimizer {
  private static readonly DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
    maxWidth: 800,
    maxHeight: 600,
    quality: 85,
    format: 'jpeg',
    maxSizeKB: 500
  };

  /**
   * Optimizes a visitor photo for storage and transmission
   */
  static async optimizeVisitorPhoto(
    input: Buffer | Uint8Array | string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    let image = sharp(input);
    const metadata = await image.metadata();

    // Resize if needed
    if (
      (metadata.width && metadata.width > opts.maxWidth) ||
      (metadata.height && metadata.height > opts.maxHeight)
    ) {
      image = image.resize({
        width: opts.maxWidth,
        height: opts.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert and compress
    let result: Buffer;
    let format = opts.format;

    switch (opts.format) {
      case 'webp':
        result = await image
          .webp({ quality: opts.quality, effort: 4 })
          .toBuffer();
        break;

      case 'avif':
        result = await image
          .avif({ quality: opts.quality, effort: 4 })
          .toBuffer();
        break;

      case 'png':
        result = await image
          .png({
            compressionLevel: 8,
            quality: opts.quality,
            effort: 8
          })
          .toBuffer();
        break;

      case 'jpeg':
      default:
        result = await image
          .jpeg({ quality: opts.quality, progressive: true })
          .toBuffer();
        format = 'jpeg';
        break;
    }

    // Get final metadata
    const optimized = sharp(result);
    const finalMetadata = await optimized.metadata();

    // If still too large, reduce quality further
    if (result.length > opts.maxSizeKB * 1024) {
      const reducedQuality = Math.max(60, opts.quality - 15);

      switch (format) {
        case 'webp':
          result = await optimized
            .webp({ quality: reducedQuality, effort: 6 })
            .toBuffer();
          break;

        case 'avif':
          result = await optimized
            .avif({ quality: reducedQuality, effort: 6 })
            .toBuffer();
          break;

        case 'png':
          result = await optimized
            .png({
              compressionLevel: 9,
              quality: reducedQuality,
              effort: 10
            })
            .toBuffer();
          break;

        case 'jpeg':
        default:
          result = await optimized
            .jpeg({ quality: reducedQuality, progressive: true })
            .toBuffer();
          break;
      }
    }

    return {
      buffer: result,
      format,
      width: finalMetadata.width || opts.maxWidth,
      height: finalMetadata.height || opts.maxHeight,
      size: result.length
    };
  }

  /**
   * Creates multiple formats/sizes for responsive images
   */
  static async createResponsiveImages(
    input: Buffer | Uint8Array | string,
    sizes: Array<{ width: number; height?: number; quality?: number }> = [
      { width: 400, quality: 80 },
      { width: 800, quality: 85 },
      { width: 1200, quality: 90 }
    ]
  ): Promise<Map<string, OptimizedImageResult>> {
    const results = new Map<string, OptimizedImageResult>();

    for (const size of sizes) {
      const optimized = await this.optimizeVisitorPhoto(input, {
        maxWidth: size.width,
        maxHeight: size.height,
        quality: size.quality || 85
      });

      results.set(`${size.width}w`, optimized);
    }

    return results;
  }

  /**
   * Converts image to data URL for preview
   */
  static async toDataUrl(
    buffer: Buffer,
    format: string = 'jpeg'
  ): Promise<string> {
    const mimeType = `image/${format}`;
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Creates a thumbnail version
   */
  static async createThumbnail(
    input: Buffer | Uint8Array | string,
    size: number = 150
  ): Promise<OptimizedImageResult> {
    return this.optimizeVisitorPhoto(input, {
      maxWidth: size,
      maxHeight: size,
      quality: 75,
      format: 'jpeg'
    });
  }

  /**
   * Validates image format and size
   */
  static async validateImage(
    input: Buffer | Uint8Array | string
  ): Promise<{
    valid: boolean;
    metadata?: sharp.Metadata;
    error?: string;
  }> {
    try {
      const image = sharp(input);
      const metadata = await image.metadata();

      // Check if it's a valid image format
      const validFormats = ['jpeg', 'png', 'webp', 'tiff', 'gif'];
      if (!metadata.format || !validFormats.includes(metadata.format)) {
        return {
          valid: false,
          error: `Unsupported format: ${metadata.format}`
        };
      }

      // Check reasonable size limits (max 20MP)
      const pixels = (metadata.width || 0) * (metadata.height || 0);
      if (pixels > 20 * 1024 * 1024) {
        return {
          valid: false,
          error: 'Image too large (max 20MP)'
        };
      }

      return {
        valid: true,
        metadata
      };

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid image'
      };
    }
  }
}

export default ImageOptimizer;