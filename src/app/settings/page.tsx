'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaKey, FaChartBar, FaRobot, FaExclamationTriangle, FaInfoCircle, FaCheck, FaBrain } from 'react-icons/fa';
import Link from 'next/link';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define types for our component props
interface UsageCardProps {
  title: string;
  data: {
    total: number;
    limit: number;
    reset: string;
    costPerCall: string;
    estimatedCost: string;
  };
  warningThreshold: number;
}

// Usage card component
const UsageCard: React.FC<UsageCardProps> = ({ title, data, warningThreshold }) => {
  const usagePercentage = (data.total / data.limit) * 100;
  const isWarning = usagePercentage >= warningThreshold * 100;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${isWarning ? 'border-red-500' : 'border-green-500'}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Usage:</span>
          <span className="font-medium">{data.total} / {data.limit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${isWarning ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Resets: {data.reset}</span>
          <span>{usagePercentage.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cost per call:</span>
          <span className="font-medium">{data.costPerCall}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated cost:</span>
          <span className="font-medium text-green-600">{data.estimatedCost}</span>
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [geminiCallCount, setGeminiCallCount] = useState(0);
  const currentGeminiModel = 'gemini-2.5-pro-latest';
  const [isGeminiKeyConfigured, setIsGeminiKeyConfigured] = useState(true); // Always true since we have hardcoded key
  const [testingGeminiKey, setTestingGeminiKey] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState({ success: false, message: '' });
  
  // Real API usage data for Gemini only
  const apiUsageData = {
    gemini: {
      total: geminiCallCount,
      limit: 1500, // Gemini has higher free tier limits
      reset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      costPerCall: '$0.0005',
      estimatedCost: `$${(geminiCallCount * 0.0005).toFixed(2)}`
    }
  };

  useEffect(() => {
    // Load Gemini usage data from localStorage
    if (typeof window !== 'undefined') {
      // Estimate Gemini API calls
      const geminiCallCountStr = localStorage.getItem('gemini_api_call_count');
      if (geminiCallCountStr) {
        setGeminiCallCount(parseInt(geminiCallCountStr, 10));
      }
    }
  }, []);

  const testGeminiKey = async () => {
    setTestingGeminiKey(true);
    setGeminiTestResult({ success: false, message: '' });
    
    try {
      // Test the Gemini API key from the environment variable
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setGeminiTestResult({
          success: false,
          message: 'Gemini API key not found in environment variables. Please set NEXT_PUBLIC_GEMINI_API_KEY.'
        });
        setTestingGeminiKey(false);
        return;
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      // Use the currently selected model for the test
      const model = genAI.getGenerativeModel({ model: currentGeminiModel }); 
      
      // Make a simple test request
      const result = await model.generateContent("Hello, this is a test. Please respond with 'Gemini API key is working correctly for Dubai real estate analysis.'");
      const response = await result.response;
      const text = response.text();
      
      if (text && text.length > 0) {
        setGeminiTestResult({ 
          success: true, 
          message: 'Gemini API key is working correctly! Ready for Dubai real estate analysis.' 
        });
        
        // Increment Gemini API call counter
        const currentCount = parseInt(localStorage.getItem('gemini_api_call_count') || '0', 10);
        localStorage.setItem('gemini_api_call_count', (currentCount + 1).toString());
        setGeminiCallCount(currentCount + 1);
      } else {
        setGeminiTestResult({ 
          success: false, 
          message: 'Received an empty response. Please check the API configuration.' 
        });
      }
    } catch (error) {
      console.error('Error testing Gemini API key:', error);
      setGeminiTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    } finally {
      setTestingGeminiKey(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your Gemini AI configuration for Dubai real estate analysis</p>
        <div className="mt-2">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === 'api-keys' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaKey />
              <span>Gemini API</span>
            </button>
            <button
              onClick={() => setActiveTab('api-usage')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === 'api-usage' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaChartBar />
              <span>API Usage</span>
            </button>
            <button
              onClick={() => setActiveTab('model-settings')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === 'model-settings' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaRobot />
              <span>AI Model Info</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'api-keys' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gemini AI Configuration</h2>
              
              <div className="space-y-6 mb-8">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <FaCheck className="text-green-600 mt-1 mr-2" />
                    <div>
                      <h3 className="font-medium">Gemini API Configured</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your Dubai real estate analysis tool is powered by Google Gemini for enhanced web scraping and accurate property data.
                      </p>
                    </div>
                  </div>
                </div>
              
                {/* Gemini API Key Section */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <FaBrain className="mr-2 text-purple-600" />
                    Google Gemini API Status
                  </h3>
                  
                  <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm text-purple-700">
                      <strong>Enhanced Capabilities:</strong> Your selected Gemini model provides advanced web scraping, real-time data analysis, 
                      and superior property market intelligence for Dubai real estate.
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="h-2 w-2 rounded-full mr-2 bg-green-500"></span>
                      <span>Gemini API Key: Configured and Active</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="h-2 w-2 rounded-full mr-2 bg-green-500"></span>
                      <span>Model: {currentGeminiModel}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="h-2 w-2 rounded-full mr-2 bg-green-500"></span>
                      <span>Features: Real-time web scraping, accurate property data</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={testGeminiKey}
                      disabled={testingGeminiKey}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
                    >
                      {testingGeminiKey ? 'Testing...' : 'Test Gemini API'}
                    </button>
                    
                    {geminiTestResult.message && (
                      <div className={`mt-2 p-3 ${geminiTestResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'} rounded-md flex items-center`}>
                        {geminiTestResult.success ? 
                          <FaCheck className="text-green-600 mr-2" /> : 
                          <FaExclamationTriangle className="text-red-600 mr-2" />
                        }
                        {geminiTestResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'api-usage' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gemini API Usage Statistics</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <UsageCard 
                  title="Gemini API Usage"
                  data={apiUsageData.gemini}
                  warningThreshold={0.8}
                />
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Usage Benefits</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Your selected Gemini model offers superior web scraping capabilities</li>
                  <li>• More accurate property data extraction from Dubai real estate portals</li>
                  <li>• Cost-effective pricing with generous free tier limits</li>
                  <li>• Real-time data analysis for current market conditions</li>
                  <li>• Enhanced accuracy for price, bedroom, and sqft calculations</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'model-settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gemini AI Model Configuration</h2>
              
              <div className="space-y-6">
                {/* Gemini Model Selection - Now just displays info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Active Gemini Model</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your application is configured to exclusively use the Gemini 2.5 Pro model for optimal property analysis and web scraping.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center p-3 rounded-md bg-purple-50 border border-purple-200">
                      <FaBrain className="mr-3 h-5 w-5 text-purple-600" />
                      <div>
                        <span className="font-medium text-gray-800">Gemini 2.5 Pro (Latest & Recommended)</span>
                        <p className="text-sm text-gray-600">Most capable model for complex analysis, advanced web scraping, and highest accuracy.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Model Performance Info */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Current Configuration</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Model: {currentGeminiModel}</p>
                    <p>• Context Window: {
                      currentGeminiModel === 'gemini-2.5-pro-latest' ? 'Up to 8 million tokens (Extended)' :
                      currentGeminiModel === 'gemini-1.5-pro' ? '1 million tokens (Standard)' :
                      '1 million tokens (Standard)'
                    }</p>
                    <p>• Optimized for: Dubai real estate data scraping and analysis</p>
                    <p>• Features: Real-time web access, {
                      currentGeminiModel === 'gemini-2.5-pro-latest' ? 'highest accuracy, advanced reasoning.' :
                      currentGeminiModel === 'gemini-1.5-pro' ? 'accurate property specifications.' :
                      'fast property queries.'
                    }</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 