"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FaSort, FaSortUp, FaSortDown, FaFilter, FaDownload, FaCopy, FaSpinner, 
  FaRobot, FaChartLine, FaInfoCircle, FaSearch, FaMapMarkerAlt, 
  FaExclamationTriangle, FaHome, FaBuilding, FaEye, FaLayerGroup, 
  FaCar, FaPhone, FaEnvelope, FaPaw, FaLocationArrow,
  FaCalendarAlt, FaChair, FaRuler, FaGlobe, FaUser
} from 'react-icons/fa';
import Link from 'next/link';
import rentalApiService, { RentalListing, RentalFilter } from '../services/rentalApiService';
import rentalAiService from '../services/rentalAiService';
import apiKeyService from '../services/apiKeyService';
import ApiKeyInput from './ApiKeyInput';

// Types
interface FilterState {
  propertyType: string;
  bedrooms: string;
  sizeMin: string;
  sizeMax: string;
  rentMin: string;
  rentMax: string;
  furnishing: string;
}

// Add this interface for developer information
interface DeveloperInfo {
  name: string;
  website: string;
  phone: string;
  email: string;
}

// Mock developer data (will be replaced with real API)
const DEVELOPERS: Record<string, DeveloperInfo> = {
  "Emaar Properties": {
    name: "Emaar Properties",
    website: "https://www.emaar.com",
    phone: "+971 4 366 1688",
    email: "customercare@emaar.ae"
  },
  "Damac Properties": {
    name: "Damac Properties",
    website: "https://www.damacproperties.com",
    phone: "+971 4 301 9999",
    email: "info@damacgroup.com"
  },
  "Nakheel": {
    name: "Nakheel",
    website: "https://www.nakheel.com",
    phone: "+971 4 390 3333",
    email: "info@nakheel.com"
  },
  "Dubai Properties": {
    name: "Dubai Properties",
    website: "https://www.dubaiproperties.ae",
    phone: "+971 4 873 3333",
    email: "info@dubaiproperties.ae"
  },
  "Meraas": {
    name: "Meraas",
    website: "https://www.meraas.com",
    phone: "+971 4 317 3999",
    email: "info@meraas.ae"
  },
  "Default Developer": {
    name: "Contact Agent",
    website: "https://www.naaz-properties.com",
    phone: "+971 4 000 0000",
    email: "info@naaz-properties.com"
  }
};

// Add the formatAnalysis function at the top of the file
const formatAnalysis = (analysisText: string): React.ReactNode => {
  // Simple implementation to break text into paragraphs
  return analysisText.split('\n\n').map((paragraph, idx) => (
    <p key={idx} className="mb-4">{paragraph}</p>
  ));
};

