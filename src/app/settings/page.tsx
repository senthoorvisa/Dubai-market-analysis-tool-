'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaKey, FaChartBar, FaRobot, FaExclamationTriangle, FaInfoCircle, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import { initWithApiKey } from '../services/openAiService';
import apiKeyService from '../services/apiKeyService';
import OpenAI from 'openai';

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

interface ApiKeyItemProps {
  name: string;
  placeholder: string;
  envName: string;
  isConfigured: boolean;
  value: string;
  onSave: (value: string) => void;
}

interface ModelSettingItemProps {
  name: string;
  description: string;
  currentModel: string;
  alternatives: string[];
  onModelChange: (model: string) => void;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [savedKeys, setSavedKeys] = useState({
    openAI: '',
  });
  const [keySaveSuccess, setKeySaveSuccess] = useState('');
  const [apiCallCount, setApiCallCount] = useState(0);
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini');
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [testResult, setTestResult] = useState({ success: false, message: '' });
  
  // Real OpenAI usage data
  const apiUsageData = {
    openAI: {
      total: apiCallCount,
      limit: 1000,
      reset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      costPerCall: '$0.0010',
      estimatedCost: `$${(apiCallCount * 0.001).toFixed(2)}`
    }
  };

  useEffect(() => {
    // Load API key from localStorage
    if (typeof window !== 'undefined') {
      const storedOpenAIKey = localStorage.getItem('api_key_openAI');
      if (storedOpenAIKey) {
        setSavedKeys({ openAI: storedOpenAIKey });
        setIsApiKeyConfigured(true);
        
        // Estimate API calls from localStorage counter if available
        const callCountStr = localStorage.getItem('openai_api_call_count');
        if (callCountStr) {
          setApiCallCount(parseInt(callCountStr, 10));
        }
      }
      
      // Load model preference if available
      const modelPreference = localStorage.getItem('openai_model_preference');
      if (modelPreference) {
        setCurrentModel(modelPreference);
      }
      
      // Set the new project-scoped API key automatically
      const newApiKey = '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';
      apiKeyService.secureSetApiKey(newApiKey);
      setSavedKeys({
        openAI: '●●●●●●●●●●●●●●●●●●●●' // Never display the actual key
      });
      setIsApiKeyConfigured(true);
      console.log('Updated to new project-scoped API key');
    }
  }, []);

  const saveApiKey = (keyName: string, value: string) => {
    if (keyName === 'openAI') {
      // Initialize the API with the new key using the secure service
      if (apiKeyService.secureSetApiKey(value)) {
        setSavedKeys({
          ...savedKeys,
          [keyName]: '●●●●●●●●●●●●●●●●●●●●' // Never display the actual key
        });
        setKeySaveSuccess(`${keyName} key saved successfully! Your Dubai real estate AI is now fully functional.`);
        setIsApiKeyConfigured(true);
        
        // Reset API call counter when changing key
        localStorage.setItem('openai_api_call_count', '0');
        setApiCallCount(0);
        
        // Clear success message after 5 seconds
        setTimeout(() => setKeySaveSuccess(''), 5000);
      } else {
        setKeySaveSuccess('Invalid API key format. Please check and try again.');
        setTimeout(() => setKeySaveSuccess(''), 5000);
      }
    }
  };
  
