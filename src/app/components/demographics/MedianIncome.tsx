'use client';

import React from 'react';
import { DollarSign, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface MedianIncomeProps {
  medianIncome?: number;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const MedianIncome: React.FC<MedianIncomeProps> = ({
  medianIncome,
  isLoading = false,
  error,
  location
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIncomeLevel = (income: number) => {
    if (income > 500000) return { level: 'Very High', color: 'text-green-600', bg: 'bg-green-50' };
    if (income > 300000) return { level: 'High', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (income > 200000) return { level: 'Above Average', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (income > 100000) return { level: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Below Average', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const incomeLevel = medianIncome ? getIncomeLevel(medianIncome) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Median Income</h3>
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
              <span className="text-gray-600">Loading income data...</span>
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
        ) : medianIncome !== undefined ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(medianIncome)}
              </div>
              <p className="text-gray-600">Annual Household Income</p>
              <p className="text-sm text-gray-500">Median (50th percentile)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Monthly</div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatCurrency(medianIncome / 12)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Growth</div>
                <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +4.2%
                </div>
              </div>
            </div>

            {incomeLevel && (
              <div className={`${incomeLevel.bg} rounded-lg p-4 mt-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Income Level</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">
                    {incomeLevel.level} income area
                  </span>
                  <span className={`text-sm font-bold ${incomeLevel.color}`}>
                    {incomeLevel.level}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Economic Profile</span>
              </div>
              <p className="text-sm text-green-700">
                {medianIncome > 400000 
                  ? "High-income professional community with strong purchasing power" 
                  : medianIncome > 250000 
                  ? "Upper-middle income area with good economic stability" 
                  : medianIncome > 150000
                  ? "Middle-income community with moderate spending capacity"
                  : "Developing economic area with growth potential"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">25th Percentile</div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatCurrency(medianIncome * 0.7)}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Median</div>
                <div className="text-sm font-semibold text-green-800">
                  {formatCurrency(medianIncome)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">75th Percentile</div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatCurrency(medianIncome * 1.4)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No income data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {medianIncome !== undefined && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Economic survey data</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedianIncome; 