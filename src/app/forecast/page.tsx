'use client';

import { useState, useEffect } from 'react';
import { 
  FaChartLine, FaArrowLeft, FaInfoCircle, FaExclamationTriangle, 
  FaChartPie, FaStar, FaTable, FaArrowUp, FaBullseye, FaKey, FaCog
} from 'react-icons/fa';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import propertyDataService from '../services/propertyDataService';
import apiKeyService from '../services/apiKeyService';

export default function ForecastPage() {
  // State for API key configuration
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Market confidence data
  const [marketConfidence, setMarketConfidence] = useState(87);
  
  // Property price forecast data
  const [priceData, setPriceData] = useState([
    // Historical data (solid line)
    { year: 2010, price: 10000000, type: 'historical' },
    { year: 2011, price: 10500000, type: 'historical' },
    { year: 2012, price: 11000000, type: 'historical' },
    { year: 2013, price: 11400000, type: 'historical' },
    { year: 2014, price: 11800000, type: 'historical' },
    { year: 2015, price: 12100000, type: 'historical' },
    { year: 2016, price: 12300000, type: 'historical' },
    { year: 2017, price: 12600000, type: 'historical' },
    { year: 2018, price: 12900000, type: 'historical' },
    { year: 2019, price: 13200000, type: 'historical' },
    { year: 2020, price: 13400000, type: 'historical' },
    { year: 2021, price: 13700000, type: 'historical' },
    { year: 2022, price: 14100000, type: 'historical' },
    { year: 2023, price: 14500000, type: 'historical' },
    { year: 2024, price: 15000000, type: 'historical' },
    // Forecast data (dashed line)
    { year: 2025, price: 15800000, type: 'forecast' },
    { year: 2026, price: 16700000, type: 'forecast' },
    { year: 2027, price: 17500000, type: 'forecast' },
    { year: 2028, price: 18400000, type: 'forecast' },
    { year: 2029, price: 19300000, type: 'forecast' },
    { year: 2030, price: 20100000, type: 'forecast' },
    { year: 2031, price: 20800000, type: 'forecast' },
    { year: 2032, price: 21400000, type: 'forecast' },
    { year: 2033, price: 21800000, type: 'forecast' },
    { year: 2034, price: 22000000, type: 'forecast' }
  ]);
  
  // Property types in area data
  const [propertyTypesData, setPropertyTypesData] = useState([
    { name: 'Apartments', value: 45, color: '#06b6d4' },
    { name: 'Villas', value: 30, color: '#8b5cf6' },
    { name: 'Townhouses', value: 15, color: '#f59e0b' },
    { name: 'Commercial', value: 10, color: '#10b981' }
  ]);
  
  // Investment opportunities data
  const [investmentOpportunities, setInvestmentOpportunities] = useState([
    { 
      id: 1, 
      name: 'Sky Tower Unit 5', 
      location: 'Dubai Marina', 
      currentPrice: 10000000, 
      forecastPrice: 14000000, 
      roi: 40, 
      hotPick: true 
    },
    { 
      id: 2, 
      name: 'The Palm Residence 204', 
      location: 'Palm Jumeirah', 
      currentPrice: 18000000, 
      forecastPrice: 23400000, 
      roi: 30, 
      hotPick: false 
    },
    { 
      id: 3, 
      name: 'Downtown Lofts 310', 
      location: 'Downtown Dubai', 
      currentPrice: 8500000, 
      forecastPrice: 11900000, 
      roi: 40, 
      hotPick: false 
    },
    { 
      id: 4, 
      name: 'Desert Hills Villa 7', 
      location: 'Arabian Ranches', 
      currentPrice: 12000000, 
      forecastPrice: 15600000, 
      roi: 30, 
      hotPick: false 
    },
    { 
      id: 5, 
      name: 'Business Bay Tower Apt 1205', 
      location: 'Business Bay', 
      currentPrice: 7000000, 
      forecastPrice: 9800000, 
      roi: 40, 
      hotPick: false 
    }
  ]);
  
  // Selected property type filter
  const [selectedPropertyType, setSelectedPropertyType] = useState('');

  useEffect(() => {
    // Check if API key exists
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
  }, []);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Handle pie chart slice click
  const handlePieClick = (data: any) => {
    setSelectedPropertyType(prevType => 
      prevType === data.name ? '' : data.name
    );
  };
  
  // Filter investment opportunities based on selected property type
  const getFilteredOpportunities = () => {
    if (!selectedPropertyType) return investmentOpportunities;
    
    // In a real app, we would filter based on property type
    // For now, let's just return a subset for demonstration
    return investmentOpportunities.slice(0, 3);
  };
  
  // Custom tooltip for the price chart
  const PriceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const originalPrice = priceData[0].price;
      const growth = ((data.price - originalPrice) / originalPrice) * 100;
      const annualGrowth = (Math.pow((data.price / originalPrice), 1 / (data.year - priceData[0].year)) - 1) * 100;
      
      return (
        <div className="bg-gray-800 text-white p-3 rounded-md border border-teal-500 shadow-glow">
          <p className="font-bold text-teal-300">{`Year: ${label}`}</p>
          <p className="text-white">{`Price: ${formatCurrency(data.price)}`}</p>
          <p className="text-teal-300">{`Total Growth: +${growth.toFixed(1)}%`}</p>
          <p className="text-teal-300">{`Avg. Annual: +${annualGrowth.toFixed(1)}%`}</p>
          <p className="text-xs text-gray-400 mt-1">{data.type === 'forecast' ? 'Projected' : 'Historical'}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for the pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-3 rounded-md border border-teal-500 shadow-glow">
          <p className="font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].name}
          </p>
          <p className="text-white">{`${payload[0].value}% of area properties`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto py-6 px-4">
        {/* Header with Market Confidence Meter */}
        <header className="bg-gray-800 rounded-lg shadow-glow border border-teal-500 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-white hover:text-teal-300 transition-colors">
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold flex items-center">
                <FaChartLine className="mr-2 text-teal-400" />
                Future Value Forecast
              </h1>
            </div>
            
            {/* Market Confidence Meter */}
            <div className="flex flex-col items-end">
              <div className="text-sm text-gray-400 mb-1">Market Confidence</div>
              <div className="relative w-48 h-6 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ 
                    width: `${marketConfidence}%`,
                    background: `linear-gradient(90deg, ${marketConfidence > 70 ? '#10b981' : marketConfidence > 40 ? '#f59e0b' : '#ef4444'} 0%, #22d3ee 100%)` 
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {marketConfidence}%
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {!isApiKeyConfigured && (
          <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 flex items-start mb-6">
            <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-yellow-300">API Key Not Configured</h3>
              <p className="text-sm text-yellow-200">You need to set up your OpenAI API key to use this tool.</p>
              <Link href="/settings" className="text-sm text-yellow-200 underline mt-1 inline-block">
                Go to Settings to Configure API Key
              </Link>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-4 flex items-start mb-6">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-red-300">Error</h3>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left section - Price Forecast */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-glow border border-teal-900 p-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2 mb-4 flex items-center">
              <FaChartLine className="text-teal-400 mr-2" /> Price Forecast
            </h2>
            
            <div className="text-sm text-gray-400 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-teal-300">5 BHK Apartment</span>
                  <span className="mx-1">•</span>
                  <span>Abu Dhabi</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Initial: <span className="text-teal-300">{formatCurrency(priceData[0].price)}</span>
                  </div>
                  <div className="font-medium">
                    Forecast (2034): <span className="text-teal-300">{formatCurrency(priceData[priceData.length - 1].price)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => new Intl.NumberFormat('en', { 
                      notation: 'compact',
                      compactDisplay: 'short',
                      maximumFractionDigits: 1
                    }).format(value)}
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip content={<PriceTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="Historical Data"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, fill: '#f0abfc' }}
                    isAnimationActive={true}
                    data={priceData.filter(d => d.type === 'historical')}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="Forecast"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, fill: '#f0abfc' }}
                    isAnimationActive={true}
                    data={priceData.filter(d => d.type === 'forecast')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-3 bg-gray-700 rounded-md border border-teal-900">
              <p className="text-sm text-gray-300 flex items-start">
                <FaInfoCircle className="mr-2 mt-0.5 text-teal-400" />
                Solid line shows historical data (2010-2024), dashed line shows AI-powered forecast (2025-2034). Hover for details.
              </p>
            </div>
          </div>
          
          {/* Right section - Area Property Mix */}
          <div className="bg-gray-800 rounded-lg shadow-glow border border-teal-900 p-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2 mb-4 flex items-center">
              <FaChartPie className="text-teal-400 mr-2" /> Property Types in Area
            </h2>
            
            <div className="text-center mb-2 text-gray-400 text-sm">
              {selectedPropertyType ? `Showing: ${selectedPropertyType}` : 'Click segments to filter'}
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    onClick={handlePieClick}
                    isAnimationActive={true}
                  >
                    {propertyTypesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="#1e293b"
                        opacity={selectedPropertyType && selectedPropertyType !== entry.name ? 0.5 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {propertyTypesData.map((type) => (
                <div 
                  key={type.name}
                  className={`p-2 rounded-md flex items-center cursor-pointer transition-colors ${
                    selectedPropertyType === type.name 
                      ? 'bg-gray-700 border border-teal-500' 
                      : 'bg-gray-700 border border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handlePieClick(type)}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="text-sm">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom section - Investment Opportunities */}
          <div className="lg:col-span-3 bg-gray-800 rounded-lg shadow-glow border border-teal-900 p-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2 mb-4 flex items-center">
              <FaTable className="text-teal-400 mr-2" /> Investment Opportunities
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">5-Year Forecast</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Projected ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {getFilteredOpportunities().map((property) => (
                    <tr 
                      key={property.id} 
                      className={`hover:bg-gray-700 transition-colors ${property.hotPick ? 'bg-teal-900 bg-opacity-20' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {property.hotPick && (
                            <div className="mr-2 bg-gradient-to-br from-yellow-400 to-teal-400 p-1 rounded-full">
                              <FaStar className="h-4 w-4 text-gray-900" />
                            </div>
                          )}
                          <div className="text-sm font-medium text-white">
                            {property.name}
                            {property.hotPick && (
                              <span className="ml-2 text-xs bg-gradient-to-r from-yellow-400 to-teal-400 bg-clip-text text-transparent font-bold">
                                HOT PICK
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {property.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                        {formatCurrency(property.currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="text-teal-300 font-medium">
                          {formatCurrency(property.forecastPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="flex items-center justify-end text-teal-300 font-medium">
                          <FaArrowUp className="mr-1" />
                          {property.roi}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 bg-gray-700 rounded-md border border-teal-900">
              <p className="text-sm text-gray-300 flex items-start">
                <FaBullseye className="mr-2 mt-0.5 text-teal-400" />
                Opportunities are based on AI analysis of current market conditions, historical performance, and future projections.
                {selectedPropertyType && (
                  <span className="ml-1">Currently filtered to show {selectedPropertyType.toLowerCase()} investment options.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 