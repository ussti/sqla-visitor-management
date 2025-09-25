'use client';

import { useState } from 'react';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, status: 'pass' | 'fail', details?: string) => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date() }]);
  };

  const testFormPersistence = () => {
    // Test localStorage persistence
    const testData = { firstName: 'Test', lastName: 'User', email: 'test@example.com' };

    try {
      localStorage.setItem('visitor-registration-form', JSON.stringify(testData));
      const retrieved = localStorage.getItem('visitor-registration-form');
      const parsed = retrieved ? JSON.parse(retrieved) : null;

      if (parsed && parsed.firstName === 'Test') {
        addResult('Form Persistence', 'pass', 'localStorage working correctly');
      } else {
        addResult('Form Persistence', 'fail', 'Data not retrieved correctly');
      }
    } catch (error) {
      addResult('Form Persistence', 'fail', `Error: ${error}`);
    }
  };

  const testMondayService = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();

      if (data.success) {
        addResult('Monday.com Service', 'pass', `Connection: ${data.connection.success}, Staff: ${data.staff.length} members`);
      } else {
        addResult('Monday.com Service', 'fail', data.error);
      }
    } catch (error) {
      addResult('Monday.com Service', 'fail', `Network error: ${error}`);
    }
  };

  const testReturningVisitor = async () => {
    try {
      // Add sample visitor first
      await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addSampleVisitor' })
      });

      // Test finding visitor by email
      const response = await fetch('/api/test');
      const data = await response.json();

      const hasVisitors = data.mockData?.visitors?.length > 0;
      if (hasVisitors) {
        addResult('Returning Visitor Logic', 'pass', `Found ${data.mockData.visitors.length} visitors in mock data`);
      } else {
        addResult('Returning Visitor Logic', 'fail', 'No visitors found in mock data');
      }
    } catch (error) {
      addResult('Returning Visitor Logic', 'fail', `Error: ${error}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    testFormPersistence();
    await testMondayService();
    await testReturningVisitor();
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🧪 Integration Test Suite</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={testFormPersistence}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Test Form Persistence
            </button>
            <button
              onClick={testMondayService}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Test Monday.com Service
            </button>
            <button
              onClick={testReturningVisitor}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Test Returning Visitor
            </button>
            <button
              onClick={runAllTests}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg transition-colors font-bold"
            >
              Run All Tests
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>

            {testResults.length === 0 ? (
              <p className="text-gray-400">No tests run yet. Click a test button above.</p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      result.status === 'pass'
                        ? 'bg-green-900/20 border-green-500'
                        : 'bg-red-900/20 border-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {result.status === 'pass' ? '✅' : '❌'} {result.test}
                        </h3>
                        {result.details && (
                          <p className="text-sm text-gray-300 mt-1">{result.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <a href="/" className="bg-gray-800 hover:bg-gray-700 text-center py-3 px-4 rounded-lg transition-colors block">
                🏠 Home
              </a>
              <a href="/registration/personal" className="bg-gray-800 hover:bg-gray-700 text-center py-3 px-4 rounded-lg transition-colors block">
                📝 Start Registration
              </a>
              <a href="/api/test" target="_blank" className="bg-gray-800 hover:bg-gray-700 text-center py-3 px-4 rounded-lg transition-colors block">
                🔧 API Test Endpoint
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}