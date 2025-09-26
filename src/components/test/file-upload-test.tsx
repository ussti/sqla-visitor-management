'use client';

import React, { useState } from 'react';
import { useForm } from '@/contexts/form-context';
import { MondayService } from '@/services/monday.service';
import { FileUploadService } from '@/services/file-upload.service';
import type { FileUploadResult } from '@/services/file-upload.service';

export function FileUploadTest() {
  const { state } = useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);

  const testFileUpload = async () => {
    if (!state.firstName || !state.lastName || !state.email) {
      alert('Please complete the registration form first');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const mondayService = new MondayService();
      const fileUploadService = new FileUploadService(mondayService);

      const result = await fileUploadService.uploadVisitorFiles(state as any);
      setUploadResult(result);

      // If upload successful, update visitor record with file URLs
      if (result.success && result.itemId) {
        const fileUrls: any = {};

        if (result.uploadedFiles.photo?.url) {
          fileUrls.photoUrl = result.uploadedFiles.photo.url;
        }

        if (result.uploadedFiles.pdf?.url) {
          fileUrls.pdfUrl = result.uploadedFiles.pdf.url;
        }

        if (result.uploadedFiles.signature?.url) {
          fileUrls.signatureUrl = result.uploadedFiles.signature.url;
        }

        await fileUploadService.updateVisitorWithFileUrls(result.itemId, fileUrls);
      }

    } catch (error) {
      console.error('File upload test failed:', error);
      setUploadResult({
        success: false,
        uploadedFiles: {},
        errors: [`Test failed: ${error}`]
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">File Upload Test</h3>

      <div className="space-y-2 text-sm">
        <p className="text-gray-300">Available files to upload:</p>
        <ul className="text-gray-400 space-y-1">
          <li>📷 Photo: {state.photoBlob ? '✅ Available' : '❌ Missing'}</li>
          <li>📄 PDF: {state.pdfBlob ? '✅ Available' : '❌ Missing'}</li>
          <li>✍️ Signature: {state.signatureBlob ? '✅ Available' : '❌ Missing'}</li>
        </ul>
      </div>

      <button
        onClick={testFileUpload}
        disabled={isUploading}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
          isUploading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Test File Upload'}
      </button>

      {uploadResult && (
        <div className={`rounded-lg p-4 ${
          uploadResult.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            uploadResult.success ? 'text-green-400' : 'text-red-400'
          }`}>
            Upload {uploadResult.success ? 'Successful' : 'Failed'}
          </h4>

          {uploadResult.itemId && (
            <p className="text-white text-sm mb-2">
              Visitor Record ID: {uploadResult.itemId}
            </p>
          )}

          {Object.keys(uploadResult.uploadedFiles).length > 0 && (
            <div className="mb-2">
              <p className="text-white text-sm mb-1">Uploaded Files:</p>
              <ul className="text-green-300 text-xs space-y-1">
                {uploadResult.uploadedFiles.photo && (
                  <li>📷 Photo: {uploadResult.uploadedFiles.photo.name}</li>
                )}
                {uploadResult.uploadedFiles.pdf && (
                  <li>📄 PDF: {uploadResult.uploadedFiles.pdf.name}</li>
                )}
                {uploadResult.uploadedFiles.signature && (
                  <li>✍️ Signature: {uploadResult.uploadedFiles.signature.name}</li>
                )}
              </ul>
            </div>
          )}

          {uploadResult.errors.length > 0 && (
            <div>
              <p className="text-red-400 text-sm mb-1">Errors:</p>
              <ul className="text-red-300 text-xs space-y-1">
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}