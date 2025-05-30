'use client';

import React from 'react';
import { Crown, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface MillionairesProps {
  millionaires?: number;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const Millionaires: React.FC<MillionairesProps> = ({
  millionaires,
  isLoading = false,
  error,
  location
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE').format(num);
  };

  const getWealthCategory = (count: number) => {
    if (count > 1000) return { level: 'Ultra High', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (count > 500) return { level: 'Very High', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (count > 100) return { level: 'High', color: 'text-purple-600', bg: 'bg-purple-50' };
    if (count > 50) return { level: 'Moderate', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { level: 'Low', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const wealthCategory = millionaires ? getWealthCategory(millionaires) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Crown className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Millionaires</h3>
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
              <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
              <span className="text-gray-600">Loading wealth data...</span>
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
        ) : millionaires !== undefined ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {formatNumber(millionaires)}
              </div>
              <p className="text-gray-600">High Net Worth Individuals</p>
              <p className="text-sm text-gray-500">(Net worth &gt; AED 3.67M)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Wealth Density</div>
                <div className="text-lg font-semibold text-gray-800">
                  {millionaires > 0 ? `${(millionaires / 1000).toFixed(1)}%` : '0%'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Growth</div>
                <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +8.5%
                </div>
              </div>
            </div>

            {wealthCategory && (
              <div className={`${wealthCategory.bg} rounded-lg p-4 mt-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-800">Wealth Concentration</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-700">
                    {wealthCategory.level} wealth concentration area
                  </span>
                  <span className={`text-sm font-bold ${wealthCategory.color}`}>
                    {wealthCategory.level}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Investment Insights</span>
              </div>
              <p className="text-sm text-yellow-700">
                {millionaires > 500 
                  ? "Premium luxury market with high-end property demand" 
                  : millionaires > 100 
                  ? "Strong luxury market presence and investment potential" 
                  : millionaires > 50
                  ? "Emerging luxury market with growth opportunities"
                  : "Developing market with future luxury potential"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No wealth data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {millionaires !== undefined && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Wealth report data</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Millionaires; 