'use client';

import { useState, useEffect } from 'react';
import { chatGptService } from '../services/chatGptService';

const TestComponent: React.FC = () => {
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [query, setQuery] = useState<string>('Dubai Marina property market');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');
  const [chatGptResponse, setChatGptResponse] = useState<any>(null);

  // Get screen width on component mount and window resize
  useEffect(() => {
    const updateScreenWidth = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width < 768); // Tailwind's md breakpoint
    };

    // Initial check
    updateScreenWidth();
    
    // Listen for window resize
    window.addEventListener('resize', updateScreenWidth);
    
    // Clean up
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Test the ChatGPT API integration
  const testChatGptApi = async () => {
    if (!apiKey.trim()) {
      setTestResult('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing ChatGPT API...');
    
    try {
      // First validate the API key
      const isValid = await chatGptService.validateApiKey(apiKey);
      
      if (!isValid) {
        setTestResult('❌ API key validation failed. Please check your API key.');
        setIsLoading(false);
        return;
      }
      
      setTestResult('✅ API key validated successfully. Performing search...');
      
      // Perform a search
      const response = await chatGptService.performDeepSearch(query, apiKey);
      setChatGptResponse(response);
      setTestResult('✅ ChatGPT API integration working correctly!');
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Test Dashboard</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Device Information</h3>
        <div className="p-3 bg-gray-100 rounded-md">
          <p><strong>Screen Width:</strong> {screenWidth}px</p>
          <p><strong>Device Type:</strong> {isMobile ? 'Mobile' : 'Desktop'}</p>
          <p className={isMobile ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>
            {isMobile 
              ? "✓ Mobile navigation should be active" 
              : "✓ Desktop navigation should be active"}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Navigation Test</h3>
        <p className="mb-2">Click on each navigation item to verify they work correctly:</p>
        <div className="space-y-2">
          <p>1. Try clicking the Dubai Market Analysis title (should go to dashboard)</p>
          <p>2. Open and close the mobile menu (on mobile devices)</p>
          <p>3. Click each navigation option to verify they work</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">ChatGPT API Test</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="apiKey">
              OpenAI API Key
            </label>
            <input
              type="password"
              id="apiKey"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="query">
              Test Query
            </label>
            <input
              type="text"
              id="query"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <button
            onClick={testChatGptApi}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test API Integration'}
          </button>
          
          {testResult && (
            <div className={`p-3 rounded-md ${testResult.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {testResult}
            </div>
          )}
          
          {chatGptResponse && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="font-medium mb-2">API Response:</h4>
              
              <div className="mb-3">
                <h5 className="font-medium text-blue-700">Summary:</h5>
                <ul className="list-disc pl-5">
                  {chatGptResponse.summary.map((item: string, index: number) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-blue-700">Sources:</h5>
                <ul className="space-y-2">
                  {chatGptResponse.sources.map((source: any, index: number) => (
                    <li key={index} className="text-sm p-2 bg-white rounded border border-gray-200">
                      <p className="font-medium">{source.title}</p>
                      <p className="text-xs text-blue-600">{source.url}</p>
                      <p className="text-xs text-gray-600 mt-1">{source.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestComponent; 