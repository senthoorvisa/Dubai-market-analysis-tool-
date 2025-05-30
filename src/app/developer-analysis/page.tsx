'use client';

import { useState, useEffect } from 'react';
import { 
  FaBuilding, FaArrowLeft, FaExclamationTriangle, 
  FaSearch, FaChartBar, FaUsers, FaMoneyBillWave, FaStar, FaHome
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import backendApiService from '../services/backendApiService';

// TypeScript interfaces
interface RevenueBreakdown {
  year: number;
  residential: number;
  commercial: number;
  mixedUse: number;
  [key: string]: number; // Allow dynamic property access
}

interface Property {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  units?: number;
  completionYear?: number;
  value?: number;
}

interface Client {
  name: string;
  occupation: string;
  revenue: number;
}

interface DeveloperData {
  name: string;
  headquarters: string;
  founded: number;
  foundedYear?: number; // Alternative property name
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalUnits: number;
  totalValue?: number;
  marketShare: number;
  averageRating: number;
  avgROI?: number;
  clientSatisfaction?: number;
  revenueBreakdown: RevenueBreakdown[];
  properties: Property[];
  topProperties?: Property[];
  description?: string;
  website?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  topClients?: Client[];
}

interface Developer {
  name: string;
  id?: string;
}

// Use the unified backend API service instead of deleted developerService
export default function DeveloperAnalysis() {
  // Get URL query parameters
  const searchParams = useSearchParams();
  const developerFromUrl = searchParams.get('name');
  
  // State for loading and errors
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Selected developer
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>(developerFromUrl || '');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [activeChartFilter, setActiveChartFilter] = useState<string>('all');
  const [showAllProperties, setShowAllProperties] = useState<boolean>(false);
  
  // Add state for the property detail modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyDetail, setShowPropertyDetail] = useState<boolean>(false);
  
  // State for developer data
  const [developerData, setDeveloperData] = useState<DeveloperData | null>(null);

  // Popular developers list
  const [popularDevelopers, setPopularDevelopers] = useState<string[]>([
    'Emaar Properties',
    'Damac Properties',
    'Nakheel',
    'Dubai Properties',
    'Meraas',
    'Sobha Realty',
    'Azizi Developments',
    'Deyaar Development',
    'Omniyat',
    'Danube Properties'
  ]);

  // Filter chart data based on selection
  const filteredChartData = developerData?.revenueBreakdown?.map((item: RevenueBreakdown) => {
    if (activeChartFilter === 'all') return item;
    
    const filteredItem: any = { year: item.year };
    filteredItem[activeChartFilter] = item[activeChartFilter];
    return filteredItem;
  }) || [];

  // Function to fetch developer data using unified backend API
  const fetchDeveloperData = async (name: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Use unified backend API service for developer analysis
      const response = await backendApiService.getDeveloperAnalysis(name);
      
      if (response.success && response.data) {
        setDeveloperData(response.data as DeveloperData);
      } else {
        setError(response.error || 'Failed to load developer data');
      }
    } catch (err) {
      console.error('Error fetching developer data:', err);
      setError('Failed to load developer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular developers using unified backend API
  const fetchPopularDevelopers = async () => {
    try {
      const response = await backendApiService.getAllDevelopers();
      if (response.success && response.data) {
        setPopularDevelopers((response.data as Developer[]).map((dev: Developer) => dev.name));
      }
    } catch (err) {
      console.error('Error fetching popular developers:', err);
    }
  };

  useEffect(() => {
    // Set developer from URL if provided
    if (developerFromUrl) {
      setSelectedDeveloper(developerFromUrl);
      fetchDeveloperData(developerFromUrl);
    } else {
      setLoading(false);
    }
    
    // Fetch list of popular developers
    fetchPopularDevelopers();
  }, [developerFromUrl]);

  // Update data when selected developer changes
  useEffect(() => {
    if (selectedDeveloper && developerFromUrl && selectedDeveloper !== developerFromUrl) {
      fetchDeveloperData(selectedDeveloper);
    }
  }, [selectedDeveloper, developerFromUrl]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  // Add a function to handle property click
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyDetail(true);
  };

  // Add a function to close property detail
  const closePropertyDetail = () => {
    setShowPropertyDetail(false);
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="bg-anti-flash-white min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-t-2 border-b-2 border-tuscany rounded-full mb-4"></div>
          <p className="text-dubai-blue-900">Loading developer data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there was an error
  if (error && !developerData) {
    return (
      <div className="bg-anti-flash-white min-h-screen p-6">
        <div className="container mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 text-xl" />
            <div>
              <h3 className="font-bold text-red-800 text-xl">Error Loading Data</h3>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={() => fetchDeveloperData(selectedDeveloper)}
                className="mt-4 bg-tuscany text-white px-4 py-2 rounded hover:bg-tuscany/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-anti-flash-white min-h-screen p-6">
      <div className="container mx-auto">
        {/* Header */}
        <header className="bg-beige rounded-lg shadow-md p-6 mb-6 border border-almond">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-tuscany hover:text-tuscany/70 transition-colors">
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center text-dubai-blue-900">
                  <FaBuilding className="mr-3 text-tuscany" />
                  Developer Insights
                </h1>
                <p className="mt-1 text-dubai-blue-700">
                  Comprehensive analytics on Dubai\'s top property developers
                </p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="relative w-full md:w-72 mr-4">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 pl-9 rounded-lg border border-almond bg-white text-dubai-blue-900 placeholder-dubai-blue-500/50 focus:outline-none focus:ring-1 focus:ring-tuscany"
                    placeholder="Search developers..."
                    value={selectedDeveloper}
                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tuscany" />
                </div>
                
                {isSearchFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-md border border-almond">
                    {popularDevelopers
                      .filter(dev => dev.toLowerCase().includes(selectedDeveloper.toLowerCase()))
                      .map((dev, idx) => (
                        <div
                          key={idx}
                          className="p-2 hover:bg-beige cursor-pointer"
                          onClick={() => {
                            setSelectedDeveloper(dev);
                          }}
                        >
                          {dev}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              
              <button
                onClick={() => fetchDeveloperData(selectedDeveloper)}
                className="bg-tuscany text-white rounded-lg px-4 py-2 hover:bg-tuscany/90 transition-colors mr-4"
              >
                Analyze
              </button>
              
              <Link href="/" className="hidden md:flex items-center">
                <Image
                  src="/naaz-logo.svg"
                  alt="NAAZ Logo"
                  width={40}
                  height={40}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
          </div>
        </header>
        
        {/* Welcome message when no developer is selected */}
        {!developerData && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaBuilding className="text-5xl text-tuscany mb-6" />
            <h2 className="text-3xl font-bold text-dubai-blue-900 mb-3">Developer Analysis</h2>
            <p className="text-dubai-blue-700 max-w-2xl mb-8">
              Select a developer from the search field above and click the "Analyze" button to view detailed information, 
              financial performance, top properties, and market insights for Dubai's leading real estate developers.
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {popularDevelopers.slice(0, 6).map((dev, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDeveloper(dev);
                    fetchDeveloperData(dev);
                  }}
                  className="bg-white border border-almond rounded-full px-4 py-2 text-dubai-blue-900 hover:bg-beige transition-colors"
                >
                  {dev}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Developer insights content */}
        {developerData && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-6">
                <FaExclamationTriangle className="text-red-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            {/* Key Metrics Section */}
            <section className="mb-6">
              <h2 className="luxury-section-title-modern mb-4">
                <FaBuilding className="mr-2 text-tuscany" />
                Key Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Total Projects */}
                <div className="luxury-kpi-tile-modern">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-dubai-blue-700">Total Projects</div>
                    <div className="p-2 bg-white rounded-full">
                      <FaBuilding className="text-tuscany" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-dubai-blue-900">{developerData?.totalProjects || 0}</div>
                  <div className="flex items-center mt-2">
                    <div className="h-1 flex-grow bg-white rounded-full">
                      <div 
                        className="h-1 bg-tuscany rounded-full" 
                        style={{ width: `${((developerData?.totalProjects || 0) / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Total Value */}
                <div className="luxury-kpi-tile-modern">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-dubai-blue-700">Total Value (AED)</div>
                    <div className="p-2 bg-white rounded-full">
                      <FaMoneyBillWave className="text-tuscany" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-dubai-blue-900">{formatCurrency(developerData?.totalValue || 0)}</div>
                  <div className="flex items-center mt-2">
                    <div className="h-1 flex-grow bg-white rounded-full">
                      <div 
                        className="h-1 bg-tuscany rounded-full" 
                        style={{ width: `${((developerData?.totalValue || 0) / 300000000000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Average ROI */}
                <div className="luxury-kpi-tile-modern">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-dubai-blue-700">Avg ROI (%)</div>
                    <div className="p-2 bg-white rounded-full">
                      <FaChartBar className="text-tuscany" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-dubai-blue-900">{developerData?.avgROI || 0}%</div>
                  <div className="flex items-center mt-2">
                    <div className="h-1 flex-grow bg-white rounded-full">
                      <div 
                        className="h-1 bg-tuscany rounded-full" 
                        style={{ width: `${((developerData?.avgROI || 0) / 12) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Client Satisfaction */}
                <div className="luxury-kpi-tile-modern">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-dubai-blue-700">Client Satisfaction</div>
                    <div className="p-2 bg-white rounded-full">
                      <FaStar className="text-tuscany" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-dubai-blue-900">{developerData?.clientSatisfaction || 0}/5</div>
                  <div className="flex items-center mt-2">
                    <div className="h-1 flex-grow bg-white rounded-full">
                      <div 
                        className="h-1 bg-tuscany rounded-full" 
                        style={{ width: `${((developerData?.clientSatisfaction || 0) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Developer Info Card */}
              <div className="luxury-card-modern p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-dubai-blue-900 mb-2">Company Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-dubai-blue-700 w-32">Founded:</span>
                        <span className="font-medium">{developerData?.foundedYear || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-dubai-blue-700 w-32">Website:</span>
                        {developerData?.website ? (
                          <a 
                            href={developerData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-tuscany hover:underline font-medium"
                          >
                            {developerData.website.replace('https://', '')}
                          </a>
                        ) : (
                          <span className="font-medium">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dubai-blue-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-dubai-blue-700 w-32">Phone:</span>
                        {developerData?.contact?.phone ? (
                          <a 
                            href={`tel:${developerData.contact.phone}`} 
                            className="text-tuscany hover:underline font-medium"
                          >
                            {developerData.contact.phone}
                          </a>
                        ) : (
                          <span className="font-medium">N/A</span>
                        )}
                      </div>
                      <div className="flex">
                        <span className="text-dubai-blue-700 w-32">Email:</span>
                        {developerData?.contact?.email ? (
                          <a 
                            href={`mailto:${developerData.contact.email}`} 
                            className="text-tuscany hover:underline font-medium"
                          >
                            {developerData.contact.email}
                          </a>
                        ) : (
                          <span className="font-medium">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Project Revenue Breakdown */}
            <section className="mb-6">
              <h2 className="luxury-section-title-modern mb-4">
                <FaChartBar className="mr-2 text-tuscany" />
                Project Revenue Breakdown (Since {developerData?.foundedYear || 'N/A'})
              </h2>
              <div className="luxury-card-modern p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setActiveChartFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeChartFilter === 'all'
                        ? 'bg-tuscany text-white'
                        : 'bg-white text-dubai-blue-700 hover:bg-beige'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveChartFilter('residential')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeChartFilter === 'residential'
                        ? 'bg-tuscany text-white'
                        : 'bg-white text-dubai-blue-700 hover:bg-beige'
                    }`}
                  >
                    Residential
                  </button>
                  <button
                    onClick={() => setActiveChartFilter('commercial')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeChartFilter === 'commercial'
                        ? 'bg-tuscany text-white'
                        : 'bg-white text-dubai-blue-700 hover:bg-beige'
                    }`}
                  >
                    Commercial
                  </button>
                  <button
                    onClick={() => setActiveChartFilter('mixedUse')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeChartFilter === 'mixedUse'
                        ? 'bg-tuscany text-white'
                        : 'bg-white text-dubai-blue-700 hover:bg-beige'
                    }`}
                  >
                    Mixed-Use
                  </button>
                </div>
                {filteredChartData && filteredChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="year" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          label={{ 
                            value: 'Revenue (Billion AED)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 }
                          }}
                        />
                        <Tooltip
                          formatter={(value) => [`${value} Billion AED`, '']}
                          labelFormatter={(label) => `Year: ${label}`}
                        />
                        <Legend />
                        {(activeChartFilter === 'all' || activeChartFilter === 'residential') && (
                          <Bar 
                            dataKey="residential" 
                            name="Residential" 
                            fill="#9F7AEA" 
                            radius={[4, 4, 0, 0]} 
                          />
                        )}
                        {(activeChartFilter === 'all' || activeChartFilter === 'commercial') && (
                          <Bar 
                            dataKey="commercial" 
                            name="Commercial" 
                            fill="#4C9EEB" 
                            radius={[4, 4, 0, 0]} 
                          />
                        )}
                        {(activeChartFilter === 'all' || activeChartFilter === 'mixedUse') && (
                          <Bar 
                            dataKey="mixedUse" 
                            name="Mixed-Use" 
                            fill="#C8A08C" 
                            radius={[4, 4, 0, 0]} 
                          />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-dubai-blue-700">No revenue data available</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* Top Clients */}
            <section>
              <h2 className="luxury-section-title-modern mb-4">
                <FaUsers className="mr-2 text-tuscany" />
                Top Clients
              </h2>
              <div className="luxury-card-modern overflow-hidden">
                <table className="luxury-table-modern w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Occupation</th>
                      <th className="text-right">Revenue Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {developerData.topClients && developerData.topClients.map((client, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-anti-flash-white'}>
                        <td className="font-medium">{client.name}</td>
                        <td>{client.occupation}</td>
                        <td className="text-right font-medium">{formatCurrency(client.revenue)}</td>
                      </tr>
                    ))}
                    {(!developerData.topClients || developerData.topClients.length === 0) && (
                      <tr>
                        <td colSpan={3} className="text-center py-4">No client data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            
            {/* Top Properties */}
            <section className="mt-6">
              <h2 className="luxury-section-title-modern mb-4">
                <FaHome className="mr-2 text-tuscany" />
                Top Properties
              </h2>
              <div className="luxury-card-modern overflow-hidden">
                {/* First show 5 properties with a "Load More" button */}
                <div className="overflow-x-auto">
                  <table className="luxury-table-modern w-full">
                    <thead>
                      <tr>
                        <th>Property Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Completion</th>
                        <th>Units</th>
                        <th className="text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {developerData.topProperties && developerData.topProperties.slice(0, showAllProperties ? developerData.topProperties.length : 5).map((property, index) => (
                        <tr 
                          key={index} 
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-anti-flash-white'} cursor-pointer hover:bg-beige transition-colors`}
                          onClick={() => handlePropertyClick(property)}
                        >
                          <td className="font-medium">{property.name}</td>
                          <td>{property.type}</td>
                          <td>{property.location}</td>
                          <td>{property.completionYear}</td>
                          <td>{property.units?.toLocaleString() || 'N/A'}</td>
                          <td className="text-right font-medium">{property.value ? formatCurrency(property.value) : 'N/A'}</td>
                        </tr>
                      ))}
                      {(!developerData.topProperties || developerData.topProperties.length === 0) && (
                        <tr>
                          <td colSpan={6} className="text-center py-4">No property data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Load More button */}
                {developerData.topProperties && developerData.topProperties.length > 5 && (
                  <div className="p-4 flex justify-center">
                    <button
                      onClick={() => setShowAllProperties(!showAllProperties)}
                      className="bg-white border border-almond text-dubai-blue-900 px-4 py-2 rounded hover:bg-beige transition-colors"
                    >
                      {showAllProperties ? 'Show Less' : 'Load More Properties'}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Property Detail Modal */}
      {showPropertyDetail && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dubai-blue-900">{selectedProperty.name}</h2>
              <button 
                onClick={closePropertyDetail}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-dubai-blue-900 mb-3">Property Information</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Type:</span>
                      <span className="font-medium">{selectedProperty.type}</span>
                    </div>
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Location:</span>
                      <span className="font-medium">{selectedProperty.location}</span>
                    </div>
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Completion:</span>
                      <span className="font-medium">{selectedProperty.completionYear}</span>
                    </div>
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Units:</span>
                      <span className="font-medium">{selectedProperty.units?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Value:</span>
                      <span className="font-medium">{selectedProperty.value ? formatCurrency(selectedProperty.value) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dubai-blue-900 mb-3">Developer Information</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Developer:</span>
                      <span className="font-medium">{selectedDeveloper}</span>
                    </div>
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Website:</span>
                      {developerData?.website ? (
                        <a 
                          href={developerData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-tuscany hover:underline font-medium"
                        >
                          {developerData.website.replace('https://', '')}
                        </a>
                      ) : (
                        <span className="font-medium">N/A</span>
                      )}
                    </div>
                    <div className="flex">
                      <span className="text-dubai-blue-700 w-32">Contact:</span>
                      {developerData?.contact?.phone ? (
                        <a 
                          href={`tel:${developerData.contact.phone}`} 
                          className="text-tuscany hover:underline font-medium"
                        >
                          {developerData.contact.phone}
                        </a>
                      ) : (
                        <span className="font-medium">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-dubai-blue-900 mb-3">Property Details</h3>
                <div className="luxury-card-modern p-6 mb-4">
                  <p className="text-dubai-blue-700">
                    {selectedProperty.name} is a prestigious {selectedProperty.type.toLowerCase()} development located in {selectedProperty.location}. 
                    Completed in {selectedProperty.completionYear}, it features {selectedProperty.units?.toLocaleString() || 'N/A'} units and is valued at {selectedProperty.value ? formatCurrency(selectedProperty.value) : 'N/A'}.
                  </p>
                  <p className="text-dubai-blue-700 mt-2">
                    This development showcases {selectedDeveloper}'s commitment to excellence in the Dubai real estate market.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-dubai-blue-900 mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/property-lookup?search=${encodeURIComponent(selectedProperty.name)}`}
                    className="bg-tuscany text-white px-4 py-2 rounded hover:bg-tuscany/90 transition-colors inline-block"
                  >
                    View in Property Lookup
                  </a>
                  {developerData?.website && (
                    <a
                      href={developerData.website}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="bg-white border border-almond text-dubai-blue-900 px-4 py-2 rounded hover:bg-beige transition-colors inline-block"
                    >
                      Visit Developer Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 