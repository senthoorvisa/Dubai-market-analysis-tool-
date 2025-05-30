'use client';

import React from 'react';
import { Briefcase, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface EmploymentRateProps {
  employmentRate?: number;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const EmploymentRate: React.FC<EmploymentRateProps> = ({
  employmentRate,
  isLoading = false,
  error,
  location
}) => {
  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getEmploymentLevel = (rate: number) => {
    if (rate > 95) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (rate > 90) return { level: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (rate > 85) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (rate > 80) return { level: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Below Average', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const employmentLevel = employmentRate ? getEmploymentLevel(employmentRate) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Briefcase className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Employment Rate</h3>
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
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="text-gray-600">Loading employment data...</span>
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
        ) : employmentRate !== undefined ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {formatPercentage(employmentRate)}
              </div>
              <p className="text-gray-600">Working Age Population</p>
              <p className="text-sm text-gray-500">Currently Employed</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Unemployment</div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatPercentage(100 - employmentRate)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Trend</div>
                <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +1.8%
                </div>
              </div>
            </div>

            {employmentLevel && (
              <div className={`${employmentLevel.bg} rounded-lg p-4 mt-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-medium text-indigo-800">Employment Status</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-700">
                    {employmentLevel.level} employment area
                  </span>
                  <span className={`text-sm font-bold ${employmentLevel.color}`}>
                    {employmentLevel.level}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Economic Activity</span>
              </div>
              <p className="text-sm text-indigo-700">
                {employmentRate > 95 
                  ? "Thriving job market with excellent employment opportunities" 
                  : employmentRate > 90 
                  ? "Strong employment market with good job security" 
                  : employmentRate > 85
                  ? "Stable employment environment with moderate opportunities"
                  : "Developing job market with growth potential"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Private Sector</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Math.floor(employmentRate * 0.7)}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Government</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Math.floor(employmentRate * 0.2)}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Self-Employed</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Math.floor(employmentRate * 0.1)}%
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Key Industries</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div>• Finance & Banking</div>
                <div>• Real Estate</div>
                <div>• Technology</div>
                <div>• Tourism & Hospitality</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No employment data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {employmentRate !== undefined && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Labor statistics</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentRate; 