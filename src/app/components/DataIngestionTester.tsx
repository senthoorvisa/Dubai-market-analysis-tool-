"use client";

import React, { useState } from 'react';
import backendApiService from '../services/backendApiService';
import apiKeyService from '../services/apiKeyService';

const DataIngestionTester = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDataIngestionTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test rental data ingestion
      const rentalResponse = await backendApiService.getCurrentRentals();
      
      // Test property data
      const propertyResponse = await backendApiService.searchProperties({ limit: 5 });
      
      // Test developer data
      const developerResponse = await backendApiService.getAllDevelopers({ limit: 5 });
      
      // Test market demand data
      const demandResponse = await backendApiService.getCurrentDemand();
      
      setTestResults({
        rental: rentalResponse,
        property: propertyResponse,
        developer: developerResponse,
        demand: demandResponse,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Data ingestion test failed:', err);
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Data Ingestion Test</h2>
      
      <button
        onClick={runDataIngestionTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Data Ingestion Test'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}
      
      {testResults && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataIngestionTester; 