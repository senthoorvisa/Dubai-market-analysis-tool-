"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaMap, FaSearch, 
  FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaMoneyBillWave,
  FaChartLine, FaInfoCircle, FaStar, FaHome, FaChartBar,
  FaHardHat, FaFilter, FaCaretDown, FaArrowRight, FaRegHeart,
  FaHeart, FaCity
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import LuxuryAnalytics from './LuxuryAnalytics';

// Dynamically import the entire react-leaflet with no SSR
// This approach fixes chunk loading errors by ensuring all leaflet components 
// are loaded in a single chunk on the client side only
const MapWithNoSSR = dynamic(
  () => import('../map/MapComponents').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-gray-100 rounded-xl h-[600px]">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }
);

// Mock data for featured properties
const FEATURED_PROPERTIES = [
  {
    id: '1',
    name: 'Marina Luxury Penthouse',
    type: 'Penthouse',
    price: 12500000,
    location: 'Dubai Marina',
    bedrooms: 4,
    bathrooms: 5,
    size: 4500,
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    lat: 25.0750,
    lng: 55.1375,
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    description: 'Luxurious 4-bedroom penthouse with stunning marina views, private pool, and 5-star amenities.'
  },
  {
    id: '2',
    name: 'Palm Jumeirah Villa',
    type: 'Villa',
    price: 28000000,
    location: 'Palm Jumeirah',
    bedrooms: 6,
    bathrooms: 7,
    size: 8500,
    image: 'https://images.unsplash.com/photo-1600607686527-3ccd187ef08c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    lat: 25.1124,
    lng: 55.1390,
    isFeatured: true,
    isNew: true,
    rating: 5.0,
    description: 'Prestigious 6-bedroom villa with private beach access, infinity pool, and panoramic sea views.'
  },
  {
    id: '3',
    name: 'Downtown Modern Apartment',
    type: 'Apartment',
    price: 5800000,
    location: 'Downtown Dubai',
    bedrooms: 3,
    bathrooms: 4,
    size: 2800,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    lat: 25.2048,
    lng: 55.2708,
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    description: 'Elegant 3-bedroom apartment with Burj Khalifa views, premium finishes, and world-class facilities.'
  },
  {
    id: '4',
    name: 'Business Bay Executive Suite',
    type: 'Apartment',
    price: 4200000,
    location: 'Business Bay',
    bedrooms: 2,
    bathrooms: 3,
    size: 1900,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    lat: 25.1872,
    lng: 55.2735,
    isFeatured: false,
    isNew: true,
    rating: 4.5,
    description: 'Modern 2-bedroom suite with smart home technology, ideal for executives and investors.'
  }
];

// Market data for charts
const MARKET_DATA = {
  priceHistory: [
    { year: 2018, price: 1000 },
    { year: 2019, price: 950 },
    { year: 2020, price: 900 },
    { year: 2021, price: 1050 },
    { year: 2022, price: 1200 },
    { year: 2023, price: 1350 },
    { year: 2024, price: 1450 }
  ],
  propertyTypes: [
    { name: 'Apartment', value: 45 },
    { name: 'Villa', value: 25 },
    { name: 'Townhouse', value: 15 },
    { name: 'Penthouse', value: 10 },
    { name: 'Other', value: 5 }
  ],
  locationDemand: [
    { name: 'Dubai Marina', demand: 90 },
    { name: 'Downtown Dubai', demand: 85 },
    { name: 'Palm Jumeirah', demand: 80 },
    { name: 'Business Bay', demand: 75 },
    { name: 'Dubai Hills', demand: 70 }
  ]
};

