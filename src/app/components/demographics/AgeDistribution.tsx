'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users2, Loader2, AlertCircle } from 'lucide-react';

interface AgeGroup {
  ageGroup: string;
  percentage: number;
}

interface AgeDistributionProps {
  ageDistribution?: AgeGroup[];
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const AgeDistribution: React.FC<AgeDistributionProps> = ({
  ageDistribution,
  isLoading = false,
  error,
  location
}) => {
  const formatTooltip = (value: any, name: any) => {
    return [`${value}%`, 'Population'];
  };

  const formatLabel = (label: string) => {
    return `Age ${label}`;
  };

  const getBarColor = (ageGroup: string) => {
    switch (ageGroup) {
      case '0-17': return '#3B82F6'; // Blue
      case '18-35': return '#10B981'; // Green
      case '36-55': return '#F59E0B'; // Yellow
      case '56+': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Age Distribution</h3>
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
              <span className="text-gray-600">Loading age distribution...</span>
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
        ) : ageDistribution && ageDistribution.length > 0 ? (
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageDistribution}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="ageGroup" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatLabel}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelFormatter={formatLabel}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend and Statistics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {ageDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getBarColor(item.ageGroup) }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      Age {item.ageGroup}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="bg-purple-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-800">Age Demographics Insights</span>
              </div>
              <p className="text-sm text-purple-700">
                {(() => {
                  const youngAdults = ageDistribution.find(item => item.ageGroup === '18-35')?.percentage || 0;
                  const middleAged = ageDistribution.find(item => item.ageGroup === '36-55')?.percentage || 0;
                  
                  if (youngAdults > 40) {
                    return "Young professional community with high economic activity";
                  } else if (middleAged > 35) {
                    return "Established family-oriented community with stable demographics";
                  } else {
                    return "Diverse age distribution with balanced community dynamics";
                  }
                })()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No age distribution data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {ageDistribution && ageDistribution.length > 0 && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Based on latest census</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgeDistribution; 