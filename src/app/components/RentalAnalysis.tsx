"use client";

import { useState, useEffect } from 'react';
import { getRentalMarketInfo } from '../services/openAiService';
import ApiKeyInput from './ApiKeyInput';
import apiKeyService from '../services/apiKeyService';
import { FaBuilding, FaMapMarkerAlt, FaBed, FaSearch, FaChartLine, FaMoneyBillWave, FaPercentage, FaSpinner, FaInfoCircle, FaClock } from 'react-icons/fa';
import Image from 'next/image';

interface RentalSearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  propertyName?: string; // Added for specific property search
}

export default function RentalAnalysis() {
  const [location, setLocation] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [propertyName, setPropertyName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalAnalysis, setRentalAnalysis] = useState<string | null>(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  const propertyTypes = [
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Studio',
    'Office Space',
    'Retail Space'
  ];

  const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];

  const popularLocations = [
    'Downtown Dubai',
    'Dubai Marina',
    'Palm Jumeirah',
    'Jumeirah Village Circle',
    'Dubai Hills Estate',
    'Business Bay',
    'Emirates Hills',
    'Jumeirah Beach Residence',
    'Arabian Ranches',
    'DIFC'
  ];

  // Example rental listings data
  const rentalListings = [
    {
      id: 1,
      title: 'Luxury Marina View Apartment',
      location: 'Dubai Marina',
      type: 'Apartment',
      price: 120000,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      featured: true,
      rentYield: 5.2,
      yearBuilt: 2018
    },
    {
      id: 2,
      title: 'Premium Palm Jumeirah Villa',
      location: 'Palm Jumeirah',
      type: 'Villa',
      price: 450000,
      bedrooms: 4,
      bathrooms: 5,
      area: 4500,
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      featured: true,
      rentYield: 4.8,
      yearBuilt: 2016
    },
    {
      id: 3,
      title: 'Modern Downtown Studio',
      location: 'Downtown Dubai',
      type: 'Studio',
      price: 75000,
      bedrooms: 0,
      bathrooms: 1,
      area: 550,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      featured: false,
      rentYield: 6.1,
      yearBuilt: 2020
    },
    {
      id: 4,
      title: 'Spacious Business Bay Penthouse',
      location: 'Business Bay',
      type: 'Penthouse',
      price: 280000,
      bedrooms: 3,
      bathrooms: 4,
      area: 3200,
      image: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      featured: false,
      rentYield: 5.5,
      yearBuilt: 2019
    }
  ];

  // Example market data for charts
  const marketData = {
    rentTrends: [
      { year: 2018, price: 85000 },
      { year: 2019, price: 88000 },
      { year: 2020, price: 82000 },
      { year: 2021, price: 90000 },
      { year: 2022, price: 105000 },
      { year: 2023, price: 118000 },
      { year: 2024, price: 125000 }
    ],
    rentByArea: [
      { area: 'Dubai Marina', studio: 60000, oneBed: 80000, twoBed: 120000, threeBed: 160000 },
      { area: 'Downtown', studio: 65000, oneBed: 90000, twoBed: 130000, threeBed: 180000 },
      { area: 'Palm Jumeirah', studio: 70000, oneBed: 100000, twoBed: 150000, threeBed: 220000 },
      { area: 'JVC', studio: 38000, oneBed: 55000, twoBed: 75000, threeBed: 110000 },
      { area: 'Business Bay', studio: 55000, oneBed: 75000, twoBed: 110000, threeBed: 150000 }
    ],
    yieldByArea: [
      { area: 'Dubai Marina', yield: 5.8 },
      { area: 'Downtown', yield: 5.2 },
      { area: 'Palm Jumeirah', yield: 4.9 },
      { area: 'JVC', yield: 7.1 },
      { area: 'Business Bay', yield: 6.2 }
    ],
    occupancyRates: [
      { area: 'Dubai Marina', rate: 92 },
      { area: 'Downtown', rate: 94 },
      { area: 'Palm Jumeirah', rate: 88 },
      { area: 'JVC', rate: 85 },
      { area: 'Business Bay', rate: 90 }
    ]
  };
  
  const marketInsights = [
    {
      title: 'Average Rental Yield',
      value: '5.8%',
      trend: 'up',
      changePercent: 0.4,
      icon: <FaPercentage className="text-gold-500" size={24} />
    },
    {
      title: 'Annual Price Growth',
      value: '12.3%',
      trend: 'up',
      changePercent: 3.2,
      icon: <FaChartLine className="text-gold-500" size={24} />
    },
    {
      title: 'Average Occupancy',
      value: '91%',
      trend: 'up',
      changePercent: 2.1,
      icon: <FaBuilding className="text-gold-500" size={24} />
    },
    {
      title: 'Avg. Days on Market',
      value: '28',
      trend: 'down',
      changePercent: 5.3,
      icon: <FaClock className="text-gold-500" size={24} />
    }
  ];

  useEffect(() => {
    // Check if API key is configured on component mount
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
    if (!hasApiKey) {
      setShowApiKeyInput(true);
    }
  }, []);

  const handleApiKeySet = (success: boolean) => {
    setIsApiKeyConfigured(success);
    if (success) {
      setShowApiKeyInput(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim() && !propertyName.trim()) {
      setError('Please enter a property name or select a location');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRentalAnalysis(null);
    
    try {
      // Format the criteria for the API
      const searchCriteria: RentalSearchCriteria = {
        location: location,
        propertyType: propertyType || undefined,
        bedrooms: bedrooms ? (bedrooms === 'Studio' ? 0 : parseInt(bedrooms, 10)) : undefined,
        propertyName: propertyName || undefined
      };
      
      // Call the OpenAI API with instructions to search for real market data
      const response = await getRentalMarketInfo(searchCriteria);
      
      if (response.success && response.data) {
        setRentalAnalysis(response.data);
      } else {
        throw new Error(response.error || 'Failed to get rental market information');
      }
    } catch (err) {
      let errorMessage = 'Failed to perform rental market analysis. Please try again later.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      
      // If error is related to API key, show API key input
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        setIsApiKeyConfigured(false);
        setShowApiKeyInput(true);
      }
      
      console.error('Error during rental market analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `AED ${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-white min-h-screen text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Dubai Rental Price Analyzer</h1>

      {/* API Key Configuration */}
      {showApiKeyInput && (
        <div className="mb-8 bg-gray-50 rounded-xl border border-gray-200 shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Configure API Key</h2>
          <ApiKeyInput onApiKeySet={handleApiKeySet} />
        </div>
      )}

      {/* Search Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold flex items-center text-gray-800">
              <FaSearch className="mr-2 text-blue-600" /> Find Current Rental Prices
            </h2>
          </div>
          
          <form onSubmit={handleSearch} className="p-6">
            {/* Property Name Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Property Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Enter specific property name (e.g., Marina Towers, Palm Residences)"
                  className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-500">Enter the name of a specific property for accurate rental price data</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Location
                </label>
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="">Select a location</option>
                    {popularLocations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Property Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Property Type</label>
                <div className="relative">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="">Any Type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Bedrooms Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Bedrooms</label>
                <div className="relative">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="">Any</option>
                    {bedroomOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <FaBed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Search Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                disabled={loading || !isApiKeyConfigured}
              >
                {loading ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" /> Searching Real-Time Data...
                  </>
                ) : (
                  <>
                    <FaSearch className="mr-2" /> Get Current Rental Price
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Important Note */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <FaInfoCircle className="mr-2" /> 
          How This Works
        </h3>
        <p className="mb-2">
          This tool uses AI to search for accurate, current market rental prices for properties in Dubai. For the most precise results:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>Enter a specific property name (e.g., "Marina Towers" or "Emaar Beachfront")</li>
          <li>Include location, property type, and number of bedrooms for more accurate results</li>
          <li>Results are based on real-time web searches for current market rates</li>
        </ul>
        <p className="font-medium">Note: The analysis will provide actual market data, not estimates or approximations.</p>
      </div>

      {/* Results Section */}
      {rentalAnalysis && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            <FaChartLine className="mr-2 text-blue-600" /> 
            Current Rental Analysis
            {propertyName && `: ${propertyName}`}
            {location && !propertyName && `: ${location}`}
            {propertyType && !propertyName && ` - ${propertyType}`}
            {bedrooms && !propertyName && ` - ${bedrooms} ${bedrooms === '1' ? 'Bedroom' : 'Bedrooms'}`}
          </h2>
          <div className="text-gray-800 prose max-w-none">
            {rentalAnalysis.split('\n').map((line, index) => {
              // Highlight key rental price data
              if (line.includes("AED") || line.includes("rental price") || line.includes("current rate")) {
                return (
                  <div key={index} className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="m-0 font-medium">{line}</p>
                  </div>
                );
              }
              // Highlight data points
              if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || line.trim().startsWith('4.')) {
                return (
                  <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="m-0">{line}</p>
                  </div>
                );
              }
              return <p key={index} className="mb-2">{line}</p>;
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">This analysis is based on current rental market data as of {new Date().toLocaleDateString()}. Prices are subject to change based on market conditions.</p>
          </div>
        </div>
      )}
    </div>
  );
} 