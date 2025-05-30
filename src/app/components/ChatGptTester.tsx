"use client";

import React, { useState } from 'react';
import backendApiService from '../services/backendApiService';

const ChatGptTester = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await backendApiService.generateMarketInsights({
        query: query.trim(),
        type: 'general_inquiry'
      });

      if (result.success && result.data) {
        const data = result.data as any;
        setResponse(data.insights || data.message || 'No response available');
      } else {
        setError(result.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">AI Chat Tester</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question about Dubai real estate:
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="e.g., What are the current rental trends in Dubai Marina?"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Ask AI'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {response && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">AI Response:</h3>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: response }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatGptTester; 