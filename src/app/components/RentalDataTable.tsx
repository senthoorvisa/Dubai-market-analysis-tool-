"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FaSort, FaSortUp, FaSortDown, FaFilter, FaDownload, FaCopy, FaSpinner, 
  FaChartLine, FaInfoCircle, FaSearch, FaMapMarkerAlt, 
  FaExclamationTriangle, FaHome, FaBuilding, FaEye, FaLayerGroup, 
  FaCar, FaPhone, FaEnvelope, FaPaw, FaLocationArrow,
  FaCalendarAlt, FaChair, FaRuler, FaGlobe, FaUser, FaExternalLinkAlt
} from 'react-icons/fa';
import Link from 'next/link';
import backendApiService from '../services/backendApiService';

// Types for rental data
interface RentalListing {
  id: string;
  title: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  propertyType: string;
  location: string;
  area: string;
  furnishing: string;
  amenities: string[];
  description: string;
  images: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  developer?: string;
  yearBuilt?: number;
  parking?: number;
  balcony?: boolean;
  pets?: boolean;
  url: string;
  dateAdded: string;
  lastUpdated: string;
  source: string;
  confidence: number;
}

interface RentalFilter {
  propertyType?: string;
  bedrooms?: string;
  sizeMin?: string;
  sizeMax?: string;
  rentMin?: string;
  rentMax?: string;
  furnishing?: string;
}

interface RentalApiResponse {
  data: RentalListing[];
  totalListings: number;
  lastUpdated: string | null;
  message?: string;
}

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

