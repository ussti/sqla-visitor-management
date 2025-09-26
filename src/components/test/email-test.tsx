'use client';

import React, { useState } from 'react';
import { useForm } from '@/contexts/form-context';
import { EmailService } from '@/services/email.service';
import type { HostNotificationData, WelcomeEmailData } from '@/services/email.service';

export function EmailTest() {
  const { state } = useForm();
  const [isTestingHost, setIsTestingHost] = useState(false);
  const [isTestingWelcome, setIsTestingWelcome] = useState(false);
  const [hostResult, setHostResult] = useState<any>(null);
  const [welcomeResult, setWelcomeResult] = useState<any>(null);

  const emailService = new EmailService();

  const testHostNotification = async () => {
    if (!state.firstName || !state.hostName || !state.hostEmail) {
      alert('Please complete the registration form first');
      return;
    }

    setIsTestingHost(true);
    setHostResult(null);

    try {
      const hostData: HostNotificationData = {
        hostName: state.hostName,
        hostEmail: state.hostEmail,
        visitorName: `${state.firstName} ${state.lastName}`,
        visitorEmail: state.email || 'visitor@example.com',
        visitorCompany: state.companyName,
        visitTime: new Date().toLocaleString(),
      };

      const result = await emailService.sendHostNotification(hostData);
      setHostResult(result);
    } catch (error) {
      console.error('Host notification test failed:', error);
      setHostResult({
        success: false,
        error: `Test failed: ${error}`
      });
    } finally {
      setIsTestingHost(false);
    }
  };

  const testWelcomeEmail = async () => {
    if (!state.firstName || !state.email || !state.hostName) {
      alert('Please complete the registration form first');
      return;
    }

    setIsTestingWelcome(true);
    setWelcomeResult(null);

    try {
      const welcomeData: WelcomeEmailData = {
        visitorName: `${state.firstName} ${state.lastName}`,
        visitorEmail: state.email,
        hostName: state.hostName,
        visitDate: new Date().toLocaleDateString(),
        studioInfo: {
          address: '123 Studio Drive, Los Angeles, CA 90210',
          wifiPassword: 'StudioGuest2024',
          emergencyContact: '+1 (555) 123-4567'
        }
      };

      const result = await emailService.sendWelcomeEmail(welcomeData);
      setWelcomeResult(result);
    } catch (error) {
      console.error('Welcome email test failed:', error);
      setWelcomeResult({
        success: false,
        error: `Test failed: ${error}`
      });
    } finally {
      setIsTestingWelcome(false);
    }
  };

  const testBothEmails = async () => {
    if (!state.firstName || !state.email || !state.hostName || !state.hostEmail) {
      alert('Please complete the registration form first');
      return;
    }

    setIsTestingHost(true);
    setIsTestingWelcome(true);
    setHostResult(null);
    setWelcomeResult(null);

    try {
      const result = await emailService.sendVisitorCompleteNotification(state as any);
      setHostResult(result.hostNotification);
      setWelcomeResult(result.welcomeEmail);
    } catch (error) {
      console.error('Email notification test failed:', error);
      const errorResult = {
        success: false,
        error: `Test failed: ${error}`
      };
      setHostResult(errorResult);
      setWelcomeResult(errorResult);
    } finally {
      setIsTestingHost(false);
      setIsTestingWelcome(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Email Service Test</h3>

      <div className="space-y-2 text-sm">
        <p className="text-gray-300">Available data for testing:</p>
        <ul className="text-gray-400 space-y-1">
          <li>👤 Visitor: {state.firstName} {state.lastName} ({state.email || 'No email'})</li>
          <li>🏢 Company: {state.companyName || 'Not specified'}</li>
          <li>👥 Host: {state.hostName || 'Not selected'} ({state.hostEmail || 'No email'})</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={testHostNotification}
          disabled={isTestingHost}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTestingHost
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isTestingHost ? 'Sending...' : 'Test Host Email'}
        </button>

        <button
          onClick={testWelcomeEmail}
          disabled={isTestingWelcome}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTestingWelcome
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isTestingWelcome ? 'Sending...' : 'Test Welcome Email'}
        </button>

        <button
          onClick={testBothEmails}
          disabled={isTestingHost || isTestingWelcome}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTestingHost || isTestingWelcome
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isTestingHost || isTestingWelcome ? 'Sending...' : 'Test Both Emails'}
        </button>
      </div>

      {/* Host Notification Result */}
      {hostResult && (
        <div className={`rounded-lg p-4 ${
          hostResult.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            hostResult.success ? 'text-green-400' : 'text-red-400'
          }`}>
            Host Notification {hostResult.success ? 'Sent' : 'Failed'}
          </h4>
          {hostResult.messageId && (
            <p className="text-green-300 text-sm">Message ID: {hostResult.messageId}</p>
          )}
          {hostResult.error && (
            <p className="text-red-300 text-sm">Error: {hostResult.error}</p>
          )}
        </div>
      )}

      {/* Welcome Email Result */}
      {welcomeResult && (
        <div className={`rounded-lg p-4 ${
          welcomeResult.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            welcomeResult.success ? 'text-green-400' : 'text-red-400'
          }`}>
            Welcome Email {welcomeResult.success ? 'Sent' : 'Failed'}
          </h4>
          {welcomeResult.messageId && (
            <p className="text-green-300 text-sm">Message ID: {welcomeResult.messageId}</p>
          )}
          {welcomeResult.error && (
            <p className="text-red-300 text-sm">Error: {welcomeResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}