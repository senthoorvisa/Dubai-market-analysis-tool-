"use client";

import { useState, useEffect, useRef } from 'react';
import { Property, UpcomingProject, OngoingProject } from '../interfaces/property';
import { getPropertyInfo } from '../services/openAiService';
import ApiKeyInput from './ApiKeyInput';
import apiKeyService from '../services/apiKeyService';
import propertyDataService from '../services/propertyDataService';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { 
  FaBuilding, FaMap, FaClock, FaHardHat, FaFilter, FaSearch, 
  FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaMoneyBillWave,
  FaChartLine, FaInfoCircle, FaStar, FaCity, FaRegHeart, FaHeart,
  FaHome, FaCaretDown, FaCaretUp, FaAngleRight, FaExclamationTriangle, FaKey,
  FaTable, FaNetworkWired, FaHistory, FaLocationArrow
} from 'react-icons/fa';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Import Leaflet icon
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyLookupProps {
  initialLocation?: string;
}

interface SearchResult {
  summary: string;
  sources: string[];
}

// Search criteria interface for API calls
interface SearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  priceRange?: string;
  amenities?: string[];
}

// New interface for timeline data points
interface TimelinePoint {
  year: number;
  price: number;
}

// Developer interface
interface Developer {
  name: string;
  logo: string;
  headquarters: string;
  totalProjects: number;
  averageROI: number;
  qualityRating: number;
  timelineReliability: number;
  notableProjects: NotableProject[];
  revenueBreakdown: RevenuePoint[];
}

interface NotableProject {
  name: string;
  location: string;
  description: string;
  image: string;
}

interface RevenuePoint {
  year: number;
  residential: number;
  commercial: number;
  mixedUse: number;
}

// Nearby property interface
interface NearbyProperty {
  id: string;
  name: string;
  price: number;
  distance: number;
  image: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
}

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
    developer: 'Emaar Properties',
    constructionYear: 2019,
    priceTimeline: [
      { year: 2019, price: 11000000 },
      { year: 2020, price: 11200000 },
      { year: 2021, price: 11800000 },
      { year: 2022, price: 12200000 },
      { year: 2023, price: 12500000 },
    ]
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
    developer: 'Nakheel',
    constructionYear: 2021,
    priceTimeline: [
      { year: 2021, price: 25000000 },
      { year: 2022, price: 26500000 },
      { year: 2023, price: 28000000 },
    ]
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
    developer: 'Emaar Properties',
    constructionYear: 2018,
    priceTimeline: [
      { year: 2018, price: 4500000 },
      { year: 2019, price: 4800000 },
      { year: 2020, price: 4600000 },
      { year: 2021, price: 5000000 },
      { year: 2022, price: 5400000 },
      { year: 2023, price: 5800000 },
    ]
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
    developer: 'DAMAC Properties',
    constructionYear: 2020,
    priceTimeline: [
      { year: 2020, price: 3800000 },
      { year: 2021, price: 3900000 },
      { year: 2022, price: 4000000 },
      { year: 2023, price: 4200000 },
    ]
  }
];

// Mock nearby properties
const NEARBY_PROPERTIES = [
  {
    id: '5',
    name: 'Marina View Apartment',
    price: 6800000,
    distance: 0.4,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3.5,
    size: 2200
  },
  {
    id: '6',
    name: 'Marina Quays West',
    price: 8500000,
    distance: 0.6,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 4,
    size: 2800
  },
  {
    id: '7',
    name: 'Marina Gate Penthouse',
    price: 14200000,
    distance: 0.8,
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 5,
    size: 4200
  },
  {
    id: '8',
    name: 'Marina Pearl Tower',
    price: 9800000,
    distance: 1.2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3.5,
    size: 3100
  },
  {
    id: '9',
    name: 'Marina Waterfront Villa',
    price: 18500000,
    distance: 1.5,
    image: 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'Villa',
    bedrooms: 5,
    bathrooms: 6,
    size: 6200
  },
];

