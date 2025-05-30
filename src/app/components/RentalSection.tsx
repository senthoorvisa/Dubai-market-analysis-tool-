'use client';

import React, { useState, useEffect } from 'react';
import backendApiService from '../services/backendApiService';

const RentalSection = () => {
  const [rentalInfo, setRentalInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRentalInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await backendApiService.generateMarketInsights({
        type: 'rental_market',
        area: 'Dubai',
        analysis_type: 'overview'
      });
      
      if (response.success && response.data) {
        const data = response.data as any;
        setRentalInfo(data.insights || data.message || 'No rental information available');
      } else {
        setError(response.error || 'Failed to fetch rental information');
      }
    } catch (err) {
      console.error('Error fetching rental info:', err);
      setError('Failed to fetch rental market information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalInfo();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Dubai Rental Market Overview</h2>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading rental market information...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchRentalInfo}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {rentalInfo && !loading && (
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: rentalInfo }} />
        </div>
      )}
      
      {!rentalInfo && !loading && !error && (
        <p className="text-gray-500">No rental market information available.</p>
      )}
    </div>
  );
};

export default RentalSection; 