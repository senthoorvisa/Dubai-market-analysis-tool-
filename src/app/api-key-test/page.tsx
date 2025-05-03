'use client';

import React, { useState, useEffect } from 'react';
import { FaKey, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function ApiKeyTestPage() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState('Hello, this is a test. Please respond with "API key is working!"');
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsSaved(true);
    }
  }, []);

  const testApiKey = async () => {
    if (!apiKey) {
      setError('Please enter an API key to test');
      return;
    }

    setTestStatus('loading');
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      // Make direct API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: testMessage }],
          max_tokens: 50
        })
      });

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        setTestStatus('success');
        // Save key to localStorage
        localStorage.setItem('openai_api_key', apiKey);
        setIsSaved(true);
      } else {
        setTestStatus('error');
        setError(data.error?.message || 'Unknown error occurred');
      }
    } catch (err) {
      setTestStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const getErrorHelp = () => {
    if (!error) return null;

    if (error.includes('401') || error.includes('authentication')) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-medium text-red-800">Authentication Error</h3>
          <p className="mt-1 text-sm text-red-700">
            This suggests your API key is invalid or revoked. Please check the following:
          </p>
          <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
            <li>Verify you've copied the entire API key correctly</li>
            <li>Ensure you're using a valid API key from your OpenAI account</li>
            <li>Generate a new API key in the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI dashboard</a></li>
          </ul>
        </div>
      );
    }

    if (error.includes('insufficient_quota') || error.includes('429')) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-medium text-yellow-800">Insufficient Quota</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Your account does not have sufficient quota or you've hit rate limits. Please check the following:
          </p>
          <ul className="mt-2 text-sm text-yellow-700 list-disc pl-5">
            <li>Check your usage and billing status in the <a href="https://platform.openai.com/account/usage" target="_blank" rel="noopener noreferrer" className="underline">OpenAI dashboard</a></li>
            <li>Add a payment method or purchase additional quota if needed</li>
            <li>Try a different model (e.g., gpt-3.5-turbo instead of gpt-4)</li>
          </ul>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="font-medium text-gray-800">Error Details</h3>
        <p className="mt-1 text-sm text-gray-700">{error}</p>
      </div>
    );
  };

  const renderDebugInfo = () => {
    if (!result) return null;

    return (
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-800">Response Details</h3>
          <button 
            onClick={() => setShowRawResponse(!showRawResponse)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showRawResponse ? 'Hide Raw Response' : 'Show Raw Response'}
          </button>
        </div>

        {showRawResponse && (
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}

        {testStatus === 'success' && (
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Model:</span> {result.model}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Response:</span> {result.choices[0]?.message?.content}
            </p>
            {result.usage && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Prompt tokens: {result.usage.prompt_tokens}</p>
                <p>Completion tokens: {result.usage.completion_tokens}</p>
                <p>Total tokens: {result.usage.total_tokens}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">API Key Tester</h1>
        <p className="text-gray-600">Test your OpenAI API key to ensure it's working correctly</p>
        <div className="mt-2">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <FaKey className="text-gray-500 mr-2" />
            <label htmlFor="apiKey" className="block font-medium text-gray-700">API Key</label>
          </div>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key (sk-..., sk-or-v1-..., or sk-proj-...)"
            className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
          />
          {isSaved && (
            <p className="text-xs text-green-600 mt-1">
              ✓ This API key is saved in localStorage and will be used by the application
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="model" className="block font-medium text-gray-700 mb-2">Model</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4">gpt-4</option>
          </select>
        </div>

        <div className="mb-6">
          <button
            onClick={testApiKey}
            disabled={testStatus === 'loading'}
            className={`w-full py-2 px-4 rounded-md text-white font-medium flex justify-center items-center
              ${testStatus === 'loading' 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {testStatus === 'loading' ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Test API Key'
            )}
          </button>
        </div>

        {testStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
            <FaCheckCircle className="text-green-500 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-green-800">API Key Working Successfully!</h3>
              <p className="mt-1 text-sm text-green-700">
                Your API key has been verified and is working correctly.
              </p>
            </div>
          </div>
        )}

        {testStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">API Key Error</h3>
              <p className="mt-1 text-sm text-red-700">
                There was a problem with your API key.
              </p>
            </div>
          </div>
        )}

        {testStatus !== 'idle' && getErrorHelp()}
        {testStatus !== 'idle' && renderDebugInfo()}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">Useful Links</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Manage API Keys on OpenAI
              </a>
            </li>
            <li>
              <a href="https://platform.openai.com/account/usage" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Check API Usage &amp; Billing
              </a>
            </li>
            <li>
              <a href="https://status.openai.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                OpenAI Service Status
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 