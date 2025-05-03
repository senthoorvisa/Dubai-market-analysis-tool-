"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaBuilding, FaChartLine, FaInfoCircle, FaMapMarkerAlt, FaSearch, FaHome, FaDollarSign, FaPercentage, FaExternalLinkAlt } from 'react-icons/fa';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Mock data for initial rendering - will be replaced with API calls
const SAMPLE_PROPERTIES = [
  {
    id: '1',
    name: 'Marina Luxury Penthouse',
    developer: 'Elite Builders',
    purchaseYear: 2010,
    originalPrice: 10000000,
    currentValuation: 18000000,
    location: 'Dubai Marina',
    type: 'Penthouse',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    priceHistory: [
      { year: 2010, price: 10000000 },
      { year: 2012, price: 11200000 },
      { year: 2014, price: 12500000 },
      { year: 2016, price: 14200000 },
      { year: 2018, price: 15400000 },
      { year: 2020, price: 16100000 },
      { year: 2022, price: 17200000 },
      { year: 2024, price: 18000000 },
    ]
  },
  {
    id: '2',
    name: 'Palm Jumeirah Villa',
    developer: 'Nakheel',
    purchaseYear: 2015,
    originalPrice: 15000000,
    currentValuation: 22500000,
    location: 'Palm Jumeirah',
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1600607686527-3ccd187ef08c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    priceHistory: [
      { year: 2015, price: 15000000 },
      { year: 2017, price: 16800000 },
      { year: 2019, price: 18900000 },
      { year: 2021, price: 20700000 },
      { year: 2023, price: 22100000 },
      { year: 2024, price: 22500000 },
    ]
  },
  {
    id: '3',
    name: 'Downtown Modern Apartment',
    developer: 'Emaar Properties',
    purchaseYear: 2012,
    originalPrice: 5000000,
    currentValuation: 8500000,
    location: 'Downtown Dubai',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    priceHistory: [
      { year: 2012, price: 5000000 },
      { year: 2014, price: 5500000 },
      { year: 2016, price: 6200000 },
      { year: 2018, price: 6800000 },
      { year: 2020, price: 7300000 },
      { year: 2022, price: 8000000 },
      { year: 2024, price: 8500000 },
    ]
  }
];

// Mock developers data
const DEVELOPERS = {
  'Elite Builders': {
    name: 'Elite Builders',
    logo: 'https://via.placeholder.com/150?text=Elite+Builders',
    headquarters: 'Dubai, UAE',
    totalProjects: 24,
    averageROI: 8.5,
    revenueByProjectType: [
      { year: 2020, residential: 3.2, commercial: 1.8, mixedUse: 1.0 },
      { year: 2021, residential: 3.5, commercial: 2.0, mixedUse: 1.2 },
      { year: 2022, residential: 4.0, commercial: 2.3, mixedUse: 1.5 },
      { year: 2023, residential: 4.5, commercial: 2.5, mixedUse: 1.8 }
    ]
  },
  'Nakheel': {
    name: 'Nakheel',
    logo: 'https://via.placeholder.com/150?text=Nakheel',
    headquarters: 'Dubai, UAE',
    totalProjects: 42,
    averageROI: 9.2,
    revenueByProjectType: [
      { year: 2020, residential: 4.5, commercial: 2.2, mixedUse: 1.3 },
      { year: 2021, residential: 5.0, commercial: 2.5, mixedUse: 1.5 },
      { year: 2022, residential: 5.8, commercial: 2.8, mixedUse: 1.8 },
      { year: 2023, residential: 6.5, commercial: 3.2, mixedUse: 2.0 }
    ]
  },
  'Emaar Properties': {
    name: 'Emaar Properties',
    logo: 'https://via.placeholder.com/150?text=Emaar',
    headquarters: 'Dubai, UAE',
    totalProjects: 87,
    averageROI: 10.5,
    revenueByProjectType: [
      { year: 2020, residential: 7.5, commercial: 4.2, mixedUse: 3.3 },
      { year: 2021, residential: 8.2, commercial: 4.5, mixedUse: 3.5 },
      { year: 2022, residential: 9.0, commercial: 5.0, mixedUse: 3.8 },
      { year: 2023, residential: 10.5, commercial: 5.5, mixedUse: 4.2 }
    ]
  }
};

