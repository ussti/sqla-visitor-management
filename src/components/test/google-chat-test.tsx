'use client';

import React, { useState } from 'react';
import { useForm } from '@/contexts/form-context';
import { GoogleChatService } from '@/services/google-chat.service';
import type { VisitorNotificationData } from '@/services/google-chat.service';

export function GoogleChatTest() {
  const { state } = useForm();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    simple?: any;
    arrival?: any;
    completed?: any;
    custom?: any;
  }>({});

  const chatService = new GoogleChatService();

  const testSimpleMessage = async () => {
    setIsTesting(true);
    try {
      const result = await chatService.sendMessage(
        chatService.createSimpleTextMessage('🧪 Test message from SQLA Visitor Management System')
      );
      setTestResults(prev => ({ ...prev, simple: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, simple: { success: false, error: `${error}` } }));
    }
    setIsTesting(false);
  };

  const testVisitorArrival = async () => {
    if (!state.firstName || !state.hostName) {
      alert('Please complete the registration form first');
      return;
    }

    setIsTesting(true);
    try {
      const data: VisitorNotificationData = {
        visitorName: `${state.firstName} ${state.lastName}`,
        visitorEmail: state.email || 'visitor@example.com',
        visitorCompany: state.companyName,
        hostName: state.hostName,
        hostEmail: state.hostEmail || 'host@example.com',
        arrivalTime: new Date().toLocaleString(),
        mondayRecordUrl: 'https://sqla-studio.monday.com/boards/123456/pulses/789'
      };

      const result = await chatService.notifyVisitorArrival(data);
      setTestResults(prev => ({ ...prev, arrival: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, arrival: { success: false, error: `${error}` } }));
    }
    setIsTesting(false);
  };

  const testVisitorCompleted = async () => {
    if (!state.firstName || !state.hostName) {
      alert('Please complete the registration form first');
      return;
    }

    setIsTesting(true);
    try {
      const data: VisitorNotificationData = {
        visitorName: `${state.firstName} ${state.lastName}`,
        visitorEmail: state.email || 'visitor@example.com',
        visitorCompany: state.companyName,
        hostName: state.hostName,
        hostEmail: state.hostEmail || 'host@example.com',
        arrivalTime: new Date().toLocaleString(),
        mondayRecordUrl: 'https://sqla-studio.monday.com/boards/123456/pulses/789'
      };

      const result = await chatService.notifyVisitorCompleted(data);
      setTestResults(prev => ({ ...prev, completed: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, completed: { success: false, error: `${error}` } }));
    }
    setIsTesting(false);
  };

  const testCustomMessage = async () => {
    setIsTesting(true);
    try {
      const result = await chatService.sendCustomMessage(
        '🎯 Custom Notification',
        'This is a custom formatted message with action button for testing purposes.',
        'https://sqla-studio.monday.com',
        'View Dashboard'
      );
      setTestResults(prev => ({ ...prev, custom: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, custom: { success: false, error: `${error}` } }));
    }
    setIsTesting(false);
  };

  const testFullWorkflow = async () => {
    if (!state.firstName || !state.hostName) {
      alert('Please complete the registration form first');
      return;
    }

    setIsTesting(true);
    try {
      const result = await chatService.notifyTeamOfVisitor(
        state as any,
        'https://sqla-studio.monday.com/boards/123456/pulses/789'
      );
      setTestResults(prev => ({ ...prev, workflow: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, workflow: { success: false, error: `${error}` } }));
    }
    setIsTesting(false);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Google Chat Integration Test</h3>

      <div className="space-y-2 text-sm">
        <p className="text-gray-300">Available visitor data:</p>
        <ul className="text-gray-400 space-y-1">
          <li>👤 Visitor: {state.firstName} {state.lastName} ({state.email || 'No email'})</li>
          <li>🏢 Company: {state.companyName || 'Not specified'}</li>
          <li>👥 Host: {state.hostName || 'Not selected'} ({state.hostEmail || 'No email'})</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={testSimpleMessage}
          disabled={isTesting}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTesting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Simple Message
        </button>

        <button
          onClick={testVisitorArrival}
          disabled={isTesting}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTesting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Visitor Arrival
        </button>

        <button
          onClick={testVisitorCompleted}
          disabled={isTesting}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTesting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          Visitor Completed
        </button>

        <button
          onClick={testCustomMessage}
          disabled={isTesting}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTesting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          Custom Message
        </button>
      </div>

      <button
        onClick={testFullWorkflow}
        disabled={isTesting}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
          isTesting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {isTesting ? 'Testing...' : 'Test Full Workflow'}
      </button>

      {/* Test Results */}
      <div className="space-y-3">
        {Object.entries(testResults).map(([testType, result]) => (
          <div key={testType} className={`rounded-lg p-3 ${
            result.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'
          }`}>
            <h4 className={`font-semibold text-sm ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {testType.charAt(0).toUpperCase() + testType.slice(1)} Test {result.success ? 'Success' : 'Failed'}
            </h4>
            {result.messageId && (
              <p className="text-green-300 text-xs">Message ID: {result.messageId}</p>
            )}
            {result.error && (
              <p className="text-red-300 text-xs">Error: {result.error}</p>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>💬 Google Chat features:</p>
        <ul className="ml-4 space-y-1">
          <li>• Rich card-based messages with visitor information</li>
          <li>• Direct links to Monday.com records</li>
          <li>• Interactive buttons for quick actions</li>
          <li>• Real-time notifications to team channels</li>
          <li>• Mock mode for development/testing</li>
        </ul>
      </div>
    </div>
  );
}