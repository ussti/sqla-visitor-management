import { mondayService } from './monday';
import { validateImageFile, compressImage, generateFileName, dataUrlToBlob } from '@/lib/file-utils';
import type { CompleteRegistration } from '@/lib/validation';

interface VisitorFile {
  file: File;
  filename: string;
  columnId: string;
}

export interface FileUploadResult {
  success: boolean;
  uploadedFiles: {
    photo?: any;
    signature?: any;
  };
  errors: string[];
  itemId?: number;
}

export class FileUploadService {
  private mondayService = mondayService;

  async uploadVisitorFiles(
    visitorData: CompleteRegistration,
    itemId?: number
  ): Promise<FileUploadResult> {
    const result: FileUploadResult = {
      success: false,
      uploadedFiles: {},
      errors: []
    };

    try {
      // Prepare files from visitor data
      const files = this.prepareVisitorFiles(visitorData);

      // Validate and optimize files
      const { validated, errors: validationErrors } = await this.validateAndOptimizeFiles(files);

      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
      }

      // Create visitor record if itemId not provided
      let visitorItemId = itemId;
      if (!visitorItemId) {
        try {
          const visitorRecord = await this.mondayService.createVisitor({
            name: visitorData.firstName!,
            surname: visitorData.lastName!,
            email: visitorData.email!,
            organization: visitorData.companyName,
            hostId: visitorData.hostId!,
            hostName: visitorData.hostName!,
            visitDate: new Date(),
            status: 'Registered'
          });
          visitorItemId = parseInt(visitorRecord.id);
          result.itemId = visitorItemId;
        } catch (error) {
          result.errors.push(`Failed to create visitor record: ${error}`);
          return result;
        }
      }

      // Upload files to Monday.com
      const uploadPromises: Array<Promise<any>> = [];
      const fileTypes: Array<'photo' | 'signature'> = [];

      if (validated.photo) {
        uploadPromises.push(
          this.mondayService.uploadVisitorPhoto(visitorItemId!.toString(), validated.photo.file)
        );
        fileTypes.push('photo');
      }

      if (validated.signature) {
        // Store signature as file upload (using NDA upload method for now)
        uploadPromises.push(
          this.mondayService.uploadVisitorNDA(visitorItemId!.toString(), validated.signature.file)
        );
        fileTypes.push('signature');
      }

      // Execute uploads
      if (uploadPromises.length > 0) {
        try {
          const uploadResults = await Promise.allSettled(uploadPromises);

          uploadResults.forEach((uploadResult, index) => {
            const fileType = fileTypes[index];

            if (uploadResult.status === 'fulfilled') {
              result.uploadedFiles[fileType] = uploadResult.value;
            } else {
              result.errors.push(`Failed to upload ${fileType}: ${uploadResult.reason}`);
            }
          });

          // Mark as success if at least one file uploaded successfully
          const successfulUploads = uploadResults.filter(r => r.status === 'fulfilled').length;
          result.success = successfulUploads > 0;

        } catch (error) {
          result.errors.push(`File upload failed: ${error}`);
        }
      } else {
        result.errors.push('No valid files to upload');
      }

    } catch (error) {
      result.errors.push(`File upload service error: ${error}`);
    }

    return result;
  }

  async updateVisitorWithFileUrls(
    itemId: number,
    fileUrls: {
      photoUrl?: string;
      signatureUrl?: string;
    }
  ): Promise<void> {
    const columnValues: Record<string, any> = {};

    if (fileUrls.photoUrl) {
      columnValues['photo_url'] = fileUrls.photoUrl;
    }

    if (fileUrls.signatureUrl) {
      columnValues['signature_url'] = fileUrls.signatureUrl;
    }

    if (Object.keys(columnValues).length > 0) {
      await this.mondayService.updateItem(itemId.toString(), columnValues);
    }
  }

  async getFileMetadata(itemId: number): Promise<{
    photos: any[];
    signatures: any[];
  }> {
    try {
      // Get item status instead of visitor by ID
      const itemStatus = await this.mondayService.getItemStatus(itemId.toString());

      // Return mock metadata for now
      return {
        photos: [],
        signatures: []
      };
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      return { photos: [], signatures: [] };
    }
  }

  private prepareVisitorFiles(visitorData: CompleteRegistration): { photo?: VisitorFile; signature?: VisitorFile } {
    const files: { photo?: VisitorFile; signature?: VisitorFile } = {};

    // Prepare photo file
    if (visitorData.photoBlob) {
      files.photo = {
        file: new File([visitorData.photoBlob], generateFileName('photo', 'jpg'), {
          type: 'image/jpeg'
        }),
        filename: generateFileName(`${visitorData.firstName}_${visitorData.lastName}_photo`, 'jpg'),
        columnId: 'files' // Monday.com column for photos
      };
    }

    // Prepare signature file
    if (visitorData.signatureBlob) {
      files.signature = {
        file: new File([visitorData.signatureBlob], generateFileName('signature', 'png'), {
          type: 'image/png'
        }),
        filename: generateFileName(`${visitorData.firstName}_${visitorData.lastName}_signature`, 'png'),
        columnId: 'files9' // Monday.com column for signatures
      };
    }

    // If signature is data URL, convert to blob
    if (visitorData.signature && !visitorData.signatureBlob) {
      try {
        const blob = dataUrlToBlob(visitorData.signature);
        files.signature = {
          file: new File([blob], generateFileName('signature', 'png'), {
            type: 'image/png'
          }),
          filename: generateFileName(`${visitorData.firstName}_${visitorData.lastName}_signature`, 'png'),
          columnId: 'files9'
        };
      } catch (error) {
        console.error('Failed to convert signature data URL to blob:', error);
      }
    }

    return files;
  }

  private async validateAndOptimizeFiles(files: { photo?: VisitorFile; signature?: VisitorFile }): Promise<{
    validated: { photo?: VisitorFile; signature?: VisitorFile };
    errors: string[];
  }> {
    const result = {
      validated: {} as { photo?: VisitorFile; signature?: VisitorFile },
      errors: [] as string[]
    };

    // Validate and optimize photo
    if (files.photo) {
      const validation = validateImageFile(files.photo.file);
      if (validation.isValid) {
        try {
          // Compress photo for better performance
          const optimizedFile = await compressImage(files.photo.file, 800, 0.85);
          result.validated.photo = {
            ...files.photo,
            file: optimizedFile
          };
        } catch (error) {
          result.errors.push(`Failed to optimize photo: ${error}`);
        }
      } else {
        result.errors.push(`Photo validation failed: ${validation.error}`);
      }
    }

    // Validate signature (no optimization needed)
    if (files.signature) {
      const validation = validateImageFile(files.signature.file);
      if (validation.isValid) {
        result.validated.signature = files.signature;
      } else {
        result.errors.push(`Signature validation failed: ${validation.error}`);
      }
    }

    return result;
  }
}