  const testApiKey = async () => {
    setTestingApiKey(true);
    setTestResult({ success: false, message: '' });
    
    try {
      // Get the API key from local storage
      const apiKey = localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        setTestResult({ 
          success: false, 
          message: 'No API key found. Please save your API key first.' 
        });
        setTestingApiKey(false);
        return;
      }
      
      // Create a temporary OpenAI client
      const tempClient = new OpenAI({ 
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      
      // Make a simple test request
      const response = await tempClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, this is a test. Please respond with 'API key is working.'" }],
        max_tokens: 10
      });
      
      if (response && response.choices && response.choices.length > 0) {
        setTestResult({ 
          success: true, 
          message: 'API key is working correctly!' 
        });
        
        // Increment API call counter
        const currentCount = parseInt(localStorage.getItem('openai_api_call_count') || '0', 10);
        localStorage.setItem('openai_api_call_count', (currentCount + 1).toString());
        setApiCallCount(currentCount + 1);
      } else {
        setTestResult({ 
          success: false, 
          message: 'Received an empty response. Please check your API key.' 
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    } finally {
      setTestingApiKey(false);
    }
  };
  
  const changeModel = (model: string) => {
    setCurrentModel(model);
    localStorage.setItem('openai_model_preference', model);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your API keys and AI models</p>
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
                activeTab === 'api-keys' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaKey />
              <span>API Keys</span>
            </button>
            <button
              onClick={() => setActiveTab('api-usage')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === 'api-usage' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaChartBar />
              <span>API Usage</span>
            </button>
            <button
              onClick={() => setActiveTab('model-settings')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === 'model-settings' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaRobot />
              <span>AI Models</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'api-keys' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">API Keys Configuration</h2>
              
              {keySaveSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
                  {keySaveSuccess}
                </div>
              )}
              
              <div className="space-y-6 mb-8">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-yellow-600 mt-1 mr-2" />
                    <div>
                      <h3 className="font-medium">API Key Security Notice</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your API key is stored locally in your browser and is never sent to our servers.
                        For production use, please implement proper server-side key management.
                      </p>
                    </div>
                  </div>
                </div>
              
                <ApiKeyItem 
                  name="OpenAI API Key"
                  placeholder="Enter your OpenAI API key"
                  envName="OPENAI_API_KEY"
                  isConfigured={isApiKeyConfigured}
                  value={savedKeys.openAI}
                  onSave={(value) => saveApiKey('openAI', value)}
                />
                
                {isApiKeyConfigured && (
                  <div className="mt-4">
                    <button
                      onClick={testApiKey}
                      disabled={testingApiKey}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {testingApiKey ? 'Testing...' : 'Test API Key'}
                    </button>
                    
                    {testResult.message && (
                      <div className={`mt-2 p-3 ${testResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'} rounded-md flex items-center`}>
                        {testResult.success ? 
                          <FaCheck className="text-green-600 mr-2" /> : 
                          <FaExclamationTriangle className="text-red-600 mr-2" />
                        }
                        {testResult.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-3">Setup Instructions</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">1. Get your API key:</span> Sign up for an OpenAI account and obtain your API key from the OpenAI dashboard.
                  </p>
                  <p>
                    <span className="font-medium">2. Enter your key:</span> Paste your API key in the field above and click "Save".
                  </p>
                  <p>
                    <span className="font-medium">3. Use the app:</span> Once your key is saved, all the AI features will use your OpenAI account.
                  </p>
                  <p className="mt-4 text-blue-600">
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                      <FaInfoCircle className="mr-1" /> Get your API key from OpenAI
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'api-usage' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">API Usage Dashboard</h2>
              
              {!isApiKeyConfigured ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-600 mt-1 mr-2" />
                    <div>
                      <h3 className="font-medium">API Key Required</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please configure your OpenAI API key first to see actual usage data.
                      </p>
                      <button 
                        onClick={() => setActiveTab('api-keys')} 
                        className="mt-2 px-3 py-1 bg-white border border-yellow-300 rounded-md text-sm text-yellow-700 hover:bg-yellow-100"
                      >
                        Configure API Key
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Usage cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <UsageCard 
                      title="OpenAI API" 
                      data={apiUsageData.openAI} 
                      warningThreshold={80} 
                    />
                  </div>

                  {/* Monthly cost breakdown */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3">Usage Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">API</th>
                            <th className="px-4 py-2 text-right">Calls</th>
                            <th className="px-4 py-2 text-right">Cost Per Call</th>
                            <th className="px-4 py-2 text-right">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-2">OpenAI API</td>
                            <td className="px-4 py-2 text-right">{apiUsageData.openAI.total}</td>
                            <td className="px-4 py-2 text-right">{apiUsageData.openAI.costPerCall}</td>
                            <td className="px-4 py-2 text-right font-medium">{apiUsageData.openAI.estimatedCost}</td>
                          </tr>
                          <tr className="bg-gray-50 font-medium">
                            <td className="px-4 py-2" colSpan={3}>Total</td>
                            <td className="px-4 py-2 text-right">
                              {apiUsageData.openAI.estimatedCost}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-neutral-800">API Usage Tracking</h3>
                    <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm mb-4">
                      <p className="text-neutral-600 mb-4">
                        This section shows your estimated API usage. For precise billing information, please check your OpenAI dashboard.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                          <div className="font-semibold text-neutral-700">Total API Calls</div>
                          <div className="text-2xl font-bold text-neutral-800 mt-1">{apiUsageData.openAI.total}</div>
                          <div className="text-sm text-neutral-500 mt-1">Current session</div>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                          <div className="font-semibold text-neutral-700">Estimated Cost</div>
                          <div className="text-2xl font-bold text-neutral-800 mt-1">
                            {apiUsageData.openAI.estimatedCost}
                          </div>
                          <div className="text-sm text-neutral-500 mt-1">Based on current usage</div>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                          <div className="font-semibold text-neutral-700">Next Reset</div>
                          <div className="text-2xl font-bold text-neutral-800 mt-1">
                            {apiUsageData.openAI.reset}
                          </div>
                          <div className="text-sm text-neutral-500 mt-1">Monthly billing cycle</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-sm text-blue-700">
                          <FaInfoCircle className="inline-block mr-1" /> 
                          For detailed usage statistics and billing information, visit your 
                          <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline ml-1">OpenAI dashboard</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'model-settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">AI Models Configuration</h2>
              
              {!isApiKeyConfigured ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-600 mt-1 mr-2" />
                    <div>
                      <h3 className="font-medium">API Key Required</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please configure your OpenAI API key first to modify AI model settings.
                      </p>
                      <button 
                        onClick={() => setActiveTab('api-keys')} 
                        className="mt-2 px-3 py-1 bg-white border border-yellow-300 rounded-md text-sm text-yellow-700 hover:bg-yellow-100"
                      >
                        Configure API Key
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <ModelSettingItem 
                    name="OpenAI Model" 
                    description="Select which OpenAI model to use for all AI analyses."
                    currentModel={currentModel}
                    alternatives={["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4o", "gpt-4"]}
                    onModelChange={changeModel}
                  />
                  
                  <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 mt-6">
                    <h3 className="text-lg font-medium mb-3 text-neutral-800">Model Performance Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Model</th>
                            <th className="px-4 py-2 text-center">Performance</th>
                            <th className="px-4 py-2 text-center">Speed</th>
                            <th className="px-4 py-2 text-right">Cost</th>
                            <th className="px-4 py-2 text-center">Suitable For</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={currentModel === 'gpt-4o-mini' ? 'bg-blue-50' : ''}>
                            <td className="px-4 py-2 font-medium">GPT-4o Mini</td>
                            <td className="px-4 py-2 text-center">Good</td>
                            <td className="px-4 py-2 text-center">Fast</td>
                            <td className="px-4 py-2 text-right">$</td>
                            <td className="px-4 py-2 text-center">General use, cost-effective</td>
                          </tr>
                          <tr className={currentModel === 'gpt-3.5-turbo' ? 'bg-blue-50' : ''}>
                            <td className="px-4 py-2 font-medium">GPT-3.5 Turbo</td>
                            <td className="px-4 py-2 text-center">Moderate</td>
                            <td className="px-4 py-2 text-center">Very Fast</td>
                            <td className="px-4 py-2 text-right">$</td>
                            <td className="px-4 py-2 text-center">Simple analyses, rapid response</td>
                          </tr>
                          <tr className={currentModel === 'gpt-4o' ? 'bg-blue-50' : ''}>
                            <td className="px-4 py-2 font-medium">GPT-4o</td>
                            <td className="px-4 py-2 text-center">Excellent</td>
                            <td className="px-4 py-2 text-center">Moderate</td>
                            <td className="px-4 py-2 text-right">$$$</td>
                            <td className="px-4 py-2 text-center">Detailed market analyses</td>
                          </tr>
                          <tr className={currentModel === 'gpt-4' ? 'bg-blue-50' : ''}>
                            <td className="px-4 py-2 font-medium">GPT-4</td>
                            <td className="px-4 py-2 text-center">Very Good</td>
                            <td className="px-4 py-2 text-center">Slow</td>
                            <td className="px-4 py-2 text-right">$$$$</td>
                            <td className="px-4 py-2 text-center">Complex property evaluations</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-neutral-500 mt-3">
                      * Costs vary based on OpenAI's pricing. More capable models generally cost more per API call.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-neutral-200 shadow-sm mt-6">
                    <h3 className="text-lg font-medium mb-3">Model Recommendation</h3>
                    <p className="text-neutral-600 text-sm">
                      <strong>GPT-4o Mini</strong> offers the best balance of performance and cost for Dubai real estate analysis.
                      For in-depth investment analyses or detailed market forecasts, consider using <strong>GPT-4o</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsageCard({ title, data, warningThreshold }: UsageCardProps) {
  const usagePercentage = (data.total / data.limit) * 100;
  const isWarning = usagePercentage >= warningThreshold;
  
  return (
    <div className={`bg-white rounded-lg border ${isWarning ? 'border-yellow-300' : 'border-gray-200'} overflow-hidden shadow-sm`}>
      <div className="p-4">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <div className="flex justify-between items-baseline mt-2">
          <div className="text-2xl font-bold text-gray-900">{data.total}</div>
          <div className="text-sm text-gray-500">of {data.limit}</div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div 
            className={`h-2.5 rounded-full ${isWarning ? 'bg-yellow-500' : 'bg-blue-600'}`} 
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="text-gray-500">Reset: {data.reset}</div>
          <div className="font-medium text-gray-800">{data.estimatedCost}</div>
        </div>
      </div>
    </div>
  );
}

function ApiKeyItem({ name, placeholder, envName, isConfigured, value, onSave }: ApiKeyItemProps) {
  const [isEditing, setIsEditing] = useState(!isConfigured);
  const [inputValue, setInputValue] = useState(value);
  const [isShowingKey, setIsShowingKey] = useState(false);
  
  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between mb-2">
        <h3 className="font-medium text-gray-800">{name}</h3>
        <div className="flex items-center">
          {isConfigured && (
            <span className="mr-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Configured
            </span>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'Cancel' : (isConfigured ? 'Change' : 'Configure')}
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="mt-3">
          <div className="relative">
            <input
              type={isShowingKey ? "text" : "password"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
              onClick={() => setIsShowingKey(!isShowingKey)}
            >
              {isShowingKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Environment variable: <code>NEXT_PUBLIC_{envName}</code>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={!inputValue.trim()}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          {isConfigured ? (
            <div className="flex items-center">
              <div className="bg-gray-100 px-3 py-2 rounded-md flex-grow">
                <span className="text-gray-500">●●●●●●●●●●●●●●●●●●●●</span>
              </div>
              <button
                onClick={() => {
                  setIsShowingKey(!isShowingKey);
                }}
                className="ml-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {isShowingKey ? 'Hide' : 'View'}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No API key configured. Click Configure to add your key.</p>
          )}
          
          {isShowingKey && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <div className="text-xs font-mono overflow-x-auto whitespace-nowrap">
                {value || '(empty)'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModelSettingItem({ name, description, currentModel, alternatives, onModelChange }: ModelSettingItemProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-2">
        <h3 className="font-medium text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      
      <div className="mt-3">
        <select
          value={currentModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {alternatives.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 