const RentalDataTable = () => {
  // State for table data and loading
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newListingsCount, setNewListingsCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [totalListings, setTotalListings] = useState(0);
  
  // Data quality monitoring state
  const [dataQualityMetrics, setDataQualityMetrics] = useState<{
    totalListings: number;
    confidence: number;
    sources: string[];
    lastUpdated: string;
    dataSource: 'real-time' | 'cached' | 'fallback';
    validationPassed: number;
    validationFailed: number;
    averageResponseTime: number;
    errorRate: number;
  } | null>(null);
  
  // State for area selection
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterInputs, setShowFilterInputs] = useState(false);
  
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
  const fetchRentalListings = useCallback(async (areaToFetch?: string) => {
    const area = areaToFetch || selectedArea;
    if (!area && !searchQuery) {
      setListings([]);
      setTotalListings(0);
      setLoading(false);
      setError("Please enter a location or apply filters to see results.");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const now = Date.now();
      const apiFilters = getApiFilters();
      const startTime = performance.now();
      
      const response = await backendApiService.getRentalListings(area, apiFilters);
      
      const endTime = performance.now();
      const responseTime = (endTime - startTime) / 1000; // Convert to seconds
      
      if (response.success && response.data) {
        const rentalData = response.data as RentalApiResponse;
        setListings(rentalData.data || []);
        setTotalListings(rentalData.totalListings || 0);
        setLastFetchTime(now);
        setNewListingsCount(0); // Reset the new listings counter
        
        // Update data quality metrics
        setDataQualityMetrics({
          totalListings: rentalData.totalListings || 0,
          confidence: 0.8, // Default confidence
          sources: ['Bayut.com'], // Default sources
          lastUpdated: rentalData.lastUpdated || new Date().toISOString(),
          dataSource: 'real-time',
          validationPassed: rentalData.data?.length || 0,
          validationFailed: 0,
          averageResponseTime: responseTime,
          errorRate: 0
        });
      } else {
        setError(response.error || 'Failed to fetch rental data');
        setListings([]);
        setTotalListings(0);
      }
    } catch (err) {
      console.error('Error fetching rental data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      setListings([]);
      setTotalListings(0);
    } finally {
      setLoading(false);
    }
  }, [selectedArea, getApiFilters]);
  
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
        const count = await backendApiService.checkForNewListings(selectedArea, lastFetchTime);
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
    if (!searchQuery.trim()) {
      setError("Please enter a location to search.");
      return;
    }
    setSelectedArea(searchQuery.trim()); // Set selectedArea which triggers fetch in useEffect
    // fetchRentalListings(searchQuery.trim()); // This line is redundant due to above useEffect
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
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
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
    csvContent += "Type,Property Name,Bedrooms,Size (sqft),Rent (AED/month),Furnishing,Available Since\n";
    
    // Add data rows
    sortedListings.forEach(listing => {
      const bedrooms = listing.bedrooms === 0 ? 'Studio' : listing.bedrooms;
      const propertyName = listing.title || 'N/A';
      const row = [
        listing.propertyType,
        propertyName,
        bedrooms,
        listing.size,
        listing.rent,
        listing.furnishing,
        listing.dateAdded
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
    let tableText = "Type\tProperty Name\tBedrooms\tSize (sqft)\tRent (AED/month)\tFurnishing\tAvailable Since\n";
    
    sortedListings.forEach(listing => {
      const bedrooms = listing.bedrooms === 0 ? 'Studio' : listing.bedrooms;
      const propertyName = listing.title || 'N/A';
      const row = [
        listing.propertyType,
        propertyName,
        bedrooms,
        listing.size,
        listing.rent,
        listing.furnishing,
        listing.dateAdded
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

  return (
    <div className="bg-anti-flash-white p-1 md:p-2 rounded-lg shadow-lg">
      {/* Header and Search Section */}
      <div className="mb-4 p-4 bg-white rounded-t-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-dubai-blue-900">
              Dubai Rental Analysis | <span className="text-tuscany">Real-time Rental Data</span>
            </h2>
            <p className="text-sm text-gray-500">
              Displaying {listings.length} of {totalListings} listings for {selectedArea || 'your search'}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-3 md:mt-0">
            <button 
              onClick={() => setShowFilterInputs(!showFilterInputs)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors flex items-center"
            >
              <FaFilter className="mr-2" /> {showFilterInputs ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Enhanced Search Bar - Always Visible */}
        <div className="mt-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 shadow-sm">
            <FaMapMarkerAlt className="text-sky-600 text-xl mb-2 sm:mb-0" />
            <div className="flex-grow w-full">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="E.g., Dubai Marina, JLT, Downtown..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm text-lg"
              />
              {/* Autocomplete suggestions */}
              {searchQuery && filteredAreas.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredAreas.slice(0, 8).map((area) => (
                    <button
                      key={area}
                      onClick={() => handleAreaSelect(area)}
                      className="w-full text-left px-4 py-2 hover:bg-sky-50 border-b border-gray-100 last:border-b-0"
                    >
                      <FaMapMarkerAlt className="inline mr-2 text-sky-500" />
                      {area}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={handleManualSearch}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center shadow hover:shadow-md"
              disabled={loading || !searchQuery.trim()}
            >
              {loading && (selectedArea === searchQuery.trim() || !selectedArea && listings.length === 0) ? 
                <FaSpinner className="animate-spin mr-2" /> : 
                <FaSearch className="mr-2" />
              } 
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section - Collapsible */}
      {showFilterInputs && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-600 mb-1">Property Type</label>
              <select 
                id="propertyType"
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-tuscany focus:border-tuscany shadow-sm"
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            {/* Bedrooms */}
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-600 mb-1">Bedrooms</label>
              <select 
                id="bedrooms"
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-tuscany focus:border-tuscany shadow-sm"
              >
                <option value="">Any</option>
                {bedroomOptions.map(beds => <option key={beds} value={beds}>{beds === '5+' ? '5+ Beds' : beds}</option>)}
              </select>
            </div>
            {/* Rent Min */}
            <div>
              <label htmlFor="rentMin" className="block text-sm font-medium text-gray-600 mb-1">Min Rent (AED/Month)</label>
              <input 
                type="number"
                id="rentMin"
                placeholder="e.g., 50000"
                value={filters.rentMin}
                onChange={(e) => handleFilterChange('rentMin', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-tuscany focus:border-tuscany shadow-sm"
              />
            </div>
            {/* Rent Max */}
            <div>
              <label htmlFor="rentMax" className="block text-sm font-medium text-gray-600 mb-1">Max Rent (AED/Month)</label>
              <input 
                type="number"
                id="rentMax"
                placeholder="e.g., 150000"
                value={filters.rentMax}
                onChange={(e) => handleFilterChange('rentMax', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-tuscany focus:border-tuscany shadow-sm"
              />
            </div>
            {/* Size Min */}
            <div>
              <label htmlFor="sizeMin" className="block text-sm font-medium text-gray-600 mb-1">Min Size (sqft)</label>
              <input 
                type="number"
                id="sizeMin"
                placeholder="e.g., 500"
                value={filters.sizeMin}
                onChange={(e) => handleFilterChange('sizeMin', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-tuscany focus:border-tuscany shadow-sm"
              />
            </div>
            {/* Size Max */}
            <div>
              <label htmlFor="sizeMax" className="block text-sm font-medium text-gray-600 mb-1">Max Size (sqft)</label>
              <input 
                type="number"
                id="sizeMax"
                placeholder="e.g., 2000"
                value={filters.sizeMax}
                onChange={(e) => handleFilterChange('sizeMax', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-tuscany focus:border-tuscany shadow-sm"
              />
            </div>
            {/* Furnishing */}
            <div>
              <label htmlFor="furnishing" className="block text-sm font-medium text-gray-600 mb-1">Furnishing</label>
              <select 
                id="furnishing"
                value={filters.furnishing}
                onChange={(e) => handleFilterChange('furnishing', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-tuscany focus:border-tuscany shadow-sm"
              >
                <option value="">Any</option>
                {furnishingOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button 
                onClick={clearAllFilters}
                className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="my-3 p-3 bg-white rounded-lg shadow">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <div key={filter.key} className="flex items-center bg-tuscany/20 text-tuscany-dark text-xs px-2 py-1 rounded-full">
                <strong>{getFilterLabel(filter.key)}:</strong>&nbsp;{formatFilterValue(filter.key, filter.value)}
                <button onClick={() => removeFilter(filter.key)} className="ml-2 text-tuscany hover:text-tuscany-dark font-bold">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons: Export, Copy - More minimal look */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <p className="text-sm text-gray-600">
            {totalListings > 0 ? `Showing ${listings.length} of ${totalListings} results.` : 'No results found matching your criteria.'}
          </p>
          {loading && <FaSpinner className="animate-spin text-tuscany" />}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={exportCSV} 
            disabled={listings.length === 0}
            className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload className="mr-2" />Export CSV
          </button>
          <button 
            onClick={copyToClipboard} 
            disabled={listings.length === 0}
            className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCopy className="mr-2" />Copy Table
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && listings.length === 0 && (
        <div className="text-center py-10">
          <FaSpinner className="animate-spin text-tuscany text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading rental listings for {selectedArea || 'your search'}...</p>
        </div>
      )}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300 flex items-center">
          <FaExclamationTriangle className="mr-2" /> {error}
        </div>
      )}
      
      {/* Table Data */}
      {!loading && listings.length === 0 && !error && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <FaInfoCircle className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No rental listings found matching your filters for "{selectedArea || 'current view'}".
          </h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
          <button 
            onClick={clearAllFilters} 
            className="px-4 py-2 bg-tuscany hover:bg-tuscany-dark text-white rounded-md transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {listings.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-b-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {[
                  { key: 'propertyType', label: 'Type' },
                  { key: 'title', label: 'Property Name' },
                  { key: 'location', label: 'Full Address' },
                  { key: 'bedrooms', label: 'Bedrooms' },
                  { key: 'bathrooms', label: 'Bathrooms' },
                  { key: 'size', label: 'Size (sqft)' },
                  { key: 'rent', label: 'Rent (AED/Month)' },
                  { key: 'furnishing', label: 'Furnishing' },
                  { key: 'dateAdded', label: 'Available Since' },
                  { key: 'actions', label: 'Actions' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => requestSort(col.key as keyof RentalListing)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >
                    <div className="flex items-center">
                      {col.label}
                      {getSortIndicator(col.key as keyof RentalListing)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.propertyType === 'Apartment' ? 'bg-blue-100 text-blue-800' : listing.propertyType === 'Villa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {listing.propertyType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{listing.title}</td>
                  <td className="px-4 py-3 whitespace-normal max-w-xs text-gray-500">{listing.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">{listing.bedrooms}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">{listing.bathrooms}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">{listing.size.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-tuscany">{formatCurrency(listing.rent)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{listing.furnishing}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {listing.dateAdded ? new Date(listing.dateAdded).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                     {/* Ensure listing.id is a string or number before passing to encodeURIComponent */}
                    <Link href={`/property-data/${encodeURIComponent(listing.title || 'unknown_property')}?area=${encodeURIComponent(selectedArea)}&id=${encodeURIComponent(String(listing.id))}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                       <FaEye className="mr-1" /> View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalListings > rowsPerPage && (
        <div className="mt-6 flex justify-between items-center bg-white p-3 rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(totalListings / rowsPerPage)}
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage >= Math.ceil(totalListings / rowsPerPage)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalDataTable; 