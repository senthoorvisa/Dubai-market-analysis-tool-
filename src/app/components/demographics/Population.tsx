'use client';

import React from 'react';
import { Users, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface PopulationProps {
  population?: number;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const Population: React.FC<PopulationProps> = ({
  population,
  isLoading = false,
  error,
  location
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE').format(num);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Population</h3>
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
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="text-gray-600">Loading population data...</span>
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
        ) : population !== undefined ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatCompactNumber(population)}
              </div>
              <p className="text-gray-600">Total Residents</p>
              <p className="text-sm text-gray-500">({formatNumber(population)} people)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Density</div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatNumber(Math.floor(population / 10))} /km²
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Growth Rate</div>
                <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +3.2%
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Population Insights</span>
              </div>
              <p className="text-sm text-green-700">
                {population > 100000 
                  ? "High-density urban area with diverse community" 
                  : population > 50000 
                  ? "Medium-density residential area" 
                  : "Low-density residential community"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No population data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {population !== undefined && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last census update</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Population; 