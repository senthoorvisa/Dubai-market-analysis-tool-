'use client';

import { useState, useEffect } from 'react';
import { getRentalMarketInfo } from '../services/openAiService';

interface RentalData {
  averageRent: number;
  yearOverYearChange: number;
  occupancyRate: number;
  popularUnitTypes: string[];
  rentalYield: number;
  trendingAreas: { name: string; changePercent: number }[];
}

export default function RentalSection() {
  const [location, setLocation] = useState<string>('Downtown Dubai');
  const [rentalData, setRentalData] = useState<RentalData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const popularLocations = [
    'Downtown Dubai',
    'Dubai Marina',
    'Palm Jumeirah',
    'Jumeirah Village Circle',
    'Dubai Hills Estate'
  ];

  const fetchRentalData = async (loc: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRentalMarketInfo({ location: loc });
      if (response.success && response.data) {
        setRentalData(JSON.parse(response.data));
      } else {
        throw new Error(response.error || 'Failed to fetch rental data');
      }
    } catch (error) {
      setError('Failed to fetch rental data. Please try again later.');
      console.error('Error fetching rental data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalData(location);
  }, [location]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="rounded-lg shadow-lg overflow-hidden bg-white">
      <div className="bg-neutral-800 text-white p-4">
        <h2 className="text-xl font-bold">Rental Insights</h2>
        <div className="mt-2">
          <label htmlFor="location-select" className="sr-only">Select Location</label>
          <select
            id="location-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-neutral-700 text-white py-1 px-3 rounded w-full"
          >
            {popularLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4">
        {loading && <p className="text-center py-4">Loading rental data...</p>}
        
        {error && (
          <div className="text-red-500 text-center py-4">
            {error}
          </div>
        )}
        
        {!loading && !error && rentalData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-100 p-3 rounded">
                <div className="text-neutral-600 text-sm">Average Rent</div>
                <div className="text-lg font-bold">{formatCurrency(rentalData.averageRent)}</div>
              </div>
              
              <div className="bg-neutral-100 p-3 rounded">
                <div className="text-neutral-600 text-sm">Year-over-Year</div>
                <div className={`text-lg font-bold ${rentalData.yearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {rentalData.yearOverYearChange >= 0 ? '+' : ''}{rentalData.yearOverYearChange}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-100 p-3 rounded">
                <div className="text-neutral-600 text-sm">Occupancy Rate</div>
                <div className="text-lg font-bold">{rentalData.occupancyRate}%</div>
              </div>
              
              <div className="bg-neutral-100 p-3 rounded">
                <div className="text-neutral-600 text-sm">Rental Yield</div>
                <div className="text-lg font-bold">{rentalData.rentalYield}%</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-neutral-600 font-medium mb-2">Popular Unit Types</h3>
              <div className="flex flex-wrap gap-2">
                {rentalData.popularUnitTypes.map((type, index) => (
                  <span 
                    key={index} 
                    className="bg-neutral-200 px-2 py-1 rounded-full text-sm text-neutral-800"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-neutral-600 font-medium mb-2">Trending Areas</h3>
              <div className="space-y-2">
                {rentalData.trendingAreas.map((area, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-neutral-800">{area.name}</span>
                    <span className={`font-medium ${area.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {area.changePercent >= 0 ? '+' : ''}{area.changePercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-4">
              <button 
                className="bg-neutral-800 text-white py-2 px-4 rounded hover:bg-neutral-700 transition-colors"
                onClick={() => window.location.href = '/property-lookup'}
              >
                View Full Rental Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 