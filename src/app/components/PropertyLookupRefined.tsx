"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaArrowLeft, FaSearch, FaSpinner, FaHome, FaBed, FaBath, 
  FaBuilding, FaMapMarkerAlt, FaTag, FaExternalLinkAlt, FaChevronRight, FaChevronLeft,
  FaFilter, FaBrain, FaRuler, FaCalendar, FaChartLine, FaInfoCircle, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaTimes
} from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { getPropertyInfoWithScraping } from '../services/geminiService';
import backendApiService from '../services/backendApiService';

// API response structure
interface PricePoint {
  year: number;
  price: number;
}

interface PropertyMetadata {
  id: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  developer: string;
  purchaseYear: number;
  location: string;
  price: number;
  fullAddress: string;
  status: 'Completed' | 'Under Construction' | 'Planned';
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface NearbyProperty {
  id: string;
  name: string;
  distance: number; // in km
  originalPrice: number;
  originalYear: number;
  currentPrice: number;
  currentYear: number;
  beds: number;
  baths: number;
  sqft: number;
  developer: string;
  address?: string;
}

interface OngoingProject {
  id: string;
  name: string;
  status: 'In Ideation' | 'Pre-Funding' | 'Under Construction' | 'Nearly Complete';
  expectedCompletion: string; // Year or date
  developer: string;
}

interface DeveloperInfo {
  id: string;
  name: string;
  headquarters: string;
  totalProjects: number;
  averageROI: number;
  revenueByYear: Array<{
    year: number;
    residential: number;
    commercial: number;
    mixedUse: number;
  }>;
}

interface PropertyData {
  metadata: PropertyMetadata;
  priceHistory: PricePoint[];
  nearby: NearbyProperty[];
  ongoingProjects: OngoingProject[];
  developer: DeveloperInfo;
}

// Add this helper function before the component declaration
function generatePopularProjects(developerName: string) {
  // Generate mock popular projects based on developer name
  const projects = [];
  
  const projectTypes = ['Residential', 'Commercial', 'Mixed-Use', 'Luxury Villa', 'Waterfront'];
  const locations = ['Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Dubai Hills', 'Business Bay', 'JBR'];
  const statuses = ['Completed', 'Under Construction', 'Sold Out', 'Pre-launch'];
  
  // Generate 3 popular projects
  for (let i = 0; i < 3; i++) {
    projects.push({
      name: `${developerName} ${['Residences', 'Heights', 'Towers', 'Plaza', 'Gardens', 'Park'][i % 6]} ${i + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: projectTypes[Math.floor(Math.random() * projectTypes.length)]
    });
  }

  return projects;
}

// Define property search criteria
interface PropertySearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  floorNumber?: string;
  unitNumber?: string;
}

// Property types for dropdown
const propertyTypes = [
  'Apartment',
  'Villa',
  'Townhouse',
  'Penthouse',
  'Duplex',
  'Studio',
  'Office',
  'Commercial Space',
  'Retail Shop',
  'Plot/Land'
];

// Bedroom options
const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];

// Add new interfaces for enhanced data accuracy
interface AccuracyMetrics {
  overallScore: number;
  sourcesCount: number;
  lastUpdated: string;
  dataVerification: {
    priceAccuracy: number;
    developerVerification: number;
    locationAccuracy: number;
    dateAccuracy: number;
  };
  sourcesUsed: string[];
}

interface VerifiedPropertyData extends PropertyData {
  accuracyMetrics?: AccuracyMetrics;
  verification?: {
    isVerified: boolean;
    conflictingData: string[];
    lastVerified: string;
  };
}

export default function PropertyLookupRefined() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [floorNumber, setFloorNumber] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState<string>('');
  const [priceEstimate, setPriceEstimate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<VerifiedPropertyData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'properties' | 'ongoing' | 'developer'>('properties');
  const [chartZoom, setChartZoom] = useState<{startIndex: number, endIndex: number} | null>(null);
  const [developerDetailsExpanded, setDeveloperDetailsExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
  const [accuracyMetrics, setAccuracyMetrics] = useState<AccuracyMetrics | null>(null);
  const [dataVerification, setDataVerification] = useState<any>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<'idle' | 'fetching' | 'verified' | 'error'>('idle');

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate growth percentage
  const calculateGrowth = (original: number, current: number): string => {
    return ((current - original) / original * 100).toFixed(2);
  };
  
  // Enhanced search handling with accuracy validation
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term (e.g., property name, address, or area)');
      return;
    }
    
    setLoading(true);
    setError(null);
    setPropertyData(null);
    setGeminiAnalysis('');
    setAccuracyMetrics(null);
    setDataVerification(null);
    setRealTimeStatus('fetching');
    
    try {
      console.log('🔮 Starting enhanced property search with multi-source verification:', { 
        searchTerm, 
        propertyType, 
        bedrooms, 
        floorNumber, 
        unitNumber 
      });
      
      // Use enhanced backend API service with verification
      const response = await backendApiService.getVerifiedPropertyData({
        searchTerm,
        location: searchTerm,
        propertyType,
        bedrooms,
        floorNumber,
        unitNumber
      });
      
      if (response.success && response.data) {
        console.log('✅ Enhanced property lookup completed successfully');
        const verifiedData = response.data as VerifiedPropertyData;
        setPropertyData(verifiedData);
        
        // Set accuracy metrics if available
        if (verifiedData.accuracyMetrics) {
          setAccuracyMetrics(verifiedData.accuracyMetrics);
        }
        
        // Set verification data
        if (verifiedData.verification) {
          setDataVerification(verifiedData.verification);
        }
        
        setRealTimeStatus('verified');
        
        // Get enhanced AI analysis with verification
        if (searchTerm.trim() && propertyType && bedrooms) {
          const criteria: PropertySearchCriteria = {
            location: searchTerm,
            propertyType, 
            bedrooms: bedrooms === 'Studio' ? 0 : parseInt(bedrooms, 10),
            floorNumber,
            unitNumber
          };
          
          try {
            console.log('🔮 Using enhanced Gemini AI for verified analysis:', criteria);
            const aiResponse = await getPropertyInfoWithScraping(criteria);
            
            if (aiResponse && aiResponse.success) {
              console.log('✅ Enhanced Gemini analysis completed successfully');
              setGeminiAnalysis(typeof aiResponse.data === 'string' ? aiResponse.data : JSON.stringify(aiResponse.data) || '');
            } else {
              console.warn('Enhanced Gemini AI warning:', aiResponse?.error);
              setGeminiAnalysis('Unable to fetch verified real-time property data at this moment. Please try again.');
            }
          } catch (aiError) {
            console.warn('Enhanced Gemini AI error:', aiError);
            setGeminiAnalysis('AI analysis temporarily unavailable.');
          }
        }
      } else {
        setError(response.error || 'Failed to fetch verified property data');
        setRealTimeStatus('error');
      }
    } catch (error) {
      console.error('❌ Enhanced property search error:', error);
      setError('Failed to search for property with verification. Please try again.');
      setRealTimeStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle selecting a nearby property
  const handleNearbyPropertySelect = async (propertyId: string) => {
    const selectedProperty = propertyData?.nearby.find(p => p.id === propertyId);
    if (!selectedProperty) return;

    setSearchTerm(selectedProperty.name); // Set search term to the selected nearby property's name
    setPropertyType(
      selectedProperty.name.toLowerCase().includes('villa') ? 'Villa' :
      selectedProperty.name.toLowerCase().includes('apartment') ? 'Apartment' :
      selectedProperty.sqft > 3000 ? 'Villa' : 'Apartment' // Basic guess
    );
    setBedrooms(selectedProperty.beds > 0 ? selectedProperty.beds.toString() : 'Studio');
    setFloorNumber(''); 
    setUnitNumber('');
    setPropertyData(null); 
    setLoading(true);
    setError(null);
    setGeminiAnalysis('');
    setChartZoom(null);
    setDeveloperDetailsExpanded(false);

    try {
      console.log('Fetching details for selected nearby property using its name as search term:', selectedProperty.name);
      const response = await backendApiService.getPropertyLookup({
        searchTerm: selectedProperty.name,
        location: selectedProperty.name,
        propertyType: selectedProperty.name.toLowerCase().includes('villa') ? 'Villa' : 'Apartment', // Infer
        bedrooms: selectedProperty.beds > 0 ? selectedProperty.beds.toString() : 'Studio',
      });
      
      if (response.success && response.data) {
        const propertyData = response.data as VerifiedPropertyData;
        setPropertyData(propertyData);
      } else {
        setError(response.error || 'Failed to fetch property data for selected property.');
      }
    } catch (err) {
      if (err instanceof Error && (err.message === 'API_KEY_MISSING' || err.message === 'API_KEY_MISSING_FOR_FALLBACK')) {
        setError('Gemini API key is not configured. Please set it up in Settings to fetch live property data.');
        setPropertyData(null);
      } else {
        setError('Failed to fetch property data for selected property.');
      }
      console.error('Error fetching selected property data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset chart zoom
  const resetChartZoom = () => {
    setChartZoom(null);
  };
  
  // Toggle developer details expansion
  const toggleDeveloperDetails = () => {
    setDeveloperDetailsExpanded(!developerDetailsExpanded);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Update price estimate when filters change
  useEffect(() => {
    const updatePriceEstimate = async () => {
      if (searchTerm.trim() && propertyType && bedrooms) { 
        setFetchingPrice(true);
        try {
          const criteria: PropertySearchCriteria = { 
            location: searchTerm,
            propertyType,
            bedrooms: bedrooms === 'Studio' ? 0 : parseInt(bedrooms, 10)
          };
          console.log('Criteria for price estimate (if API was active):', criteria);
          setPriceEstimate('Refine search for price estimate');
        } catch (err) {
          console.error('Error fetching price estimate:', err);
          setPriceEstimate('Could not fetch estimate');
        } finally {
          setFetchingPrice(false);
        }
      } else {
        setPriceEstimate('');
      }
    };

    // Debounce or delay this call if it's too frequent on type
    const timerId = setTimeout(() => {
        updatePriceEstimate();
    }, 500); // Example debounce
    
    return () => clearTimeout(timerId);

  }, [searchTerm, propertyType, bedrooms]);

  return (
    <div className="min-h-screen bg-anti-flash-white">
      <header className="bg-white shadow-sm border-b border-almond p-4">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-tuscany hover:text-tuscany/70 transition-colors">
              <FaArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-dubai-blue-900">Property Lookup</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {/* Search Bar and Filters */}

        <div className="mb-6">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Filters and Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
              {/* Search Term Input - Spans 2 columns on medium, 3 on large if filters are hidden */}
              <div className={filtersExpanded ? "md:col-span-3" : "md:col-span-3"}> {/* Always span 3 for simplicity now */}
                <label htmlFor="searchTerm" className="block text-lg font-semibold text-dubai-blue-900 mb-2">
                  Search Property
                </label>
                <div className="relative">
                  <input
                    id="searchTerm"
                    type="text"
                    className="w-full p-3 border border-almond rounded-lg focus:outline-none focus:ring-1 focus:ring-tuscany bg-white pl-10"
                    placeholder="Enter Property Name, Address, Area, e.g., Princess Tower"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Examples: "Princess Tower", "Downtown Dubai 2 bedroom", "Sheikh Zayed Road apartment with sea view"</p>
              </div>

              {/* Filter Toggle Button */}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={toggleFilters}

                  className="flex items-center gap-2 text-dubai-blue-900 hover:text-tuscany transition-colors"
                >
                  <FaFilter className="h-4 w-4" />
                  <span>{filtersExpanded ? "Hide Filters" : "Show Filters"}</span>
                </button>

                {priceEstimate && (
                  <div className="text-dubai-blue-900 flex items-center gap-2">
                    <FaTag className="h-4 w-4 text-tuscany" />
                    <span className="font-medium">
                      {fetchingPrice ? (
                        <span className="flex items-center gap-2">
                          <FaSpinner className="animate-spin h-4 w-4" /> 
                          Calculating...
                        </span>
                      ) : (
                        priceEstimate
                      )}

                    </span>
                  </div>
                )}

              </div>

              {/* Expanded Filters */}

              {filtersExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-almond/10 rounded-lg">
                  {/* Property Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dubai-blue-900 mb-1">
                      Property Type
                    </label>
                    <select
                      className="w-full p-2 border border-almond rounded-lg focus:outline-none focus:ring-1 focus:ring-tuscany bg-white"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select Type</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bedrooms Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dubai-blue-900 mb-1">
                      Bedrooms
                    </label>
                    <select
                      className="w-full p-2 border border-almond rounded-lg focus:outline-none focus:ring-1 focus:ring-tuscany bg-white"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select Bedrooms</option>
                      {bedroomOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Floor Number */}
                  <div>
                    <label className="block text-sm font-medium text-dubai-blue-900 mb-1">
                      Floor Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-almond rounded-lg focus:outline-none focus:ring-1 focus:ring-tuscany bg-white"
                      value={floorNumber}
                      onChange={(e) => setFloorNumber(e.target.value)}
                      placeholder="e.g., 15, G, M"
                      disabled={loading}
                    />
                  </div>

                  {/* Unit Number */}
                  <div>
                    <label className="block text-sm font-medium text-dubai-blue-900 mb-1">
                      Unit Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-almond rounded-lg focus:outline-none focus:ring-1 focus:ring-tuscany bg-white"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      placeholder="e.g., 1501, A, 01"
                      disabled={loading}
                    />
                  </div>

                  {/* Property Specification Display */}
                  {(floorNumber || unitNumber) && (
                    <div className="md:col-span-3">
                      <div className="bg-tuscany/10 border border-tuscany/20 rounded-lg p-3">
                        <div className="flex items-center text-sm text-dubai-blue-900">
                          <FaBuilding className="mr-2 text-tuscany" />
                          <span className="font-medium">Specific Unit: </span>
                          <span className="ml-1">
                            {floorNumber && `Floor ${floorNumber}`}
                            {floorNumber && unitNumber && ', '}
                            {unitNumber && `Unit ${unitNumber}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Search Button */}
              <button
                type="submit"
                className="bg-tuscany text-white p-3 rounded-lg hover:bg-tuscany/90 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" /> Searching...
                  </span>
                ) : (
                  'Search Property'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Real-Time Data Status and Accuracy Indicators */}
        {(realTimeStatus !== 'idle' || accuracyMetrics) && (
          <div className="mb-6 space-y-4">
            {/* Real-Time Status Indicator */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-almond p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  realTimeStatus === 'fetching' ? 'bg-yellow-500 animate-pulse' :
                  realTimeStatus === 'verified' ? 'bg-green-500' :
                  realTimeStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm font-medium text-dubai-blue-900">
                  {realTimeStatus === 'fetching' ? 'Fetching Real-Time Data...' :
                   realTimeStatus === 'verified' ? 'Data Verified from Multiple Sources' :
                   realTimeStatus === 'error' ? 'Data Verification Failed' : 'Ready to Search'}
                </span>
              </div>
              
              {accuracyMetrics && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Sources: {accuracyMetrics.sourcesCount}
                  </div>
                  <div className={`text-sm font-semibold ${
                    accuracyMetrics.overallScore >= 90 ? 'text-green-600' :
                    accuracyMetrics.overallScore >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Accuracy: {accuracyMetrics.overallScore}%
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Accuracy Metrics */}
            {accuracyMetrics && (
              <div className="bg-white rounded-lg shadow-sm border border-almond p-4">
                <h4 className="text-sm font-semibold text-dubai-blue-900 mb-3 flex items-center">
                  <FaInfoCircle className="mr-2 text-tuscany" />
                  Data Verification Details
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      accuracyMetrics.dataVerification.priceAccuracy >= 90 ? 'text-green-600' :
                      accuracyMetrics.dataVerification.priceAccuracy >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {accuracyMetrics.dataVerification.priceAccuracy}%
                    </div>
                    <div className="text-xs text-gray-600">Price Accuracy</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      accuracyMetrics.dataVerification.developerVerification >= 90 ? 'text-green-600' :
                      accuracyMetrics.dataVerification.developerVerification >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {accuracyMetrics.dataVerification.developerVerification}%
                    </div>
                    <div className="text-xs text-gray-600">Developer Verified</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      accuracyMetrics.dataVerification.locationAccuracy >= 90 ? 'text-green-600' :
                      accuracyMetrics.dataVerification.locationAccuracy >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {accuracyMetrics.dataVerification.locationAccuracy}%
                    </div>
                    <div className="text-xs text-gray-600">Location Verified</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      accuracyMetrics.dataVerification.dateAccuracy >= 90 ? 'text-green-600' :
                      accuracyMetrics.dataVerification.dateAccuracy >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {accuracyMetrics.dataVerification.dateAccuracy}%
                    </div>
                    <div className="text-xs text-gray-600">Date Accuracy</div>
                  </div>
                </div>
                
                {accuracyMetrics.sourcesUsed && accuracyMetrics.sourcesUsed.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Data Sources:</div>
                    <div className="flex flex-wrap gap-2">
                      {accuracyMetrics.sourcesUsed.map((source, index) => (
                        <span key={index} className="inline-block bg-tuscany/10 text-tuscany text-xs px-2 py-1 rounded">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Last Updated: {new Date(accuracyMetrics.lastUpdated).toLocaleString()}
                </div>
              </div>
            )}

            {/* Data Verification Warnings */}
            {dataVerification && dataVerification.conflictingData && dataVerification.conflictingData.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Data Conflicts Detected</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {dataVerification.conflictingData.map((conflict: string, index: number) => (
                        <li key={index}>• {conflict}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
            {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-tuscany mb-4" />
            <p className="text-dubai-blue-700">Fetching property information...</p>
          </div>
        )}
        
        {/* Gemini AI Analysis Display */}
        {!loading && geminiAnalysis && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm border border-purple-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-purple-200 flex items-center">
              <FaBrain className="text-purple-600 mr-2" />
              <h3 className="text-xl font-semibold text-purple-900">Gemini AI Real-Time Property Analysis</h3>
            </div>
            <div className="p-6">
              <div className="prose prose-purple max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {geminiAnalysis}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Property Content (shown after data is loaded) */}
        {!loading && propertyData && (
          <div className="space-y-6">
            {/* Property name header */}

            <h2 className="text-2xl font-bold text-dubai-blue-900">{propertyData.metadata.name}</h2>
            
            {/* Price Timeline Chart */}

            <div className="bg-beige rounded-lg shadow-sm border border-almond overflow-hidden">
              <div className="p-4 border-b border-almond flex justify-between items-center">
                <h3 className="text-xl font-semibold text-dubai-blue-900">Price Timeline</h3>
                {chartZoom && (
                  <button 
                    onClick={resetChartZoom}

                    className="text-sm text-tuscany hover:text-tuscany/70 transition-colors"
                  >
                    Reset Zoom
                  </button>
                )}

              </div>
              
              <div className="p-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={propertyData.priceHistory}

                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}

                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0dc" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: '#1e3a8a' }}

                        domain={chartZoom ? 
                          [propertyData.priceHistory[chartZoom.startIndex].year, 
                           propertyData.priceHistory[chartZoom.endIndex].year] : 
                          ['auto', 'auto']}

                      />
                      <YAxis 
                        tick={{ fill: '#1e3a8a' }}

                        tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}

                      />
                      <Tooltip 
                        formatter={(value) => [`${formatCurrency(value as number)}`, 'Valuation']}

                        labelFormatter={(label) => `Year ${label}`}

                        contentStyle={{ 
                          backgroundColor: '#f0f0dc', 
                          borderColor: '#f0dcc8',
                          borderRadius: '4px' 
                        }}

                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#c8a08c" 
                        strokeWidth={2}

                        dot={{ fill: '#c8a08c', r: 4 }}

                        activeDot={{ r: 6, fill: '#c8a08c' }}

                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Key Facts Panel */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Price - MODIFIED */}
              <div className="bg-beige rounded-lg shadow-sm border border-almond p-4">
                <div className="flex items-center mb-2">
                  <FaTag className="text-tuscany mr-2" />
                  <h4 className="text-sm font-semibold text-dubai-blue-700">Current Market Price</h4>
                </div>
                <p className="text-xl font-bold text-dubai-blue-900">
                  {propertyData.metadata.price ? formatCurrency(propertyData.metadata.price) : 'N/A'}
                </p>
              </div>
              
              {/* Accommodates */}
              <div className="bg-beige rounded-lg shadow-sm border border-almond p-4">
                <div className="flex items-center mb-2">
                  <FaHome className="text-tuscany mr-2" />
                  <h4 className="text-sm font-semibold text-dubai-blue-700">Accommodates</h4>
                </div>
                <p className="text-xl font-bold text-dubai-blue-900">
                  {propertyData.metadata.beds} beds • {propertyData.metadata.baths} baths • {propertyData.metadata.sqft.toLocaleString()} sqft
                </p>
              </div>

              {/* Developer - UNCHANGED (data source, but ensure it's after Accommodates) */}
              <div className="bg-beige rounded-lg shadow-sm border border-almond p-4">
                <div className="flex items-center mb-2">
                  <FaBuilding className="text-tuscany mr-2" />
                  <h4 className="text-sm font-semibold text-dubai-blue-700">Developer</h4>
                </div>
                {/* Assuming the button/link to developer tab is here */}
                <button 
                  className="text-xl font-bold text-dubai-blue-900 hover:text-tuscany transition-colors flex items-center"
                  onClick={() => {
                    setSelectedTab('developer');
                    // Potentially scroll to developer section or handle tab change
                    const developerSection = document.getElementById('developer-details-section');
                    if (developerSection) developerSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {propertyData.metadata.developer || 'N/A'}
                  <FaChevronRight className="ml-2 opacity-50" />
                </button>
              </div>
              
              {/* Full Address - NEW */}
              <div className="bg-beige rounded-lg shadow-sm border border-almond p-4">
                <div className="flex items-center mb-2">
                  <FaMapMarkerAlt className="text-tuscany mr-2" />
                  <h4 className="text-sm font-semibold text-dubai-blue-700">Full Address</h4>
                </div>
                <p className="text-base text-dubai-blue-900"> {/* text-base for potentially longer address */}
                  {propertyData.metadata.fullAddress || 'Address not available'}
                </p>
              </div>
            </div>
            
            {/* Tabbed Details Section */}

            <div className="bg-beige rounded-lg shadow-sm border border-almond overflow-hidden">
              {/* Tab Headers */}

              <div className="flex border-b border-almond">
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    selectedTab === 'properties' 
                      ? 'bg-white text-dubai-blue-900 border-b-2 border-tuscany' 
                      : 'text-dubai-blue-700 hover:bg-almond'
                  }`}

                  onClick={() => setSelectedTab('properties')}

                >
                  Properties
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    selectedTab === 'ongoing' 
                      ? 'bg-white text-dubai-blue-900 border-b-2 border-tuscany' 
                      : 'text-dubai-blue-700 hover:bg-almond'
                  }`}

                  onClick={() => setSelectedTab('ongoing')}

                >
                  Ongoing & Upcoming
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    selectedTab === 'developer' 
                      ? 'bg-white text-dubai-blue-900 border-b-2 border-tuscany' 
                      : 'text-dubai-blue-700 hover:bg-almond'
                  }`}

                  onClick={() => setSelectedTab('developer')}

                >
                  Developer Snapshot
                </button>
              </div>
              
              {/* Tab Content */}

              <div className="p-4">
                {/* Properties Tab */}

                {selectedTab === 'properties' && (
                  <div>
                    {/* Compact Price Chart */}

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-dubai-blue-900 mb-3">Price History</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={propertyData.priceHistory}

                            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}

                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0dc" />
                            <XAxis dataKey="year" tick={{ fill: '#1e3a8a' }} />
                            <YAxis 
                              tick={{ fill: '#1e3a8a' }}

                              tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}

                            />
                            <Tooltip 
                              formatter={(value) => [`${formatCurrency(value as number)}`, 'Price']}

                              labelFormatter={(label) => `Year ${label}`}

                            />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#c8a08c"
                              dot={{ fill: '#c8a08c', r: 3 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Historical Prices Table */}

                    <div>
                      <h4 className="text-lg font-semibold text-dubai-blue-900 mb-3">Historical Prices</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                          <thead>
                            <tr className="bg-almond">
                              <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Year</th>
                              <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Price</th>
                              <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {propertyData.priceHistory.map((point, index) => {
                              const prevPoint = index > 0 ? propertyData.priceHistory[index - 1] : null;
                              const changePercent = prevPoint 
                                ? ((point.price - prevPoint.price) / prevPoint.price * 100).toFixed(2)
                                : '-';
                              
                              return (
                                <tr key={point.year} className="border-b border-almond">
                                  <td className="py-2 px-4">{point.year}</td>
                                  <td className="py-2 px-4">{formatCurrency(point.price)}</td>
                                  <td className="py-2 px-4">
                                    {prevPoint ? (
                                      <span className={changePercent.startsWith('-') ? 'text-red-600' : 'text-green-600'}>
                                        {changePercent}%
                                      </span>
                                    ) : (
                                      '-'
                                    )}

                                  </td>
                                </tr>
                              );
                            })}

                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                
                {/* Ongoing & Upcoming Tab */}

                {selectedTab === 'ongoing' && (
                  <div>
                    <h4 className="text-lg font-semibold text-dubai-blue-900 mb-3">Projects Within 5km</h4>
                    
                    {propertyData.ongoingProjects.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                          <thead>
                            <tr className="bg-almond">
                              <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Name</th>
                              <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Status</th>
                              <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Expected Completion</th>
                              <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Developer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {propertyData.ongoingProjects.map((project) => (
                              <tr key={project.id} className="border-b border-almond">
                                <td className="py-2 px-4 font-medium text-dubai-blue-900">{project.name}</td>
                                <td className="py-2 px-4">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    project.status === 'In Ideation' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : project.status === 'Pre-Funding'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : project.status === 'Under Construction'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {project.status}

                                  </span>
                                </td>
                                <td className="py-2 px-4">{project.expectedCompletion}</td>
                                <td className="py-2 px-4">{project.developer}</td>
                              </tr>
                            ))}

                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-dubai-blue-700 italic">No ongoing projects found within 5km.</p>
                    )}

                  </div>
                )}

                
                {/* Developer Snapshot Tab */}

                {selectedTab === 'developer' && (
                  <div>
                    <div className="mb-6">
                      <table className="w-full min-w-full border border-almond">
                        <thead>
                          <tr className="bg-almond">
                            <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Developer</th>
                            <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">HQ Location</th>
                            <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Total Projects</th>
                            <th className="py-2 px-4 text-left font-semibold text-dubai-blue-900">Avg ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-almond">
                            <td className="py-3 px-4 font-medium text-dubai-blue-900">
                              {propertyData.developer.name || 'N/A'}
                              <a 
                                href={`https://${(propertyData.developer.name || '').toLowerCase().replace(/\s+/g, '')}.ae`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-tuscany hover:underline text-sm inline-flex items-center"
                              >
                                Visit Website <FaExternalLinkAlt className="ml-1 text-xs" />
                              </a>
                            </td>
                            <td className="py-3 px-4">{propertyData.developer.headquarters || 'Location not available'}</td>
                            <td className="py-3 px-4">{propertyData.developer.totalProjects || 'N/A'}</td>
                            <td className="py-3 px-4">{propertyData.developer.averageROI?.toFixed(2) || 'N/A'}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="text-center mb-4">
                      <button
                        className="px-4 py-2 bg-tuscany text-white rounded-lg hover:bg-tuscany/90 transition-colors"
                        onClick={toggleDeveloperDetails}

                      >
                        {developerDetailsExpanded ? 'Hide Details' : 'Read More'}

                      </button>
                    </div>
                    
                    {developerDetailsExpanded && (
                      <div className="mt-4 space-y-6">
                        <div>
                          <h5 className="text-lg font-semibold text-dubai-blue-900 mb-3">Revenue by Project Type (Billion AED)</h5>
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={propertyData.developer.revenueByYear}

                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}

                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="residential" name="Residential" stackId="a" fill="#8884d8" />
                                <Bar dataKey="commercial" name="Commercial" stackId="a" fill="#82ca9d" />
                                <Bar dataKey="mixedUse" name="Mixed Use" stackId="a" fill="#ffc658" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        {/* Popular Projects Section */}

                        <div>
                          <h5 className="text-lg font-semibold text-dubai-blue-900 mb-3">Popular Projects</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {generatePopularProjects(propertyData.developer.name || '').map((project, index) => (
                              <div key={index} className="bg-white border border-almond rounded-lg p-4">
                                <h6 className="font-medium text-dubai-blue-900 mb-2">{project.name}</h6>
                                <div className="text-sm text-dubai-blue-700 space-y-1">
                                  <p>Location: {project.location}</p>
                                  <p>Status: {project.status}</p>
                                  <p>Type: {project.type}</p>
                                </div>
                              </div>
                            ))}

                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
            
            {/* Nearby Properties Comparison */}

            <div className="bg-beige rounded-lg shadow-sm border border-almond overflow-hidden">
              <div className="p-4 border-b border-almond flex justify-between items-center">
                <h3 className="text-xl font-semibold text-dubai-blue-900">Nearby Properties</h3>
                {propertyData.nearby.length > 0 && (
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 bg-white rounded-full border border-almond hover:bg-almond"
                      aria-label="Scroll left"
                      onClick={() => {
                        const container = document.getElementById('nearby-properties-container');
                        if (container) {
                          container.scrollBy({ left: -300, behavior: 'smooth' });
                        }

                      }}

                    >
                      <FaChevronLeft className="text-tuscany" />
                    </button>
                    <button 
                      className="p-2 bg-white rounded-full border border-almond hover:bg-almond"
                      aria-label="Scroll right"
                      onClick={() => {
                        const container = document.getElementById('nearby-properties-container');
                        if (container) {
                          container.scrollBy({ left: 300, behavior: 'smooth' });
                        }

                      }}

                    >
                      <FaChevronRight className="text-tuscany" />
                    </button>
                  </div>
                )}

              </div>
              
              <div className="p-4">
                {propertyData.nearby.length > 0 ? (
                  <div 
                    id="nearby-properties-container"
                    className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}

                  >
                    {propertyData.nearby.map((property) => (
                      <div 
                        key={property.id}

                        className="flex-none w-64 bg-white rounded-lg shadow-sm border border-almond overflow-hidden hover:border-tuscany transition-colors cursor-pointer"
                        onClick={() => handleNearbyPropertySelect(property.id)}

                      >
                        <div className="p-4">
                          <h4 className="text-lg font-semibold text-dubai-blue-900 mb-2">{property.name}</h4>
                          {property.address && (
                            <p className="text-sm text-gray-600 mb-2">
                              📍 {property.address}
                            </p>
                          )}
                          <p className="flex items-center text-sm text-dubai-blue-700 mb-3">
                            <FaMapMarkerAlt className="mr-1 text-tuscany" />
                            {property.distance.toFixed(1)} km away
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-dubai-blue-700">Original</span>
                              <span className="font-medium">
                                {formatCurrency(property.originalPrice)} ({property.originalYear})
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-dubai-blue-700">Current</span>
                              <span className="font-medium">
                                {formatCurrency(property.currentPrice)} ({property.currentYear})
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-dubai-blue-700">Growth</span>
                              <span className="font-medium text-green-600">
                                +{calculateGrowth(property.originalPrice, property.currentPrice)}%
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-sm pt-2 border-t border-almond">
                              <span className="text-dubai-blue-700">Details</span>
                              <span className="font-medium flex items-center">
                                <FaBed className="mr-1" /> {property.beds} | 
                                <FaBath className="mx-1" /> {property.baths} | 
                                <span className="ml-1">{property.sqft.toLocaleString()} sqft</span>
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-dubai-blue-700">Developer</span>
                              <span className="font-medium text-tuscany">{property.developer}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                ) : (
                  <p className="text-dubai-blue-700 italic text-center py-4">No nearby properties found.</p>
                )}

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
