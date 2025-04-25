"use client";

import { useState } from 'react';
import { Property } from '../interfaces/property';
import { getPropertyInfo } from '../services/openAiService';

interface PropertyLookupProps {
  initialLocation?: string;
}

interface SearchResult {
  summary: string;
  sources: string[];
}

interface SearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  priceRange?: string;
  amenities?: string[];
}

export default function PropertyLookup({ initialLocation = '' }: PropertyLookupProps) {
  const [location, setLocation] = useState<string>(initialLocation);
  const [propertyType, setPropertyType] = useState<string>('Apartment');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const propertyTypes = [
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Studio',
    'Office Space',
    'Retail Space',
    'Warehouse'
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    setAiAnalysis(null);
    setResults(null);
    
    // Format the criteria for the Gemini API
    const searchCriteria: SearchCriteria = {
      location: location || undefined,
      propertyType: propertyType || undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      priceRange: budget || undefined,
    };

    try {
      // Call the OpenAI API
      const response = await getPropertyInfo(searchCriteria);
      
      if (response.success && response.data) {
        setAiAnalysis(response.data);
        
        // Create a compatible format for the existing UI
        setResults({
          summary: response.data,
          sources: [
            "Dubai Land Department (dubailand.gov.ae)",
            "OpenAI Property Analysis",
            "Dubai Real Estate Market Data"
          ]
        });
      } else {
        throw new Error(response.error || 'Failed to get property information');
      }
    } catch (err) {
      let errorMessage = 'Failed to perform property search. Please try again later.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error during property search:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Dubai Property Lookup</h1>

      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
              Location
            </label>
            <input
              list="locations"
              id="location"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Downtown Dubai"
              required
            />
            <datalist id="locations">
              {popularLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-neutral-700 mb-1">
              Property Type
            </label>
            <select
              id="propertyType"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Any</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-neutral-700 mb-1">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            >
              <option value="">Any</option>
              {bedroomOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-neutral-700 mb-1">
              Budget (AED)
            </label>
            <input
              id="budget"
              type="text"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 1,500,000"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-neutral-800 text-white py-2 px-6 rounded-md hover:bg-neutral-700 transition-colors"
            disabled={loading || !location}
          >
            {loading ? 'Searching...' : 'Search Properties'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-900"></div>
          <p className="mt-2 text-neutral-600">Searching for property insights...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {!loading && searchPerformed && results && (
        <div className="mt-8">
          <div className="bg-neutral-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">AI Market Insights</h2>
            <p className="text-neutral-700 whitespace-pre-line mb-6">{results.summary}</p>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-neutral-700">Data Sources</h3>
              <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                {results.sources.map((source, index) => (
                  <li key={index}>{source}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Infrastructure Section */}
          <div className="bg-neutral-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Infrastructure Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg bg-white p-4">
                <h3 className="text-lg font-medium mb-3 text-neutral-700">Transport Infrastructure</h3>
                <ul className="space-y-3">
                  <li className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Metro Access</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">High Impact</span>
                    </div>
                    <p className="text-sm text-gray-600">Distance to nearest metro: {location.includes('Downtown') ? '500m' : location.includes('Marina') ? '350m' : '1.2km'}</p>
                  </li>
                  <li className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Road Connectivity</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">High Impact</span>
                    </div>
                    <p className="text-sm text-gray-600">Major highways: {location.includes('Downtown') ? 'Sheikh Zayed Road, Al Khail Road' : location.includes('Marina') ? 'Sheikh Zayed Road, Al Sufouh Road' : 'E311, E611'}</p>
                  </li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg bg-white p-4">
                <h3 className="text-lg font-medium mb-3 text-neutral-700">Community Infrastructure</h3>
                <ul className="space-y-3">
                  <li className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Education</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Medium Impact</span>
                    </div>
                    <p className="text-sm text-gray-600">Schools within 3km: {location.includes('Downtown') ? '2 international schools' : location.includes('Marina') ? '3 international schools' : '1 international school'}</p>
                  </li>
                  <li className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Healthcare</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Medium Impact</span>
                    </div>
                    <p className="text-sm text-gray-600">Medical facilities: {location.includes('Downtown') ? 'Dubai Hospital (5km)' : location.includes('Marina') ? 'Mediclinic (2km)' : 'Saudi German Hospital (7km)'}</p>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-3 text-neutral-700">Upcoming Projects</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{location.includes('Downtown') ? 'Downtown Transit Hub' : location.includes('Marina') ? 'Marina Tram Extension' : 'New Access Road'}</span>
                      <span className="text-sm text-gray-500">Completion: 2025</span>
                    </div>
                    <p className="text-sm text-gray-600">Expected property value impact: +4.5% upon completion</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{location.includes('Downtown') ? 'Pedestrian Bridge Network' : location.includes('Marina') ? 'Marina Waterfront Expansion' : 'Community Retail Complex'}</span>
                      <span className="text-sm text-gray-500">Completion: 2024</span>
                    </div>
                    <p className="text-sm text-gray-600">Expected property value impact: +3.2% upon completion</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Investment Insight:</strong> Properties near infrastructure developments typically see 5-15% higher value growth over a 5-year period compared to similar properties without such developments.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-neutral-600 mb-4">Need more specific property information?</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => window.open('https://www.dubai.dubizzle.com/', '_blank')}
                className="bg-neutral-200 text-neutral-800 py-2 px-4 rounded-md hover:bg-neutral-300 transition-colors"
              >
                Browse Listings
              </button>
              <button 
                onClick={() => window.open('https://dubailand.gov.ae/', '_blank')}
                className="bg-neutral-200 text-neutral-800 py-2 px-4 rounded-md hover:bg-neutral-300 transition-colors"
              >
                Check Official Data
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && searchPerformed && !results && !error && (
        <div className="text-center py-12">
          <p className="text-neutral-600">No results found. Please try a different search.</p>
        </div>
      )}
      
      {!searchPerformed && (
        <div className="text-center py-12 text-neutral-500">
          <p>Enter location details and search for property insights</p>
        </div>
      )}
    </div>
  );
}

interface PropertyDetailsProps {
  property: Property;
}

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper component for property details
const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  return (
    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800">{property.name}</h4>
        <p className="text-sm text-gray-600">{property.address}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="mb-1 text-gray-700">
            <span className="font-medium">Property Type:</span> {property.type}
          </p>
          <p className="mb-1 text-gray-700">
            <span className="font-medium">Developer:</span> {property.developerName}
          </p>
          <p className="mb-1 text-gray-700">
            <span className="font-medium">Current Price:</span> {formatCurrency(property.currentPrice)}
          </p>
          {property.soldPrice && (
            <p className="mb-1 text-gray-700">
              <span className="font-medium">Previously Sold For:</span> {formatCurrency(property.soldPrice)}
            </p>
          )}
        </div>
        <div>
          <p className="mb-1 text-gray-700">
            <span className="font-medium">Size:</span> {property.size} sq.ft.
          </p>
          {property.floor !== undefined && (
            <p className="mb-1 text-gray-700">
              <span className="font-medium">Floor:</span> {property.floor}
            </p>
          )}
          <p className="mb-1 text-gray-700">
            <span className="font-medium">Building Age:</span> {property.buildingAge} years
          </p>
          <p className="mb-1 text-gray-700">
            <span className="font-medium">Location:</span> {property.location}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <h5 className="font-medium mb-1 text-gray-700">Amenities:</h5>
        <div className="flex flex-wrap gap-2">
          {property.amenities.map((amenity, index) => (
            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              {amenity}
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{property.description}</p>
    </div>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatPeriod = (period: string): string => {
  switch (period) {
    case '6months': return '6 Months';
    case '1year': return '1 Year';
    case '2years': return '2 Years';
    case '3years': return '3 Years';
    case '5years': return '5 Years';
    default: return period;
  }
}; 