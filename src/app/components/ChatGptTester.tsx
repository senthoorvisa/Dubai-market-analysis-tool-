"use client";

import React, { useState } from 'react';
import { chatGptService } from '../services/chatGptService';

export const ChatGptTester: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !prompt.trim()) return;

    setIsLoading(true);
    try {
      // This is a mock API call - in a real app you would call the ChatGPT API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a mock response
      setResponse(`Here is a simulated response to your query about &quot;${prompt}&quot;. 
      In a real application, this would call the OpenAI API with your key.
      
      The Dubai real estate market has shown significant growth in recent years,
      with particular interest in areas like Dubai Marina, Downtown Dubai, and
      Palm Jumeirah. Investment opportunities continue to emerge in both the
      residential and commercial sectors.`);
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponse('An error occurred while fetching the response.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">AI Query Tester</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="apiKey">
            ChatGPT API Key
          </label>
          <input
            id="apiKey"
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs mt-1 text-gray-500">
            Your API key is required to make requests to the ChatGPT API.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="prompt">
            Prompt
          </label>
          <textarea
            id="prompt"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            placeholder="Enter your question about Dubai real estate market"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={isLoading || !apiKey.trim() || !prompt.trim()}
        >
          {isLoading ? 'Processing...' : 'Submit Query'}
        </button>
      </form>
      
      {response && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium mb-2 text-gray-800">Response:</h3>
          <div className="whitespace-pre-line text-gray-700">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatGptTester; 