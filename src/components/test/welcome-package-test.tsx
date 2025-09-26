'use client';

import React, { useState } from 'react';
import { useForm } from '@/contexts/form-context';
import { EmailService } from '@/services/email.service';

export function WelcomePackageTest() {
  const { state } = useForm();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [packageOptions, setPackageOptions] = useState({
    includePDF: true,
    includeStudioMap: true,
    includeWiFiInfo: true
  });

  const emailService = new EmailService();

  const testWelcomePackage = async () => {
    if (!state.firstName || !state.email || !state.hostName) {
      alert('Please complete the registration form first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await emailService.sendWelcomePackage(state as any, packageOptions);
      setTestResult(result);
    } catch (error) {
      console.error('Welcome package test failed:', error);
      setTestResult({
        success: false,
        error: `Test failed: ${error}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Welcome Package Test</h3>

      <div className="space-y-2 text-sm">
        <p className="text-gray-300">Visitor data available:</p>
        <ul className="text-gray-400 space-y-1">
          <li>👤 Visitor: {state.firstName} {state.lastName} ({state.email || 'No email'})</li>
          <li>👥 Host: {state.hostName || 'Not selected'}</li>
          <li>📄 PDF: {state.pdfBlob ? '✅ Available' : '❌ Missing'}</li>
          <li>✍️ Signature: {state.signatureBlob ? '✅ Available' : '❌ Missing'}</li>
        </ul>
      </div>

      {/* Package Options */}
      <div className="space-y-3">
        <h4 className="text-white font-medium">Package Contents:</h4>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={packageOptions.includePDF}
            onChange={(e) => setPackageOptions(prev => ({ ...prev, includePDF: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-gray-300">Include NDA PDF (if available)</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={packageOptions.includeStudioMap}
            onChange={(e) => setPackageOptions(prev => ({ ...prev, includeStudioMap: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-gray-300">Include Studio Map</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={packageOptions.includeWiFiInfo}
            onChange={(e) => setPackageOptions(prev => ({ ...prev, includeWiFiInfo: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-gray-300">Include WiFi & Access Info</span>
        </label>
      </div>

      <button
        onClick={testWelcomePackage}
        disabled={isTesting}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
          isTesting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {isTesting ? 'Sending Welcome Package...' : 'Test Welcome Package'}
      </button>

      {testResult && (
        <div className={`rounded-lg p-4 ${
          testResult.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            testResult.success ? 'text-green-400' : 'text-red-400'
          }`}>
            Welcome Package {testResult.success ? 'Sent' : 'Failed'}
          </h4>

          {testResult.messageId && (
            <p className="text-green-300 text-sm mb-2">Message ID: {testResult.messageId}</p>
          )}

          {testResult.success && (
            <div className="space-y-1 text-green-300 text-sm">
              <p>📧 Email sent to: {state.email}</p>
              <p>📎 Attachments included:</p>
              <ul className="ml-4 space-y-1">
                {packageOptions.includePDF && state.pdfBlob && (
                  <li>• NDA Document PDF</li>
                )}
                {packageOptions.includeStudioMap && (
                  <li>• SQLA Studio Map</li>
                )}
                {packageOptions.includeWiFiInfo && (
                  <li>• WiFi & Access Information</li>
                )}
              </ul>
            </div>
          )}

          {testResult.error && (
            <p className="text-red-300 text-sm">Error: {testResult.error}</p>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>📧 Welcome email includes:</p>
        <ul className="ml-4 space-y-1">
          <li>• Visitor information and visit details</li>
          <li>• Studio contact information and WiFi details</li>
          <li>• Safety guidelines and visitor badge requirements</li>
          <li>• Emergency contact information</li>
        </ul>
      </div>
    </div>
  );
}