export default function LuxuryDashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [budget, setBudget] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.2048, 55.2708]); // Dubai center
  const [mapZoom, setMapZoom] = useState(11);
  const [featuredProperties, setFeaturedProperties] = useState(FEATURED_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Property types
  const propertyTypes = [
    'Any Type',
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Off-Plan',
    'Commercial'
  ];

  // Define popular locations
  const popularLocations = [
    'Any Location',
    'Downtown Dubai',
    'Dubai Marina',
    'Palm Jumeirah',
    'Jumeirah Village Circle',
    'Dubai Hills Estate',
    'Business Bay',
    'Arabian Ranches',
    'Dubai Creek Harbour',
    'Jumeirah Lake Towers',
    'DAMAC Hills'
  ];
  
  // Budget ranges
  const budgetRanges = [
    'Any Budget',
    'Under 1M AED',
    '1M - 2M AED',
    '2M - 5M AED',
    '5M - 10M AED',
    'Over 10M AED'
  ];
  
  // Bedrooms options
  const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];

  const handleSearch = () => {
    console.log("Searching for properties...");
  };
  
  const toggleFavorite = (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      setFavorites(favorites.filter(id => id !== propertyId));
    } else {
      setFavorites([...favorites, propertyId]);
    }
  };
  
  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property);
    setMapCenter([property.lat, property.lng]);
    setMapZoom(14);
  };
  
  const formatCurrency = (value: number): string => {
    return `AED ${value.toLocaleString()}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-dubai-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-dubai-blue-100">
        <h1 className="text-4xl font-bold mb-8 text-center text-gold-gradient flex items-center justify-center">
          <FaHome className="mr-3 text-gold-500" />
          Dubai Property Lookup
        </h1>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-dubai-blue-800/70 backdrop-blur-sm rounded-xl border border-dubai-blue-800 p-1 flex shadow-xl">
            <button 
              onClick={() => setActiveTab('map')} 
              className={`px-6 py-3 rounded-lg flex items-center ${activeTab === 'map' 
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-dubai-blue-900 font-bold shadow-inner' 
                : 'text-white/80 hover:text-white hover:bg-dubai-blue-800/50'}`}
            >
              <FaMap className="mr-2" /> Map View
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`px-6 py-3 rounded-lg flex items-center ${activeTab === 'analytics' 
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-dubai-blue-900 font-bold shadow-inner' 
                : 'text-white/80 hover:text-white hover:bg-dubai-blue-800/50'}`}
            >
              <FaChartBar className="mr-2" /> Analytics
            </button>
            <button 
              onClick={() => setActiveTab('upcoming')} 
              className={`px-6 py-3 rounded-lg flex items-center ${activeTab === 'upcoming' 
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-dubai-blue-900 font-bold shadow-inner' 
                : 'text-white/80 hover:text-white hover:bg-dubai-blue-800/50'}`}
            >
              <FaHardHat className="mr-2" /> Upcoming
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="mb-8">
          <div className="bg-dubai-blue-800/70 backdrop-blur-sm rounded-xl border border-dubai-blue-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-dubai-blue-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center">
                <FaFilter className="mr-2 text-gold-500" /> Property Filters
              </h2>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="text-white/80 hover:text-white"
              >
                <FaCaretDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showFilters && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">Location</label>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full py-3 pl-10 pr-4 rounded-lg bg-dubai-blue-800/50 border border-dubai-blue-600 text-white focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 appearance-none"
                    >
                      {popularLocations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500" />
                  </div>
                </div>
                
                {/* Property Type Filter */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">Property Type</label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full py-3 pl-10 pr-4 rounded-lg bg-dubai-blue-800/50 border border-dubai-blue-600 text-white focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 appearance-none"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500" />
                  </div>
                </div>
                
                {/* Bedrooms Filter */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">Bedrooms</label>
                  <div className="relative">
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full py-3 pl-10 pr-4 rounded-lg bg-dubai-blue-800/50 border border-dubai-blue-600 text-white focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 appearance-none"
                    >
                      {bedroomOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <FaBed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500" />
                  </div>
                </div>
                
                {/* Budget Filter */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">Budget</label>
                  <div className="relative">
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full py-3 pl-10 pr-4 rounded-lg bg-dubai-blue-800/50 border border-dubai-blue-600 text-white focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 appearance-none"
                    >
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Search Button */}
            <div className="p-4 bg-dubai-blue-800/50 border-t border-dubai-blue-800 flex justify-end">
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-dubai-blue-900 font-bold py-3 px-6 rounded-lg flex items-center hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg hover:shadow-xl"
              >
                <FaSearch className="mr-2" /> Search Properties <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content Area based on active tab */}
        <div className="mt-4">
          {activeTab === 'map' && (
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              {/* Use the no-SSR map component wrapper */}
              <MapWithNoSSR 
                properties={featuredProperties}
                center={mapCenter}
                zoom={mapZoom}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
              />
            </div>
          )}
          
          {/* Analytics Tab Content */}
          {activeTab === 'analytics' && (
            <div className="mb-8">
              <LuxuryAnalytics />
            </div>
          )}
          
          {/* Upcoming Projects Tab Content */}
          {activeTab === 'upcoming' && (
            <div className="bg-dubai-blue-800/70 backdrop-blur-sm rounded-xl border border-dubai-blue-800 shadow-xl p-8 text-center">
              <div className="animate-pulse">
                <FaHardHat className="text-gold-500 text-5xl mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Upcoming Projects</h2>
                <p className="text-white/80">This section is under construction. Check back soon for exciting new developments!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 