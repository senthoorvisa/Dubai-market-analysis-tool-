'use client';

import React from 'react';
import { Building2, Loader2, AlertCircle } from 'lucide-react';

interface TotalPropertiesProps {
  totalProperties?: number;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const TotalProperties: React.FC<TotalPropertiesProps> = ({
  totalProperties,
  isLoading = false,
  error,
  location
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE').format(num);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Total Properties</h3>
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
              <span className="text-gray-600">Loading property data...</span>
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
        ) : totalProperties !== undefined ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatNumber(totalProperties)}
              </div>
              <p className="text-gray-600">Active Property Listings</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Apartments</div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatNumber(Math.floor(totalProperties * 0.65))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Villas</div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatNumber(Math.floor(totalProperties * 0.35))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No property data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {totalProperties !== undefined && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last updated</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalProperties; 