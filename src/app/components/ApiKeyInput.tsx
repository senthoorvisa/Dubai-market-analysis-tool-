"use client";

import { useState, useEffect } from 'react';
import apiKeyService from '../services/apiKeyService';
import { FaKey, FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface ApiKeyInputProps {
  onApiKeySet: (success: boolean) => void;
  className?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, className = '' }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [orgId, setOrgId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Check if API key is already configured
    const hasKey = apiKeyService.isApiKeyConfigured();
    setIsConfigured(hasKey);
    
    // Pre-fill the input if there's a stored key
    const storedKey = apiKeyService.getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
    
    // Pre-fill org ID if available
    const storedOrgId = apiKeyService.getStoredOrgId();
    if (storedOrgId) {
      setOrgId(storedOrgId);
    }
  }, []);

  const handleSaveApiKey = () => {
    setError(null);
    setIsSaving(true);
    
    // Validate API key format
    if (!apiKey.trim() || !apiKey.startsWith('sk-')) {
      setError('Invalid API key format. OpenAI API keys start with "sk-"');
      setIsSaving(false);
      return;
    }
    
    try {
      // Save API key
      const success = apiKeyService.saveApiKey(apiKey, orgId);
      
      if (success) {
        setIsConfigured(true);
        onApiKeySet(true);
      } else {
        setError('Failed to save API key. Please try again.');
        onApiKeySet(false);
      }
    } catch (err) {
      console.error('Error saving API key:', err);
      setError('An error occurred while saving the API key.');
      onApiKeySet(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = () => {
    apiKeyService.clearApiKey();
    setApiKey('');
    setOrgId('');
    setIsConfigured(false);
    onApiKeySet(false);
  };

  return (
    <div className={`bg-white rounded-lg p-5 border border-gray-200 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">OpenAI API Configuration</h3>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-2">Production Application - Real API Key Required</h4>
        <p className="text-blue-700 text-sm mb-2">
          This is a production application that uses the OpenAI API to fetch real-time, accurate data about Dubai real estate.
        </p>
        <p className="text-blue-700 text-sm mb-2">
          You need to provide your own OpenAI API key with access to GPT-4. This key will be stored securely in your browser and used 
          only to make API calls from your device.
        </p>
        <p className="text-blue-700 text-sm">
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">
            Get your API key from OpenAI
          </a>
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="apiKey">
          OpenAI API Key <span className="text-red-500">*</span>
        </label>
        <input
          id="apiKey"
          type="password"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">Your API key is stored locally in your browser and never sent to our servers.</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="orgId">
          Organization ID <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="orgId"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="org-..."
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">Required only if you're part of multiple organizations.</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          onClick={handleSaveApiKey}
          disabled={isSaving || !apiKey.trim()}
        >
          {isSaving ? 'Saving...' : isConfigured ? 'Update API Key' : 'Save API Key'}
        </button>
        
        {isConfigured && (
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            onClick={handleClearApiKey}
          >
            Clear API Key
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiKeyInput; 