// Mock upcoming projects
const UPCOMING_PROJECTS = [
  {
    id: 'up1',
    name: 'Marina Heights Tower',
    developer: 'Emaar Properties',
    location: 'Dubai Marina',
    expectedCompletion: '2025',
    status: 'Pre-Construction',
    priceRange: '5,000,000 - 15,000,000 AED',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    details: 'Luxury waterfront development with panoramic views',
    projectType: 'Residential'
  },
  {
    id: 'up2',
    name: 'Burj Vista Residences',
    developer: 'DAMAC Properties',
    location: 'Downtown Dubai',
    expectedCompletion: '2026',
    status: 'Planning',
    priceRange: '8,000,000 - 25,000,000 AED',
    image: 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    details: 'Ultra-luxury apartments with Burj Khalifa views',
    projectType: 'Mixed-Use'
  },
  {
    id: 'up3',
    name: 'Creek Horizon',
    developer: 'Emaar Properties',
    location: 'Dubai Creek Harbour',
    expectedCompletion: '2025',
    status: 'Pre-Sales',
    priceRange: '3,000,000 - 9,000,000 AED',
    image: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    details: 'Waterfront apartments with stunning creek views',
    projectType: 'Residential'
  },
];

// Mock ongoing projects
const ONGOING_PROJECTS = [
  {
    id: 'on1',
    name: 'Dubai Hills Mansion',
    developer: 'Emaar Properties',
    location: 'Dubai Hills Estate',
    completionPercentage: 65,
    expectedCompletion: 'Q4 2024',
    status: 'Under Construction',
    priceRange: '12,000,000 - 28,000,000 AED',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    details: 'Exclusive mansions set within a lush golf community',
    projectType: 'Residential'
  },
  {
    id: 'on2',
    name: 'Bluewaters Residences',
    developer: 'Meraas',
    location: 'Bluewaters Island',
    completionPercentage: 80,
    expectedCompletion: 'Q2 2024',
    status: 'Interior Finishing',
    priceRange: '5,000,000 - 15,000,000 AED',
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    details: 'Premium apartments on Dubai\'s newest island destination',
    projectType: 'Mixed-Use'
  },
];

