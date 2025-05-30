'use client';

import React from 'react';
import { Gem, Loader2, AlertCircle, Star } from 'lucide-react';

interface BillionairesProps {
  billionaires?: number;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const Billionaires: React.FC<BillionairesProps> = ({
  billionaires,
  isLoading = false,
  error,
  location
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE').format(num);
  };

  const getUltraWealthCategory = (count: number) => {
    if (count > 10) return { level: 'Global Hub', color: 'text-purple-600', bg: 'bg-purple-50' };
    if (count > 5) return { level: 'Ultra Elite', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (count > 2) return { level: 'Elite', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (count > 0) return { level: 'Exclusive', color: 'text-green-600', bg: 'bg-green-50' };
    return { level: 'Emerging', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const ultraWealthCategory = billionaires !== undefined ? getUltraWealthCategory(billionaires) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Gem className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Billionaires</h3>
            {location && (
              <p className="text-sm text-gray-500">in {location}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="text-gray-600">Loading ultra-wealth data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Error loading data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : billionaires !== undefined ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {formatNumber(billionaires)}
              </div>
              <p className="text-gray-600">Ultra High Net Worth</p>
              <p className="text-sm text-gray-500">(Net worth &gt; AED 3.67B)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Global Rank</div>
                <div className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Top 5%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Exclusivity</div>
                <div className="text-lg font-semibold text-purple-600">
                  {billionaires > 0 ? 'Ultra Rare' : 'None'}
                </div>
              </div>
            </div>

            {ultraWealthCategory && (
              <div className={`${ultraWealthCategory.bg} rounded-lg p-4 mt-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-800">Ultra-Wealth Status</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">
                    {ultraWealthCategory.level} ultra-wealth destination
                  </span>
                  <span className={`text-sm font-bold ${ultraWealthCategory.color}`}>
                    {ultraWealthCategory.level}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Gem className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Market Impact</span>
              </div>
              <p className="text-sm text-purple-700">
                {billionaires > 5 
                  ? "Global ultra-luxury destination with exceptional property values" 
                  : billionaires > 2 
                  ? "Elite ultra-luxury market with premium developments" 
                  : billionaires > 0
                  ? "Exclusive ultra-luxury presence driving market premiums"
                  : "Emerging ultra-luxury market with growth potential"}
              </p>
            </div>

            {billionaires > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Investment Significance</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Ultra-high net worth presence indicates exceptional investment opportunities 
                  and world-class amenities in this location.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Gem className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No ultra-wealth data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {billionaires !== undefined && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Ultra-wealth report</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billionaires; 