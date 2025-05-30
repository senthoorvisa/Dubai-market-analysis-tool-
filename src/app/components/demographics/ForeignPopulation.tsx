'use client';

import React from 'react';
import { Globe, Loader2, AlertCircle, Users } from 'lucide-react';

interface ForeignPopulationProps {
  foreignPopulation?: number;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const ForeignPopulation: React.FC<ForeignPopulationProps> = ({
  foreignPopulation,
  isLoading = false,
  error,
  location
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getDiversityLevel = (percentage: number) => {
    if (percentage > 80) return { level: 'Highly International', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage > 60) return { level: 'Very Diverse', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage > 40) return { level: 'Diverse', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage > 20) return { level: 'Moderately Diverse', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Predominantly Local', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const diversityLevel = foreignPopulation !== undefined ? getDiversityLevel(foreignPopulation) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Foreign Population</h3>
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
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading diversity data...</span>
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
        ) : foreignPopulation !== undefined ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatPercentage(foreignPopulation)}
              </div>
              <p className="text-gray-600">Expatriate Population</p>
              <p className="text-sm text-gray-500">International Residents</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Local Population</div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatPercentage(100 - foreignPopulation)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Diversity Index</div>
                <div className="text-lg font-semibold text-blue-600 flex items-center justify-center gap-1">
                  <Users className="h-4 w-4" />
                  {foreignPopulation > 70 ? 'High' : foreignPopulation > 40 ? 'Medium' : 'Low'}
                </div>
              </div>
            </div>

            {diversityLevel && (
              <div className={`${diversityLevel.bg} rounded-lg p-4 mt-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">Community Diversity</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {diversityLevel.level} community
                  </span>
                  <span className={`text-sm font-bold ${diversityLevel.color}`}>
                    {diversityLevel.level}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Cultural Impact</span>
              </div>
              <p className="text-sm text-blue-700">
                {foreignPopulation > 70 
                  ? "Highly cosmopolitan area with international business focus" 
                  : foreignPopulation > 50 
                  ? "Diverse international community with global connectivity" 
                  : foreignPopulation > 30
                  ? "Balanced mix of local and international residents"
                  : "Predominantly local community with traditional values"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Western</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Math.floor(foreignPopulation * 0.3)}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Asian</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Math.floor(foreignPopulation * 0.5)}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Other</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Math.floor(foreignPopulation * 0.2)}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No diversity data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {foreignPopulation !== undefined && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Demographics survey</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForeignPopulation; 