export default function PropertyLookupRedesigned() {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState(SAMPLE_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(SAMPLE_PROPERTIES[0]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeveloperDetails, setShowDeveloperDetails] = useState(false);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate growth percentage
  const calculateGrowth = (original, current) => {
    return ((current - original) / original * 100).toFixed(2);
  };
  
  // Calculate years since purchase
  const yearsSincePurchase = (purchaseYear) => {
    return new Date().getFullYear() - purchaseYear;
  };
  
  // Fetch property data when a property is selected
  const fetchPropertyData = async (propertyId) => {
    setLoading(true);
    setError(null);
    
    try {
      // In real implementation, this would be an API call
      // For now, we'll simulate it with the sample data
      const selectedProp = SAMPLE_PROPERTIES.find(p => p.id === propertyId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSelectedProperty(selectedProp);
      
      // Fetch nearby properties based on the selected property's location
      fetchNearbyProperties(selectedProp.location);
    } catch (err) {
      setError('Failed to fetch property data. Please try again.');
      console.error('Error fetching property data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch nearby properties
  const fetchNearbyProperties = async (location) => {
    try {
      // In real implementation, this would be an API call
      // For now, we'll simulate it with filtered sample data
      const nearby = SAMPLE_PROPERTIES
        .filter(p => p.location === location && p.id !== selectedProperty.id)
        .slice(0, 6);
        
      if (nearby.length < 6) {
        // Fill with some other properties if needed
        const others = SAMPLE_PROPERTIES
          .filter(p => p.id !== selectedProperty.id && !nearby.includes(p))
          .slice(0, 6 - nearby.length);
          
        setNearbyProperties([...nearby, ...others]);
      } else {
        setNearbyProperties(nearby);
      }
    } catch (err) {
      console.error('Error fetching nearby properties:', err);
    }
  };
  
  // Handle property selection
  const handlePropertySelect = (propertyId) => {
    fetchPropertyData(propertyId);
  };
  
  // Initialize with the first property
  useEffect(() => {
    if (SAMPLE_PROPERTIES.length > 0) {
      fetchPropertyData(SAMPLE_PROPERTIES[0].id);
    }
  }, []);

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
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 pl-10 bg-white border border-almond rounded-lg focus:outline-none focus:ring-1 focus:ring-tuscany"
              placeholder="Search properties by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tuscany" />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
            {error}
          </div>
        )}
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property List */}
          <div className="lg:col-span-1">
            <div className="bg-beige rounded-lg shadow-sm border border-almond p-4 mb-6">
              <h2 className="text-xl font-semibold text-dubai-blue-900 mb-4">Properties</h2>
              <div className="space-y-3">
                {SAMPLE_PROPERTIES.map((property) => (
                  <div 
                    key={property.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProperty?.id === property.id 
                        ? 'bg-tuscany text-white' 
                        : 'bg-white hover:bg-almond'
                    }`}
                    onClick={() => handlePropertySelect(property.id)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 relative rounded-md overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-gray-200">
                          {property.image && (
                            <img 
                              src={property.image} 
                              alt={property.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{property.name}</h3>
                        <p className="text-sm opacity-80">{property.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedProperty ? (
              <div className="space-y-6">
                {/* Property Overview Section */}
                <div className="bg-beige rounded-lg shadow-sm border border-almond overflow-hidden">
                  <div className="p-4 border-b border-almond">
                    <h2 className="text-xl font-semibold text-dubai-blue-900">Property Overview</h2>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2 mb-4 md:mb-0 md:pr-4">
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          {selectedProperty.image && (
                            <img 
                              src={selectedProperty.image} 
                              alt={selectedProperty.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full md:w-1/2">
                        <h3 className="text-lg font-bold text-dubai-blue-900 mb-2">{selectedProperty.name}</h3>
                        <p className="text-dubai-blue-700 mb-4 flex items-center">
                          <FaMapMarkerAlt className="mr-1 text-tuscany" /> {selectedProperty.location}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-almond">
                            <span className="text-dubai-blue-700">Developer</span>
                            <span className="font-medium text-dubai-blue-900">{selectedProperty.developer}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-almond">
                            <span className="text-dubai-blue-700">Purchase Year</span>
                            <span className="font-medium text-dubai-blue-900">{selectedProperty.purchaseYear}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-almond">
                            <span className="text-dubai-blue-700">Original Price</span>
                            <span className="font-medium text-dubai-blue-900">{formatCurrency(selectedProperty.originalPrice)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-almond">
                            <span className="text-dubai-blue-700">Current Valuation ({new Date().getFullYear()})</span>
                            <span className="font-medium text-dubai-blue-900">{formatCurrency(selectedProperty.currentValuation)}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-dubai-blue-700">Growth</span>
                            <span className="font-medium text-green-600">
                              +{calculateGrowth(selectedProperty.originalPrice, selectedProperty.currentValuation)}% over {yearsSincePurchase(selectedProperty.purchaseYear)} years
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price Trend Graph */}
                <div className="bg-beige rounded-lg shadow-sm border border-almond overflow-hidden">
                  <div className="p-4 border-b border-almond">
                    <h2 className="text-xl font-semibold text-dubai-blue-900">Price Trend</h2>
                  </div>
                  
                  <div className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={selectedProperty.priceHistory}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c8a08c" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#c8a08c" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0dc" />
                          <XAxis 
                            dataKey="year" 
                            tick={{ fill: '#1e3a8a' }}
                          />
                          <YAxis 
                            tick={{ fill: '#1e3a8a' }}
                            tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                          />
                          <Tooltip 
                            formatter={(value) => [`${formatCurrency(value)}`, 'Valuation']}
                            labelFormatter={(label) => `Year ${label}`}
                            contentStyle={{ 
                              backgroundColor: '#f0f0dc', 
                              borderColor: '#f0dcc8',
                              borderRadius: '4px' 
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#c8a08c" 
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Developer Information Panel */}
                <div className="bg-beige rounded-lg shadow-sm border border-almond overflow-hidden">
                  <div className="p-4 border-b border-almond">
                    <h2 className="text-xl font-semibold text-dubai-blue-900">Developer Information</h2>
                  </div>
                  
                  <div className="p-4">
                    {selectedProperty.developer && DEVELOPERS[selectedProperty.developer] && (
                      <div>
                        <div className="flex flex-col md:flex-row items-center md:items-start">
                          <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0 mb-4 md:mb-0">
                            <img 
                              src={DEVELOPERS[selectedProperty.developer].logo}
                              alt={DEVELOPERS[selectedProperty.developer].name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="md:ml-4 flex-grow">
                            <h3 className="text-lg font-bold text-dubai-blue-900 mb-2">{DEVELOPERS[selectedProperty.developer].name}</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-dubai-blue-700 text-sm">Headquarters</span>
                                <p className="font-medium text-dubai-blue-900">
                                  {DEVELOPERS[selectedProperty.developer].headquarters}
                                </p>
                              </div>
                              
                              <div>
                                <span className="text-dubai-blue-700 text-sm">Total Projects</span>
                                <p className="font-medium text-dubai-blue-900">
                                  {DEVELOPERS[selectedProperty.developer].totalProjects}
                                </p>
                              </div>
                              
                              <div>
                                <span className="text-dubai-blue-700 text-sm">Average ROI</span>
                                <p className="font-medium text-dubai-blue-900">
                                  {DEVELOPERS[selectedProperty.developer].averageROI}%
                                </p>
                              </div>
                              
                              <div>
                                <button
                                  onClick={() => setShowDeveloperDetails(!showDeveloperDetails)}
                                  className="text-tuscany hover:underline text-sm flex items-center"
                                >
                                  {showDeveloperDetails ? 'Hide Details' : 'Read More'}
                                  <FaExternalLinkAlt className="ml-1 text-xs" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Developer Revenue Chart (conditionally rendered) */}
                        {showDeveloperDetails && (
                          <div className="mt-6 pt-6 border-t border-almond">
                            <h4 className="text-md font-medium text-dubai-blue-900 mb-4">Revenue by Project Type (Billion AED)</h4>
                            <div className="h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={DEVELOPERS[selectedProperty.developer].revenueByProjectType}
                                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0dc" />
                                  <XAxis dataKey="year" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="residential" name="Residential" fill="#8884d8" stackId="a" />
                                  <Bar dataKey="commercial" name="Commercial" fill="#82ca9d" stackId="a" />
                                  <Bar dataKey="mixedUse" name="Mixed Use" fill="#ffc658" stackId="a" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Nearby Properties Comparison */}
                <div className="bg-beige rounded-lg shadow-sm border border-almond overflow-hidden">
                  <div className="p-4 border-b border-almond">
                    <h2 className="text-xl font-semibold text-dubai-blue-900">Nearby Properties</h2>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {SAMPLE_PROPERTIES.filter(p => p.id !== selectedProperty.id).slice(0, 6).map((property) => (
                        <div 
                          key={property.id}
                          className="bg-white rounded-lg shadow-sm border border-almond overflow-hidden cursor-pointer hover:border-tuscany transition-colors"
                          onClick={() => handlePropertySelect(property.id)}
                        >
                          <div className="h-32 relative">
                            <img 
                              src={property.image} 
                              alt={property.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-medium text-dubai-blue-900 mb-1">{property.name}</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-dubai-blue-700">Original</span>
                                <span>{formatCurrency(property.originalPrice)} ({property.purchaseYear})</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-dubai-blue-700">Current</span>
                                <span>{formatCurrency(property.currentValuation)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-dubai-blue-700">Growth</span>
                                <span className="text-green-600">
                                  +{calculateGrowth(property.originalPrice, property.currentValuation)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-beige rounded-lg shadow-sm border border-almond p-8 text-center">
                <FaBuilding className="mx-auto text-5xl text-tuscany/30 mb-4" />
                <p className="text-dubai-blue-700">Select a property to view detailed information</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 