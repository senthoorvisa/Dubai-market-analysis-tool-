"use client";

import { useState, useEffect } from 'react';
import apiKeyService from '../services/apiKeyService';
import { initWithApiKey } from '../services/openAiService';
import { FaKey, FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface ApiKeyInputProps {
  onApiKeySet?: (success: boolean) => void;
  showInitialMessage?: boolean;
  className?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySet,
  showInitialMessage = true,
  className = "",
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isShowingKey, setIsShowingKey] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' }>({ text: '', type: 'info' });

  useEffect(() => {
    // Check if API key is already configured
    const isKeyConfigured = apiKeyService.isApiKeyConfigured();
    setIsConfigured(isKeyConfigured);
    
    if (isKeyConfigured && showInitialMessage) {
      setMessage({ 
        text: 'API key is configured. You can use all features.', 
        type: 'success' 
      });
    } else if (showInitialMessage) {
      setMessage({ 
        text: 'Enter your OpenAI API key to unlock all features.', 
        type: 'info' 
      });
    }
  }, [showInitialMessage]);

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      setMessage({ text: 'Please enter a valid API key', type: 'error' });
      return;
    }

    try {
      const success = initWithApiKey(apiKey);
      
      if (success) {
        setIsConfigured(true);
        setMessage({ text: 'API key saved successfully', type: 'success' });
        setApiKey(''); // Clear the input field for security
        
        // Notify parent component if callback provided
        if (onApiKeySet) {
          onApiKeySet(true);
        }
      } else {
        setMessage({ text: 'Invalid API key format. Please check your API key.', type: 'error' });
        if (onApiKeySet) {
          onApiKeySet(false);
        }
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'An unknown error occurred',
        type: 'error'
      });
      if (onApiKeySet) {
        onApiKeySet(false);
      }
    }
  };

  const clearApiKey = () => {
    if (window.confirm('Are you sure you want to remove your API key? You will need to enter it again to use AI features.')) {
      apiKeyService.clearApiKey();
      setIsConfigured(false);
      setMessage({ text: 'API key has been removed', type: 'info' });
      if (onApiKeySet) {
        onApiKeySet(false);
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center mb-2">
        <FaKey className="text-gray-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">OpenAI API Key</h3>
      </div>

      {message.text && (
        <div className={`mb-3 p-2 rounded text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <FaCheck className="inline mr-1" />}
          {message.type === 'error' && <FaExclamationTriangle className="inline mr-1" />}
          {message.text}
        </div>
      )}

      {!isConfigured ? (
        <div>
          <div className="relative mb-3">
            <input
              type={isShowingKey ? "text" : "password"}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsShowingKey(!isShowingKey)}
              aria-label={isShowingKey ? "Hide API key" : "Show API key"}
            >
              {isShowingKey ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            onClick={handleApiKeySubmit}
            disabled={!apiKey.trim()}
          >
            Save API Key
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Your API key is stored locally in your browser and never sent to our servers.
            Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI</a>.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-md">
              API key configured <FaCheck className="inline ml-1 text-green-600" />
            </div>
            <button
              className="text-sm text-red-600 hover:text-red-800"
              onClick={clearApiKey}
            >
              Remove Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput; 