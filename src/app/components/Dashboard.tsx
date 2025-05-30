"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBrain, FaChartLine, FaBuilding, FaHome, FaMapMarkerAlt, FaCog } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const [geminiCallCount, setGeminiCallCount] = useState(0);

  useEffect(() => {
    // Load Gemini usage data from localStorage
    if (typeof window !== 'undefined') {
      const geminiCallCountStr = localStorage.getItem('gemini_api_call_count');
      if (geminiCallCountStr) {
        setGeminiCallCount(parseInt(geminiCallCountStr, 10));
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Dubai Real Estate Market Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powered by Google Gemini AI for accurate property data, market trends, and investment insights
          </p>
        </div>

        {/* Gemini AI Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Gemini AI Integration</h2>
            <Link href="/settings" className="text-sm text-purple-600 hover:underline focus:outline-none">
              Configure
            </Link>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Advanced AI-powered property analysis with real-time web scraping and accurate market data.
            </p>
            <div className="flex items-center text-sm text-gray-600">
              <span className="h-2 w-2 rounded-full mr-2 bg-green-500"></span>
              <span>Gemini API Connected & Active</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <span className="h-2 w-2 rounded-full mr-2 bg-blue-500"></span>
              <span>API Calls Today: {geminiCallCount}</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Property Lookup */}
          <Link href="/property-lookup" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <FaHome className="text-3xl text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Property Lookup</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Search and analyze specific properties with AI-powered insights and real-time market data.
              </p>
              <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                Search Properties →
              </div>
            </div>
          </Link>

          {/* Developer Analysis */}
          <Link href="/developer-analysis" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <FaBuilding className="text-3xl text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Developer Analysis</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive analysis of Dubai real estate developers and their projects.
              </p>
              <div className="text-purple-600 group-hover:text-purple-800 font-medium">
                Analyze Developers →
              </div>
            </div>
          </Link>

          {/* Rental Analysis */}
          <Link href="/rental-analysis" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <FaMapMarkerAlt className="text-3xl text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Rental Analysis</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Analyze rental markets, yields, and investment opportunities across Dubai.
              </p>
              <div className="text-orange-600 group-hover:text-orange-800 font-medium">
                Analyze Rentals →
              </div>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/settings" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <FaCog className="text-3xl text-gray-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Settings</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configure your Gemini AI settings and manage API preferences.
              </p>
              <div className="text-gray-600 group-hover:text-gray-800 font-medium">
                Open Settings →
              </div>
            </div>
          </Link>

          {/* AI Analysis */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center mb-4">
              <FaBrain className="text-3xl mr-3" />
              <h3 className="text-xl font-semibold">Gemini AI Powered</h3>
            </div>
            <p className="mb-4 opacity-90">
              Advanced AI capabilities for real-time property data scraping and accurate market analysis.
            </p>
            <div className="text-sm opacity-75">
              ✓ Real-time web scraping<br/>
              ✓ Accurate property specifications<br/>
              ✓ Market trend analysis<br/>
              ✓ Investment insights
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{geminiCallCount}</div>
              <div className="text-sm text-gray-600">AI Analyses Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Real-time</div>
              <div className="text-sm text-gray-600">Data Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Gemini 1.5 Pro</div>
              <div className="text-sm text-gray-600">AI Model</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Dubai</div>
              <div className="text-sm text-gray-600">Market Focus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 