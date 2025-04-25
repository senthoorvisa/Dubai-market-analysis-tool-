"use client";

import { useState } from 'react';
import { getRentalMarketInfo } from '../services/openAiService';

interface RentalSearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
}

export default function RentalAnalysis() {
  const [location, setLocation] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalAnalysis, setRentalAnalysis] = useState<string | null>(null);

  const propertyTypes = [
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Studio',
    'Office Space',
    'Retail Space'
  ];

  const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];

  const popularLocations = [
    'Downtown Dubai',
    'Dubai Marina',
    'Palm Jumeirah',
    'Jumeirah Village Circle',
    'Dubai Hills Estate',
    'Business Bay',
    'Emirates Hills',
    'Jumeirah Beach Residence',
    'Arabian Ranches',
    'DIFC'
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim()) {
      setError('Please select a location');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRentalAnalysis(null);
    
    try {
      // Format the criteria for the API
      const searchCriteria: RentalSearchCriteria = {
        location: location,
        propertyType: propertyType || undefined,
        bedrooms: bedrooms ? (bedrooms === 'Studio' ? 0 : parseInt(bedrooms, 10)) : undefined
      };
      
      // Call the OpenAI API
      const response = await getRentalMarketInfo(searchCriteria);
      
      if (response.success && response.data) {
        setRentalAnalysis(response.data);
      } else {
        throw new Error(response.error || 'Failed to get rental market information');
      }
    } catch (err) {
      let errorMessage = 'Failed to perform rental market analysis. Please try again later.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error during rental market analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-neutral-800">Dubai Rental Market Analysis</h2>

      <form onSubmit={handleSearch} className="space-y-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
              Location
            </label>
            <input
              list="locations"
              id="location"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Downtown Dubai"
              required
            />
            <datalist id="locations">
              {popularLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-neutral-700 mb-1">
              Property Type
            </label>
            <select
              id="propertyType"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Any</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-neutral-700 mb-1">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            >
              <option value="">Any</option>
              {bedroomOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-neutral-800 text-white py-2 px-6 rounded-md hover:bg-neutral-700 transition-colors"
            disabled={loading || !location}
          >
            {loading ? 'Analyzing...' : 'Analyze Rental Market'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-800"></div>
          <p className="mt-2 text-neutral-600">Analyzing rental market data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {rentalAnalysis && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-neutral-800">Rental Market Insights</h3>
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-md">
            <div className="prose max-w-none text-neutral-700 whitespace-pre-line">
              {rentalAnalysis}
            </div>
            <div className="mt-5 pt-4 border-t border-neutral-200 text-sm text-neutral-500">
              <p>Data sources: Dubai Land Department, RERA, Market reports</p>
              <p className="mt-1">Analysis powered by OpenAI</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 