// Mock developer data
const DEVELOPER_DATA = {
  "Emaar Properties": {
    name: "Emaar Properties",
    logo: "https://logo.clearbit.com/emaar.com",
    headquarters: "Dubai, UAE",
    totalProjects: 87,
    averageROI: 9.7,
    qualityRating: 4.8,
    timelineReliability: 4.5,
    notableProjects: [
      {
        name: "Burj Khalifa",
        location: "Downtown Dubai",
        description: "World's tallest building with luxury residences",
        image: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Dubai Mall",
        location: "Downtown Dubai",
        description: "World's largest shopping and entertainment destination",
        image: "https://images.unsplash.com/photo-1582650086889-e1338bb757df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Dubai Creek Tower",
        location: "Dubai Creek Harbour",
        description: "Iconic observation tower with 360° views",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ],
    revenueBreakdown: [
      { year: 2020, residential: 3.2, commercial: 2.1, mixedUse: 1.5 },
      { year: 2021, residential: 3.8, commercial: 1.9, mixedUse: 1.7 },
      { year: 2022, residential: 4.5, commercial: 2.3, mixedUse: 2.0 },
      { year: 2023, residential: 5.2, commercial: 2.8, mixedUse: 2.4 }
    ]
  },
  "Nakheel": {
    name: "Nakheel",
    logo: "https://logo.clearbit.com/nakheel.com",
    headquarters: "Dubai, UAE",
    totalProjects: 65,
    averageROI: 8.5,
    qualityRating: 4.5,
    timelineReliability: 4.2,
    notableProjects: [
      {
        name: "Palm Jumeirah",
        location: "Coastal Dubai",
        description: "Iconic palm-shaped island with luxury villas and hotels",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "The World Islands",
        location: "Coastal Dubai",
        description: "Exclusive man-made archipelago shaped like a world map",
        image: "https://images.unsplash.com/photo-1512344459579-a8a326d44ee4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ],
    revenueBreakdown: [
      { year: 2020, residential: 2.8, commercial: 1.5, mixedUse: 1.2 },
      { year: 2021, residential: 3.1, commercial: 1.6, mixedUse: 1.3 },
      { year: 2022, residential: 3.7, commercial: 1.8, mixedUse: 1.5 },
      { year: 2023, residential: 4.2, commercial: 2.0, mixedUse: 1.8 }
    ]
  },
  "DAMAC Properties": {
    name: "DAMAC Properties",
    logo: "https://logo.clearbit.com/damacproperties.com",
    headquarters: "Dubai, UAE",
    totalProjects: 45,
    averageROI: 7.8,
    qualityRating: 4.2,
    timelineReliability: 4.0,
    notableProjects: [
      {
        name: "DAMAC Towers",
        location: "Business Bay",
        description: "Luxury towers with branded residences",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ],
    revenueBreakdown: [
      { year: 2020, residential: 1.8, commercial: 0.9, mixedUse: 0.7 },
      { year: 2021, residential: 2.1, commercial: 1.0, mixedUse: 0.8 },
      { year: 2022, residential: 2.5, commercial: 1.2, mixedUse: 0.9 },
      { year: 2023, residential: 2.9, commercial: 1.4, mixedUse: 1.1 }
    ]
  },
  "Meraas": {
    name: "Meraas",
    logo: "https://logo.clearbit.com/meraas.com",
    headquarters: "Dubai, UAE",
    totalProjects: 30,
    averageROI: 8.9,
    qualityRating: 4.7,
    timelineReliability: 4.4,
    notableProjects: [
      {
        name: "Bluewaters Island",
        location: "Jumeirah Beach Residence",
        description: "Island destination with residential and leisure offerings",
        image: "https://images.unsplash.com/photo-1578373493762-31a37aa7ac6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ],
    revenueBreakdown: [
      { year: 2020, residential: 1.5, commercial: 1.2, mixedUse: 0.9 },
      { year: 2021, residential: 1.8, commercial: 1.4, mixedUse: 1.1 },
      { year: 2022, residential: 2.3, commercial: 1.6, mixedUse: 1.3 },
      { year: 2023, residential: 2.7, commercial: 1.9, mixedUse: 1.5 }
    ]
  }
};

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

// Custom marker icon
const createCustomIcon = (isFeatured = false) => {
  return new L.Icon({
    iconUrl: isFeatured 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export default function PropertyLookup({ initialLocation = '' }: PropertyLookupProps) {
  const [location, setLocation] = useState<string>(initialLocation);
  const [propertyType, setPropertyType] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  
  // Projects data
  const [upcomingProjects, setUpcomingProjects] = useState<UpcomingProject[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<OngoingProject[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'upcoming' | 'ongoing'>('map');
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  
  // New state variables for enhanced UI
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.2048, 55.2708]); // Dubai center
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [featuredProperties, setFeaturedProperties] = useState(FEATURED_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [marketData, setMarketData] = useState(MARKET_DATA);

  // Define property types
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

  useEffect(() => {
    // Check if API key is configured on component mount
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
    
    // Load projects data if API key is configured
    if (hasApiKey) {
      fetchProjectsData();
    }
  }, []);

  const handleApiKeySet = (success: boolean) => {
    setIsApiKeyConfigured(success);
    if (success) {
      setShowApiKeyInput(false);
    }
  };

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };
  
  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property);
    setMapCenter([property.lat, property.lng]);
    setMapZoom(15);
  };
  
  const resetMapView = () => {
    setMapCenter([25.2048, 55.2708]);
    setMapZoom(11);
    setSelectedProperty(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    setAiAnalysis(null);
    setResults(null);
    
    // Check if API key is configured
    if (!isApiKeyConfigured) {
      setShowApiKeyInput(true);
      setLoading(false);
      setError('Please configure your OpenAI API key to perform property searches');
      return;
    }
    
    // Format the criteria for the API
    const searchCriteria: SearchCriteria = {
      location: location && location !== 'Any Location' ? location : undefined,
      propertyType: propertyType && propertyType !== 'Any Type' ? propertyType : undefined,
      bedrooms: bedrooms && bedrooms !== 'Any' ? parseInt(bedrooms, 10) : undefined,
      priceRange: budget && budget !== 'Any Budget' ? budget : undefined,
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
      
      // If error is related to API key, show API key input
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        setIsApiKeyConfigured(false);
        setShowApiKeyInput(true);
      }
      
      console.error('Error during property search:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to format the analysis with line breaks
  const formatAnalysis = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className={`mb-2 ${line.trim().startsWith('#') ? 'font-bold text-lg mt-4' : ''}`}>
        {line}
      </p>
    ));
  };

  // Fetch upcoming and ongoing projects
  const fetchProjectsData = async (locationFilter: string = '') => {
    if (!isApiKeyConfigured) return;
    
    setIsLoadingProjects(true);
    
    try {
      const [upcomingData, ongoingData] = await Promise.all([
        propertyDataService.getUpcomingProjects(locationFilter),
        propertyDataService.getOngoingProjects(locationFilter)
      ]);
      
      setUpcomingProjects(upcomingData);
      setOngoingProjects(ongoingData);
    } catch (err) {
      console.error('Error fetching projects data:', err);
      setError('Failed to load projects data. Please try again.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  return (
    <div className="re-dashboard">
      <div className="re-dashboard-container">
        {/* Header and API Key Configuration */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gold-gradient">Dubai Property Market Explorer</h1>
          
          {!isApiKeyConfigured && (
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="bg-gold-500/20 hover:bg-gold-500/30 text-gold-500 px-4 py-2 rounded-lg flex items-center"
            >
              <FaKey className="mr-2" /> Configure API
            </button>
          )}
        </div>
        
        {showApiKeyInput && (
          <div className="re-card mb-6 animate-float">
            <div className="re-card-header">
              <h2 className="text-xl font-bold">API Key Configuration</h2>
              <button 
                onClick={() => setShowApiKeyInput(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="re-card-body">
              <ApiKeyInput 
                onApiKeySet={handleApiKeySet}
                className="mb-4"
              />
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 text-white flex items-start">
            <FaExclamationTriangle className="text-red-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-400">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="re-card sticky top-6">
              <div className="re-card-header">
                <h2 className="text-xl font-bold">Search Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-white/60 hover:text-white"
                >
                  {showFilters ? <FaCaretUp /> : <FaCaretDown />}
                </button>
              </div>
              
              <div className={`re-card-body ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-white/60 mb-1 text-sm">Location</label>
                    <select
                      className="re-filter-dropdown"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      {popularLocations.map((loc, index) => (
                        <option key={index} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 mb-1 text-sm">Property Type</label>
                    <select
                      className="re-filter-dropdown"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      {propertyTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 mb-1 text-sm">Bedrooms</label>
                    <select
                      className="re-filter-dropdown"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                    >
                      {bedroomOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 mb-1 text-sm">Budget</label>
                    <select
                      className="re-filter-dropdown"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      {budgetRanges.map((range, index) => (
                        <option key={index} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="re-search-btn w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-dubai-blue-900 border-t-transparent rounded-full mr-2"></div>
                        Searching...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FaSearch className="mr-2" /> Search Properties
                      </div>
                    )}
                  </button>
                </form>
                
                {/* Market Stats */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-bold mb-4">Market Insights</h3>
                  
                  <div className="space-y-3">
                    <div className="re-stat-card">
                      <span className="re-stat-label">Average Price/sqft</span>
                      <span className="re-stat-value text-gold-500">AED 1,450</span>
                    </div>
                    
                    <div className="re-stat-card">
                      <span className="re-stat-label">YoY Growth</span>
                      <span className="re-stat-value text-green-400">+8.5%</span>
                    </div>
                    
                    <div className="re-stat-card">
                      <span className="re-stat-label">Monthly Transactions</span>
                      <span className="re-stat-value">4,230</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex mb-4 border-b border-white/10">
              <div 
                className={`re-tab ${activeTab === 'map' ? 're-tab-active' : ''}`}
                onClick={() => setActiveTab('map')}
              >
                <FaMap className="inline mr-2" /> Map View
              </div>
              <div 
                className={`re-tab ${activeTab === 'analytics' ? 're-tab-active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <FaChartLine className="inline mr-2" /> Analytics
              </div>
              <div 
                className={`re-tab ${activeTab === 'upcoming' ? 're-tab-gold-active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                <FaClock className="inline mr-2" /> Upcoming Projects
              </div>
              <div 
                className={`re-tab ${activeTab === 'ongoing' ? 're-tab-active' : ''}`}
                onClick={() => setActiveTab('ongoing')}
              >
                <FaHardHat className="inline mr-2" /> Ongoing Projects
              </div>
            </div>

            {/* Map View */}
            {activeTab === 'map' && (
              <>
                <div className="re-card mb-6">
                  <div className="re-card-header">
                    <h2 className="text-xl font-bold">Property Map</h2>
                    {mapZoom > 12 && (
                      <button
                        onClick={resetMapView}
                        className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg"
                      >
                        Reset View
                      </button>
                    )}
                  </div>
                  <div className="re-card-body p-0">
                    <div className="re-map-container">
                      {typeof window !== 'undefined' && (
                        <MapContainer 
                          center={mapCenter} 
                          zoom={mapZoom} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          
                          {featuredProperties.map((property) => (
                            <Marker 
                              key={property.id}
                              position={[property.lat, property.lng]}
                              icon={createCustomIcon(property.isFeatured)}
                            >
                              <Popup className="re-marker-popup">
                                <div className="flex flex-col">
                                  <div className="font-bold mb-1">{property.name}</div>
                                  <div className="text-gold-500 font-bold mb-2">{formatCurrency(property.price)}</div>
                                  <div className="text-sm text-white/60 mb-2">
                                    <FaMapMarkerAlt className="inline mr-1" /> {property.location}
                                  </div>
                                  <div className="flex text-sm text-white/60 mb-2 space-x-3">
                                    <span><FaBed className="inline mr-1" /> {property.bedrooms}</span>
                                    <span><FaBath className="inline mr-1" /> {property.bathrooms}</span>
                                    <span><FaRuler className="inline mr-1" /> {property.size} sqft</span>
                                  </div>
                                  <button 
                                    className="bg-gold-500 text-dubai-blue-900 px-2 py-1 rounded text-sm font-bold mt-1"
                                    onClick={() => handlePropertySelect(property)}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Featured Properties */}
                <div className="re-card-gold mb-6">
                  <div className="re-card-header">
                    <h2 className="text-xl font-bold text-gold-500">
                      <FaStar className="inline mr-2" /> Featured Properties
                    </h2>
                  </div>
                  <div className="re-card-body p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {featuredProperties.filter(p => p.isFeatured).map((property) => (
                        <div 
                          key={property.id}
                          className="re-property-card cursor-pointer"
                          onClick={() => handlePropertySelect(property)}
                        >
                          <div className="relative">
                            <div className="re-property-image bg-dubai-blue-800/50">
                              {/* Fallback image if next/image fails */}
                              <img 
                                src={property.image} 
                                alt={property.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <button 
                              className="absolute top-2 right-2 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(property.id);
                              }}
                            >
                              {favorites.includes(property.id) ? (
                                <FaHeart className="text-red-500" />
                              ) : (
                                <FaRegHeart className="text-white" />
                              )}
                            </button>
                            {property.isNew && (
                              <div className="absolute top-2 left-2 re-badge re-badge-new">New</div>
                            )}
                          </div>
                          <div className="re-property-content">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-white">{property.name}</h3>
                              <div className="flex items-center">
                                <FaStar className="text-gold-500 mr-1" />
                                <span className="text-sm">{property.rating}</span>
                              </div>
                            </div>
                            <div className="re-property-price-gold mb-2">{formatCurrency(property.price)}</div>
                            <div className="re-property-location mb-2">
                              <FaMapMarkerAlt className="mr-1" /> {property.location}
                            </div>
                            <div className="flex text-sm text-white/60 space-x-3 mb-2">
                              <span><FaBed className="inline mr-1" /> {property.bedrooms}</span>
                              <span><FaBath className="inline mr-1" /> {property.bathrooms}</span>
                              <span><FaRuler className="inline mr-1" /> {property.size} sqft</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Analytics View */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="re-card">
                  <div className="re-card-header">
                    <h2 className="text-xl font-bold">Price Trends (AED/sqft)</h2>
                  </div>
                  <div className="re-card-body">
                    <div className="re-chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={marketData.priceHistory}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c8a43c" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#c8a43c" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="year" 
                            tick={{ fill: 'rgba(255,255,255,0.6)' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          />
                          <YAxis 
                            tick={{ fill: 'rgba(255,255,255,0.6)' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.9)',
                              color: 'white',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#c8a43c" 
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="re-card">
                    <div className="re-card-header">
                      <h2 className="text-xl font-bold">Property Types Distribution</h2>
                    </div>
                    <div className="re-card-body">
                      <div className="re-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={marketData.propertyTypes}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {marketData.propertyTypes.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px'
                              }}
                              formatter={(value) => [`${value}%`, 'Market Share']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="re-card">
                    <div className="re-card-header">
                      <h2 className="text-xl font-bold">Location Demand Index</h2>
                    </div>
                    <div className="re-card-body">
                      <div className="re-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={marketData.locationDemand}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: 'rgba(255,255,255,0.6)' }}
                              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            />
                            <YAxis 
                              tick={{ fill: 'rgba(255,255,255,0.6)' }}
                              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            />
                            <Tooltip
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px'
                              }}
                            />
                            <Bar dataKey="demand" fill="#c8a43c" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI Analysis */}
                {searchPerformed && (
                  <div className="re-card">
                    <div className="re-card-header">
                      <h2 className="text-xl font-bold">AI Market Analysis</h2>
                    </div>
                    <div className="re-card-body">
                      {loading ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="animate-spin h-8 w-8 border-2 border-gold-500 border-t-transparent rounded-full mr-2"></div>
                          <p>Analyzing market data...</p>
                        </div>
                      ) : aiAnalysis ? (
                        <div className="prose prose-invert max-w-none">
                          {formatAnalysis(aiAnalysis)}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-white/60">
                          <FaInfoCircle className="text-3xl mx-auto mb-3" />
                          <p>Use the search filters to get an AI-powered market analysis</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Projects */}
            {activeTab === 'upcoming' && (
              <div className="re-card">
                <div className="re-card-header">
                  <h2 className="text-xl font-bold">Upcoming Projects</h2>
                </div>
                <div className="re-card-body">
                  {isLoadingProjects ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin h-8 w-8 border-2 border-gold-500 border-t-transparent rounded-full mr-2"></div>
                      <p>Loading upcoming projects...</p>
                    </div>
                  ) : upcomingProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingProjects.map((project) => (
                        <div key={project.id} className="re-property-card-gold">
                          <div className="re-property-content">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-white">{project.name}</h3>
                              <div className="re-badge re-badge-luxury">{project.completionDate}</div>
                            </div>
                            <div className="text-sm text-gold-500 mb-2">by {project.developer}</div>
                            <div className="re-property-location mb-3">
                              <FaMapMarkerAlt className="mr-1" /> {project.location}
                            </div>
                            <div className="text-sm mb-2">
                              <span className="text-white/60">Price Range:</span> {project.priceRange}
                            </div>
                            <div className="text-sm mb-3">
                              <span className="text-white/60">Property Types:</span> {project.propertyTypes.join(', ')}
                            </div>
                            <div className="text-sm mb-3">
                              <div className="text-white/60 mb-1">Construction Status:</div>
                              <div className="re-progress-track">
                                <div 
                                  className="re-progress-bar" 
                                  style={{ width: `${project.constructionStatus.match(/\d+/)?.[0] || 10}%` }} 
                                ></div>
                              </div>
                              <div className="text-xs text-white/60 mt-1">{project.constructionStatus}</div>
                            </div>
                            <div className="re-property-features">
                              {project.keyFeatures.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="re-property-feature">
                                  {feature}
                                </span>
                              ))}
                              {project.keyFeatures.length > 3 && (
                                <span className="re-property-feature">
                                  +{project.keyFeatures.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <FaClock className="text-3xl mx-auto mb-3" />
                      <p>No upcoming projects found for the selected criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ongoing Projects */}
            {activeTab === 'ongoing' && (
              <div className="re-card">
                <div className="re-card-header">
                  <h2 className="text-xl font-bold">Ongoing Projects</h2>
                </div>
                <div className="re-card-body">
                  {isLoadingProjects ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin h-8 w-8 border-2 border-gold-500 border-t-transparent rounded-full mr-2"></div>
                      <p>Loading ongoing projects...</p>
                    </div>
                  ) : ongoingProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ongoingProjects.map((project) => (
                        <div key={project.id} className="re-property-card">
                          <div className="re-property-content">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-white">{project.name}</h3>
                              <div className="re-badge re-badge-new">{project.completionDate}</div>
                            </div>
                            <div className="text-sm text-white/80 mb-2">by {project.developer}</div>
                            <div className="re-property-location mb-3">
                              <FaMapMarkerAlt className="mr-1" /> {project.location}
                            </div>
                            <div className="text-sm mb-2">
                              <span className="text-white/60">Price Range:</span> {project.priceRange}
                            </div>
                            <div className="text-sm mb-3">
                              <span className="text-white/60">Property Types:</span> {project.propertyTypes.join(', ')}
                            </div>
                            <div className="text-sm mb-3">
                              <div className="flex justify-between text-white/60 mb-1">
                                <span>Completion:</span>
                                <span>{project.percentageCompleted}%</span>
                              </div>
                              <div className="re-progress-track">
                                <div 
                                  className="re-progress-bar" 
                                  style={{ width: `${project.percentageCompleted}%` }} 
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm mb-3">
                              <span className="text-white/60">Update:</span> {project.constructionUpdate}
                            </div>
                            <div className="re-property-features">
                              {project.keyFeatures.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="re-property-feature">
                                  {feature}
                                </span>
                              ))}
                              {project.keyFeatures.length > 3 && (
                                <span className="re-property-feature">
                                  +{project.keyFeatures.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <FaHardHat className="text-3xl mx-auto mb-3" />
                      <p>No ongoing projects found for the selected criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
    <div className="bg-anti-flash-white rounded-lg shadow-md border border-almond overflow-hidden">
      {/* Property Header */}
      <div className="p-4 bg-beige border-b border-almond">
        <h2 className="text-2xl font-bold text-dubai-blue-900">{property.name}</h2>
        <div className="flex items-center text-dubai-blue-700">
          <FaMapMarkerAlt className="mr-1 text-tuscany" />
          <span>{property.location}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Main Property Details - Column 1 */}
        <div className="col-span-1 lg:col-span-2">
          <div className="mb-6">
            <div className="relative h-64 md:h-96 w-full mb-4 rounded-lg overflow-hidden shadow-sm">
              {property.image && (
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute top-2 right-2 z-10 flex space-x-2">
                {property.isNew && (
                  <span className="bg-tuscany text-white px-2 py-1 rounded-full text-xs font-bold">
                    NEW
                  </span>
                )}
                {property.isFeatured && (
                  <span className="bg-dubai-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    FEATURED
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between mb-4">
              <div className="flex items-center text-dubai-blue-900 font-bold text-2xl">
                <FaMoneyBillWave className="mr-2 text-tuscany" />
                {formatCurrency(property.price)}
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <FaBed className="mr-1 text-tuscany" />
                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                </div>
                <div className="flex items-center mr-4">
                  <FaBath className="mr-1 text-tuscany" />
                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                </div>
                <div className="flex items-center">
                  <FaRuler className="mr-1 text-tuscany" />
                  <span>{property.size} sq.ft</span>
                </div>
              </div>
            </div>
            
            {/* Price Timeline Chart */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-almond mb-6">
              <h3 className="text-lg font-semibold text-dubai-blue-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-tuscany" />
                Price History
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={property.priceTimeline}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0dc" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(Number(value))}`, 'Price']}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#c8a08c" 
                      fill="#f0dcc8" 
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Map Location */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-almond">
              <h3 className="text-lg font-semibold text-dubai-blue-900 mb-4 flex items-center">
                <FaMap className="mr-2 text-tuscany" />
                Property Location
              </h3>
              {property.lat && property.lng ? (
                <div className="h-80 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[property.lat, property.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker 
                      position={[property.lat, property.lng]}
                      icon={createCustomIcon(property.isFeatured)}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong>{property.name}</strong><br />
                          {property.location}<br />
                          {formatCurrency(property.price)}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Map location not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar - Column 2 */}
        <div className="col-span-1">
          {/* Key Facts Panel */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-almond mb-6">
            <h3 className="text-lg font-semibold text-dubai-blue-900 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-tuscany" />
              Key Facts
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between p-2 border-b border-almond">
                <span className="text-dubai-blue-700">Property Type</span>
                <span className="font-medium text-dubai-blue-900">{property.type}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-almond">
                <span className="text-dubai-blue-700">Developer</span>
                <span className="font-medium text-dubai-blue-900">{property.developer}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-almond">
                <span className="text-dubai-blue-700">Year Built</span>
                <span className="font-medium text-dubai-blue-900">{property.constructionYear}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-almond">
                <span className="text-dubai-blue-700">Price per sq ft</span>
                <span className="font-medium text-dubai-blue-900">
                  {formatCurrency(Math.round(property.price / property.size))}
                </span>
              </div>
              <div className="flex justify-between p-2 border-b border-almond">
                <span className="text-dubai-blue-700">Rating</span>
                <span className="font-medium text-dubai-blue-900 flex items-center">
                  {property.rating} <FaStar className="ml-1 text-tuscany" />
                </span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-dubai-blue-700">Value Change (1yr)</span>
                <span className="font-medium text-green-600">
                  +{Math.round(((property.priceTimeline[property.priceTimeline.length - 1].price / 
                  property.priceTimeline[property.priceTimeline.length - 2].price) - 1) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Nearby Properties */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-almond">
            <h3 className="text-lg font-semibold text-dubai-blue-900 mb-4 flex items-center">
              <FaLocationArrow className="mr-2 text-tuscany" />
              Nearby Properties
            </h3>
            <div className="space-y-4">
              {NEARBY_PROPERTIES.map((nearbyProperty) => (
                <div key={nearbyProperty.id} className="flex border-b border-almond pb-3">
                  <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden relative">
                    <Image 
                      src={nearbyProperty.image}
                      alt={nearbyProperty.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <h4 className="font-medium text-dubai-blue-900 text-sm">{nearbyProperty.name}</h4>
                    <div className="text-dubai-blue-700 text-xs flex items-center">
                      <FaLocationArrow className="mr-1 text-tuscany" />
                      {nearbyProperty.distance} km away
                    </div>
                    <div className="text-dubai-blue-700 text-xs flex items-center mt-1">
                      <FaBed className="mr-1 text-tuscany" />
                      {nearbyProperty.bedrooms} Bed
                      <FaBath className="mx-1 text-tuscany ml-2" />
                      {nearbyProperty.bathrooms} Bath
                    </div>
                    <div className="font-bold text-tuscany text-sm mt-1">
                      {formatCurrency(nearbyProperty.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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

// Project Card Component
type ProjectCardProps = {
  project: UpcomingProject | OngoingProject;
  type: 'upcoming' | 'ongoing';
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, type }) => {
  // Determine if this is an ongoing project with percentage completed
  const isOngoing = type === 'ongoing' && 'percentageCompleted' in project;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:border-dubai-blue transition-colors h-full flex flex-col">
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            alt={project.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x200?text=Project+Image';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FaBuilding className="text-gray-300 text-5xl" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-dubai-blue text-white font-bold px-3 py-1 rounded-full text-xs">
          {project.completionDate}
        </div>
        {type === 'upcoming' ? (
          <div className="absolute bottom-3 left-3 bg-gold-500 text-dubai-blue font-bold px-3 py-1 rounded-full text-xs">
            Upcoming
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white font-bold px-3 py-1 rounded-full text-xs">
            In Progress
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-dubai-blue text-lg">{project.name}</h3>
          <span className="text-xs text-gray-500">{project.totalUnits} units</span>
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <FaBuilding className="inline-block mr-1 text-gold-500" />
          {project.developer}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <FaMap className="inline-block mr-1 text-gold-500" />
          {project.location}
        </div>
        
        <div className="border-t border-gray-100 mt-3 pt-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-500">Price Range</div>
            <div className="text-sm text-gray-500">Completion Date</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-dubai-blue">{project.priceRange}</div>
            <div className="font-medium text-dubai-blue">{project.completionDate}</div>
          </div>
        </div>
        
        {isOngoing ? (
          <div className="mt-3">
            <div className="text-sm text-gray-500 mb-1">Completion Status</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className="bg-dubai-blue h-2.5 rounded-full" 
                style={{ width: `${(project as OngoingProject).percentageCompleted}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{(project as OngoingProject).percentageCompleted}% complete</span>
              <span>{(project as OngoingProject).constructionUpdate}</span>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-sm text-gray-500 mb-1">Construction Status</div>
            <div className="text-sm bg-dubai-blue bg-opacity-10 text-dubai-blue px-2 py-1 rounded">
              {(project as UpcomingProject).constructionStatus}
            </div>
          </div>
        )}
        
        <div className="mt-3">
          <div className="text-sm text-gray-500 mb-1">Property Types</div>
          <div className="flex flex-wrap gap-1">
            {project.propertyTypes.map((type, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
                {type}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-sm text-gray-500 mb-1">Key Features</div>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            {project.keyFeatures.slice(0, 3).map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
            {project.keyFeatures.length > 3 && (
              <li className="text-dubai-blue">+{project.keyFeatures.length - 3} more</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}; 