const RentalDataTable = () => {
  // State for table data and loading
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newListingsCount, setNewListingsCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [totalListings, setTotalListings] = useState(0);
  
  // State for area selection
  const [selectedArea, setSelectedArea] = useState<string>('Dubai Marina');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    propertyType: '',
    bedrooms: '',
    sizeMin: '',
    sizeMax: '',
    rentMin: '',
    rentMax: '',
    furnishing: ''
  });
  
  // State for active filters (displayed as chips)
  const [activeFilters, setActiveFilters] = useState<{key: string, value: string}[]>([]);
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: keyof RentalListing;
    direction: 'asc' | 'desc';
  }>({
    key: 'rent',
    direction: 'asc'
  });
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  
  // Popular Dubai areas for autocomplete
  const popularAreas = [
    'Dubai Marina',
    'Downtown Dubai',
    'Palm Jumeirah',
    'Jumeirah Beach Residence (JBR)',
    'Jumeirah Lake Towers (JLT)',
    'Business Bay',
    'Arabian Ranches',
    'Dubai Hills Estate',
    'Jumeirah Village Circle (JVC)',
    'Dubai Land',
    'Dubai Silicon Oasis',
    'Jumeirah',
    'Al Barsha',
    'Mirdif',
    'DIFC',
    'Dubai Sports City',
    'The Springs',
    'Dubai Creek Harbour',
    'International City',
    'Discovery Gardens'
  ];
  
  // Property types for filtering
  const propertyTypes = [
    'Apartment',
    'Villa',
    'Townhouse',
    'Office',
    'Shop',
    'Warehouse',
    'Penthouse',
    'Studio'
  ];
  
  // Bedroom options
  const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];
  
  // Furnishing options
  const furnishingOptions = ['Furnished', 'Unfurnished', 'Partially Furnished'];
  
  // State for AI analysis
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Add this state variable inside the RentalDataTable component
  const [expandedListings, setExpandedListings] = useState<Record<string, boolean>>({});
  
  // Convert filters to API-compatible format
  const getApiFilters = useCallback((): RentalFilter => {
    return {
      propertyType: filters.propertyType || undefined,
      bedrooms: filters.bedrooms || undefined,
      sizeMin: filters.sizeMin || undefined,
      sizeMax: filters.sizeMax || undefined,
      rentMin: filters.rentMin || undefined,
      rentMax: filters.rentMax || undefined,
      furnishing: filters.furnishing || undefined
    };
  }, [filters]);
  
  // Fetch rental listings
  const fetchRentalListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const now = Date.now();
      const apiFilters = getApiFilters();
      
      const response = await rentalApiService.getRentalListings(
        selectedArea,
        apiFilters,
        currentPage,
        rowsPerPage
      );
      
      setListings(response.listings);
      setTotalListings(response.total);
      setLastFetchTime(now);
      setNewListingsCount(0); // Reset the new listings counter
    } catch (err) {
      console.error('Error fetching rental listings:', err);
      setError('Failed to load rental listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedArea, filters, currentPage, getApiFilters]);
  
  // Effect to fetch data when area or filters change
  useEffect(() => {
    fetchRentalListings();
    // Reset pagination when area or filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedArea, filters]);
  
  // Effect to fetch data when page changes
  useEffect(() => {
    fetchRentalListings();
  }, [currentPage]);
  
  // Check for new listings periodically
  useEffect(() => {
    const checkNewListings = async () => {
      try {
        const count = await rentalApiService.checkForNewListings(selectedArea, lastFetchTime);
        if (count > 0) {
          setNewListingsCount(prevCount => prevCount + count);
        }
      } catch (error) {
        console.error('Error checking for new listings:', error);
      }
    };
    
    // Check every minute
    const intervalId = setInterval(checkNewListings, 60000);
    
    return () => clearInterval(intervalId);
  }, [selectedArea, lastFetchTime]);
  
  // Check if API key is configured on component mount
  useEffect(() => {
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
  }, []);
  
  // Handle API key setup
  const handleApiKeySet = (success: boolean) => {
    setIsApiKeyConfigured(success);
    if (success) {
      setShowApiKeyInput(false);
    }
  };
  
  // Handle area search/select
  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setSearchQuery(area); // Keep the search query to show selected area
    // Reset pagination when area changes
    setCurrentPage(1);
    // Trigger data fetch for the new area
    fetchRentalListings();
  };

  // Add function to handle manual search (Enter key or search button)
  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      setSelectedArea(searchQuery.trim());
      setCurrentPage(1);
      fetchRentalListings();
    }
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };
  
  // Filter out areas based on search query
  const filteredAreas = useMemo(() => {
    if (!searchQuery) return popularAreas;
    return popularAreas.filter(area => 
      area.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, popularAreas]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update active filters
    if (value) {
      // Add to active filters if not already present
      setActiveFilters(prev => {
        const existingFilter = prev.find(filter => filter.key === key);
        if (existingFilter) {
          return prev.map(filter => 
            filter.key === key ? { key, value } : filter
          );
        } else {
          return [...prev, { key, value }];
        }
      });
    } else {
      // Remove from active filters
      setActiveFilters(prev => prev.filter(filter => filter.key !== key));
    }
  };
  
  // Remove a specific filter
  const removeFilter = (key: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: ''
    }));
    
    setActiveFilters(prev => prev.filter(filter => filter.key !== key));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      propertyType: '',
      bedrooms: '',
      sizeMin: '',
      sizeMax: '',
      rentMin: '',
      rentMax: '',
      furnishing: ''
    });
    
    setActiveFilters([]);
  };
  
  // Handle sorting
  const requestSort = (key: keyof RentalListing) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorted data
  const sortedListings = useMemo(() => {
    const sortableItems = [...listings];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [listings, sortConfig]);
  
  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalListings / rowsPerPage);
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `AED ${amount.toLocaleString()}`;
  };
  
  // Get sort indicator for column headers
  const getSortIndicator = (key: keyof RentalListing) => {
    if (sortConfig.key !== key) {
      return <FaSort className="text-gray-300" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-dubai-blue" /> 
      : <FaSortDown className="text-dubai-blue" />;
  };
  
  // Export table data as CSV
  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Type,Bedrooms,Size (sqft),Rent (AED/month),Furnishing,Available Since\n";
    
    // Add data rows
    sortedListings.forEach(listing => {
      const bedrooms = listing.bedrooms === 0 ? 'Studio' : listing.bedrooms;
      const row = [
        listing.type,
        bedrooms,
        listing.size,
        listing.rent,
        listing.furnishing,
        listing.availableSince
      ].join(',');
      csvContent += row + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedArea}_rentals.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Copy table data to clipboard
  const copyToClipboard = () => {
    let tableText = "Type\tBedrooms\tSize (sqft)\tRent (AED/month)\tFurnishing\tAvailable Since\n";
    
    sortedListings.forEach(listing => {
      const bedrooms = listing.bedrooms === 0 ? 'Studio' : listing.bedrooms;
      const row = [
        listing.type,
        bedrooms,
        listing.size,
        listing.rent,
        listing.furnishing,
        listing.availableSince
      ].join('\t');
      tableText += row + "\n";
    });
    
    navigator.clipboard.writeText(tableText)
      .then(() => {
        alert('Table data copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy table data:', err);
      });
  };
  
  // Get human-readable filter label
  const getFilterLabel = (key: string): string => {
    switch (key) {
      case 'propertyType': return 'Property Type';
      case 'bedrooms': return 'Bedrooms';
      case 'sizeMin': return 'Min Size';
      case 'sizeMax': return 'Max Size';
      case 'rentMin': return 'Min Rent';
      case 'rentMax': return 'Max Rent';
      case 'furnishing': return 'Furnishing';
      default: return key;
    }
  };
  
  // Format filter value for display
  const formatFilterValue = (key: string, value: string): string => {
    if (key === 'sizeMin' || key === 'sizeMax') {
      return `${value} sqft`;
    }
    if (key === 'rentMin' || key === 'rentMax') {
      return `AED ${parseInt(value).toLocaleString()}`;
    }
    return value;
  };
  
  // Fetch AI-powered rental market analysis
  const fetchAiAnalysis = async () => {
    if (!isApiKeyConfigured) {
      setShowApiKeyInput(true);
      return;
    }
    
    setIsAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      const apiKey = apiKeyService.getStoredApiKey();
      if (!apiKey) {
        throw new Error('API key is not configured');
      }
      
      // Use the new analyzeRentalData function for better HTML formatting
      const htmlAnalysis = await rentalAiService.analyzeRentalData(
        selectedArea,
        listings,
        apiKey
      );
      
      setAiAnalysis(htmlAnalysis);
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error fetching AI rental analysis:', err);
      setAnalysisError('Failed to get AI-powered market analysis. Please try again.');
      
      // If error is related to API key, show API key input
      if (err instanceof Error && 
          (err.message.includes('API key') || err.message.includes('authentication'))) {
        setIsApiKeyConfigured(false);
        setShowApiKeyInput(true);
      }
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  // Replace getDeveloperInfo and renderDeveloperInfo functions with new amenities and listing details renderer
  const renderListingDetails = (listing: RentalListing) => {
    // Format amenities for display
    const amenitiesList = listing.amenities || [];
    const bhkConfig = listing?.bhk || (listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} BHK`);
    const furnishingStatus = listing?.furnishing || 'Unknown';
    
    return (
      <div className="mt-2 p-4 bg-white rounded-lg border border-almond">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Details */}
          <div>
            <h3 className="text-dubai-blue-900 font-medium mb-3">Property Details</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <FaRuler className="text-tuscany mr-2" />
                <span className="text-dubai-blue-800">
                  Size: <span className="font-medium">{listing.size} sqft</span>
                </span>
              </div>
              <div className="flex items-center">
                <FaHome className="text-tuscany mr-2" />
                <span className="text-dubai-blue-800">
                  Configuration: <span className="font-medium">{bhkConfig}</span>
                </span>
              </div>
              <div className="flex items-center">
                <FaChair className="text-tuscany mr-2" />
                <span className="text-dubai-blue-800">
                  Furnishing: <span className="font-medium">{furnishingStatus}</span>
                </span>
              </div>
              {listing.parkingSpaces > 0 && (
                <div className="flex items-center">
                  <FaCar className="text-tuscany mr-2" />
                  <span className="text-dubai-blue-800">
                    Parking: <span className="font-medium">{listing.parkingSpaces} {listing.parkingSpaces === 1 ? 'space' : 'spaces'}</span>
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <FaPaw className="text-tuscany mr-2" />
                <span className="text-dubai-blue-800">
                  Pet Friendly: <span className="font-medium">{listing.petFriendly ? 'Yes' : 'No'}</span>
                </span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="text-tuscany mr-2" />
                <span className="text-dubai-blue-800">
                  Available Since: <span className="font-medium">{new Date(listing.availableSince).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Contact & Amenities */}
          <div>
            <h3 className="text-dubai-blue-900 font-medium mb-3">Contact & Amenities</h3>
            <div className="flex flex-col space-y-2">
              {listing.contactName && (
                <div className="flex items-center">
                  <FaUser className="text-tuscany mr-2" />
                  <span className="text-dubai-blue-800">
                    Contact: <span className="font-medium">{listing.contactName}</span>
                  </span>
                </div>
              )}
              {listing.contactPhone && (
                <div className="flex items-center">
                  <FaPhone className="text-tuscany mr-2" />
                  <a href={`tel:${listing.contactPhone}`} className="text-dubai-blue-800 hover:text-tuscany">
                    {listing.contactPhone}
                  </a>
                </div>
              )}
              {listing.contactEmail && (
                <div className="flex items-center">
                  <FaEnvelope className="text-tuscany mr-2" />
                  <a href={`mailto:${listing.contactEmail}`} className="text-dubai-blue-800 hover:text-tuscany">
                    {listing.contactEmail}
                  </a>
                </div>
              )}
              
              {/* Original listing link */}
              {listing.link && (
                <div className="flex items-center mt-2">
                  <FaGlobe className="text-tuscany mr-2" />
                  <a 
                    href={listing.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-tuscany hover:underline font-medium"
                  >
                    View Original Listing
                  </a>
                </div>
              )}
              
              {/* Amenities */}
              {amenitiesList.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-dubai-blue-800 font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-beige border border-almond rounded-full px-2 py-1 text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {listing.description && (
          <div className="mt-4 border-t border-almond pt-3">
            <h3 className="text-dubai-blue-900 font-medium mb-2">Description</h3>
            <p className="text-dubai-blue-800 text-sm">{listing.description}</p>
          </div>
        )}
      </div>
    );
  };

  // Add this function to toggle expandable rows
  const toggleListingExpansion = (listingId: string) => {
    setExpandedListings(prev => ({
      ...prev,
      [listingId]: !prev[listingId]
    }));
  };

  return (
    <div className="bg-anti-flash-white rounded-lg shadow-md">
      {/* API Key Configuration Section */}
      {showApiKeyInput && (
        <div className="luxury-card-modern mb-6 animate-pulse">
          <div className="p-4 border-b border-almond bg-beige flex justify-between items-center">
            <h2 className="text-xl font-bold text-dubai-blue-900">API Key Configuration</h2>
            <button 
              onClick={() => setShowApiKeyInput(false)}
              className="text-dubai-blue-900/60 hover:text-dubai-blue-900"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <ApiKeyInput 
              onApiKeySet={handleApiKeySet}
              className="mb-4"
            />
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600 flex items-start">
          <FaExclamationTriangle className="mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Filters Section */}
      <div className="p-4 bg-beige rounded-t-lg border-b border-almond">
        <div className="flex flex-wrap items-end gap-4">
          {/* Property Type */}
          <div className="w-full sm:w-auto">
            <label className="block text-dubai-blue-900 text-sm font-medium mb-1">
              Property Type
            </label>
            <select 
              className="bg-white border border-almond rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-tuscany"
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Bedrooms */}
          <div className="w-full sm:w-auto">
            <label className="block text-dubai-blue-900 text-sm font-medium mb-1">
              Bedrooms
            </label>
            <select 
              className="bg-white border border-almond rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-tuscany"
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            >
              <option value="">All</option>
              {bedroomOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          {/* Size Min/Max */}
          <div className="w-full sm:w-auto">
            <label className="block text-dubai-blue-900 text-sm font-medium mb-1">
              Size (sqft)
            </label>
            <div className="flex space-x-2">
              <input 
                type="number"
                placeholder="Min"
                className="bg-white border border-almond rounded-md px-3 py-2 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-tuscany"
                value={filters.sizeMin}
                onChange={(e) => handleFilterChange('sizeMin', e.target.value)}
              />
              <input 
                type="number"
                placeholder="Max"
                className="bg-white border border-almond rounded-md px-3 py-2 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-tuscany"
                value={filters.sizeMax}
                onChange={(e) => handleFilterChange('sizeMax', e.target.value)}
              />
            </div>
          </div>
          
          {/* Rent Min/Max */}
          <div className="w-full sm:w-auto">
            <label className="block text-dubai-blue-900 text-sm font-medium mb-1">
              Rent (AED/month)
            </label>
            <div className="flex space-x-2">
              <input 
                type="number"
                placeholder="Min"
                className="bg-white border border-almond rounded-md px-3 py-2 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-tuscany"
                value={filters.rentMin}
                onChange={(e) => handleFilterChange('rentMin', e.target.value)}
              />
              <input 
                type="number"
                placeholder="Max"
                className="bg-white border border-almond rounded-md px-3 py-2 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-tuscany"
                value={filters.rentMax}
                onChange={(e) => handleFilterChange('rentMax', e.target.value)}
              />
            </div>
          </div>
          
          {/* Furnishing */}
          <div className="w-full sm:w-auto">
            <label className="block text-dubai-blue-900 text-sm font-medium mb-1">
              Furnishing
            </label>
            <select 
              className="bg-white border border-almond rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-tuscany"
              value={filters.furnishing}
              onChange={(e) => handleFilterChange('furnishing', e.target.value)}
            >
              <option value="">All</option>
              {furnishingOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          {/* Area selection */}
          <div className="w-full sm:w-auto">
            <label className="block text-dubai-blue-900 text-sm font-medium mb-1">
              Area
            </label>
            <div className="relative flex">
              <input
                type="text"
                className="bg-white border border-almond rounded-l-md pl-10 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-tuscany"
                value={searchQuery}
                onChange={handleAreaChange}
                onKeyDown={handleSearchKeyPress}
                placeholder="Search areas..."
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              
              <button
                onClick={handleManualSearch}
                className="bg-tuscany text-white px-3 py-2 rounded-r-md hover:bg-tuscany/80 transition-colors border border-tuscany"
                type="button"
              >
                Search
              </button>
              
              {/* Autocomplete dropdown */}
              {searchQuery && !popularAreas.includes(searchQuery) && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-almond top-full left-0">
                  {popularAreas
                    .filter(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((area, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-beige"
                        onClick={() => handleAreaSelect(area)}
                      >
                        {area}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div 
                key={index}
                className="bg-tuscany text-white px-2 py-1 rounded-full text-xs flex items-center"
              >
                <span>{getFilterLabel(filter.key)}: {formatFilterValue(filter.key, filter.value)}</span>
                <button 
                  onClick={() => removeFilter(filter.key)}
                  className="ml-1 rounded-full bg-white text-tuscany w-4 h-4 flex items-center justify-center leading-none hover:bg-almond transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={clearAllFilters}
              className="text-tuscany hover:text-tuscany/70 text-xs underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 bg-anti-flash-white border-b border-almond flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-dubai-blue-900 text-xl font-bold">
            Available Rental Properties
            <span className="ml-2 text-sm font-medium text-dubai-blue-600">
              {totalListings} listings
            </span>
          </h2>
          {newListingsCount > 0 && (
            <button
              onClick={fetchRentalListings}
              className="text-tuscany hover:underline text-sm font-medium mt-1"
            >
              {newListingsCount} new {newListingsCount === 1 ? 'listing' : 'listings'} available - Click to refresh
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={fetchAiAnalysis}
            className="btn-modern flex items-center text-sm"
            disabled={isAnalysisLoading || !isApiKeyConfigured}
          >
            {isAnalysisLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <FaRobot className="mr-2" />
                AI Market Analysis
              </>
            )}
          </button>
          
          <button
            onClick={exportCSV}
            className="bg-white border border-almond text-dubai-blue-900 px-3 py-1 rounded hover:bg-beige transition-colors flex items-center text-sm"
          >
            <FaDownload className="mr-1" />
            Export CSV
          </button>
          
          <button
            onClick={copyToClipboard}
            className="bg-white border border-almond text-dubai-blue-900 px-3 py-1 rounded hover:bg-beige transition-colors flex items-center text-sm"
          >
            <FaCopy className="mr-1" />
            Copy Table
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="luxury-table-modern w-full">
          <thead>
            <tr>
              <th onClick={() => requestSort('type')} className="cursor-pointer">
                Type {getSortIndicator('type')}
              </th>
              <th onClick={() => requestSort('bedrooms')} className="cursor-pointer">
                Bedrooms {getSortIndicator('bedrooms')}
              </th>
              <th onClick={() => requestSort('size')} className="cursor-pointer">
                Size (sqft) {getSortIndicator('size')}
              </th>
              <th onClick={() => requestSort('rent')} className="cursor-pointer">
                Rent (AED/month) {getSortIndicator('rent')}
              </th>
              <th onClick={() => requestSort('furnishing')} className="cursor-pointer">
                Furnishing {getSortIndicator('furnishing')}
              </th>
              <th onClick={() => requestSort('availableSince')} className="cursor-pointer">
                Available Since {getSortIndicator('availableSince')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-tuscany rounded-full mr-2"></div>
                    <span>Loading properties...</span>
                  </div>
                </td>
              </tr>
            ) : listings.length > 0 ? (
              listings.map((listing) => (
                <React.Fragment key={listing.id}>
                  <tr 
                    className={`hover:bg-beige transition-colors cursor-pointer ${expandedListings[listing.id] ? 'bg-beige' : ''}`}
                    onClick={() => toggleListingExpansion(listing.id)}
                  >
                    <td className="flex items-center">
                      <span className="mr-2">
                        {listing.type === 'Apartment' ? <FaBuilding className="text-tuscany" /> : 
                         listing.type === 'Villa' ? <FaHome className="text-tuscany" /> :
                         <FaBuilding className="text-tuscany" />}
                      </span>
                      {listing.type}
                    </td>
                    <td>{listing.bedrooms === 0 ? 'Studio' : listing.bedrooms}</td>
                    <td>{listing.size}</td>
                    <td className="font-medium">{formatCurrency(listing.rent)}</td>
                    <td>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs
                        ${listing.furnishing === 'Furnished' ? 'bg-green-100 text-green-800' : 
                          listing.furnishing === 'Unfurnished' ? 'bg-gray-100 text-gray-800' : 
                          'bg-blue-100 text-blue-800'}`
                        }>
                        <FaChair className="mr-1" /> {listing.furnishing}
                      </span>
                    </td>
                    <td className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-tuscany" />
                        {new Date(listing.availableSince).toLocaleDateString()}
                      </div>
                      <button 
                        className="text-dubai-blue-700 hover:text-tuscany"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleListingExpansion(listing.id);
                        }}
                      >
                        {expandedListings[listing.id] ? 'Hide Details' : 'Show Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedListings[listing.id] && (
                    <tr className="bg-beige">
                      <td colSpan={6} className="px-4 py-3">
                        {renderListingDetails(listing)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-dubai-blue-900/70">
                  <FaInfoCircle className="text-3xl mx-auto mb-2" />
                  <p>No rental listings found matching your filters.</p>
                  <button 
                    onClick={clearAllFilters}
                    className="text-tuscany hover:underline mt-2 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {listings.length > 0 && (
        <div className="p-4 flex justify-between items-center bg-anti-flash-white border-t border-almond">
          <div className="text-sm text-dubai-blue-900/70">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalListings)} of {totalListings} results
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white border border-almond text-dubai-blue-900 px-3 py-1 rounded disabled:opacity-50 hover:bg-beige transition-colors"
            >
              Previous
            </button>
            
            <div className="bg-white border border-almond rounded flex divide-x divide-almond">
              {[...Array(Math.min(5, Math.ceil(totalListings / rowsPerPage)))].map((_, i) => {
                // Show current page, 2 pages before and 2 pages after, if available
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 ${
                      currentPage === pageNum ? 'bg-beige font-medium' : 'hover:bg-beige/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= totalListings}
              className="bg-white border border-almond text-dubai-blue-900 px-3 py-1 rounded disabled:opacity-50 hover:bg-beige transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* AI Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="luxury-card-modern max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-almond bg-beige flex justify-between items-center">
              <h2 className="text-xl font-bold text-dubai-blue-900">AI Rental Market Analysis</h2>
              <button 
                onClick={() => setShowAnalysis(false)}
                className="text-dubai-blue-900/60 hover:text-dubai-blue-900"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              {isAnalysisLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-tuscany rounded-full mr-2"></div>
                  <p>Analyzing the rental market...</p>
                </div>
              ) : analysisError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                  <FaExclamationTriangle className="inline-block mr-2" />
                  {analysisError}
                </div>
              ) : aiAnalysis ? (
                <div className="prose max-w-none">
                  {formatAnalysis(aiAnalysis)}
                </div>
              ) : (
                <div className="text-center py-8 text-dubai-blue-900/70">
                  <FaInfoCircle className="text-3xl mx-auto mb-3" />
                  <p>No analysis available yet. Please run the AI analysis first.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-almond bg-beige flex justify-end">
              <button
                onClick={() => setShowAnalysis(false)}
                className="bg-white border border-almond text-dubai-blue-900 px-4 py-2 rounded hover:bg-beige transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalDataTable; 