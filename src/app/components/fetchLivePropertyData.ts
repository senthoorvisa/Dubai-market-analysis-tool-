import axios from 'axios';

// API retry configuration
const API_RETRY_COUNT = 3;
const API_RETRY_DELAY = 1000; // ms

// Define PropertyData interface
export interface PropertyMetadata {
  id: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  developer: string;
  purchaseYear: number;
  location: string;
  status: 'Completed' | 'Under Construction' | 'Planned';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PricePoint {
  year: number;
  price: number;
}

export interface NearbyProperty {
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
}

export interface OngoingProject {
  id: string;
  name: string;
  status: 'In Ideation' | 'Pre-Funding' | 'Under Construction' | 'Nearly Complete';
  expectedCompletion: string; // Year or date
  developer: string;
}

export interface DeveloperInfo {
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

export interface PropertyData {
  metadata: PropertyMetadata;
  priceHistory: PricePoint[];
  nearby: NearbyProperty[];
  ongoingProjects: OngoingProject[];
  developer: DeveloperInfo;
}

/**
 * Retry function for API calls
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Delay between retries in ms
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = API_RETRY_COUNT, delay = API_RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`API call failed, retrying... (${API_RETRY_COUNT - retries + 1}/${API_RETRY_COUNT})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay);
  }
}

// Generate price history data for a property
function generatePriceHistory(startYear: number) {
  const currentYear = new Date().getFullYear();
  const years = currentYear - startYear + 1;
  const priceHistory = [];
  
  // Base price (AED)
  let basePrice = Math.round((Math.random() * 2000000 + 1000000) / 100000) * 100000;
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    
    // Add some realistic price growth/fluctuation
    if (i > 0) {
      // Dubai property market had a boom around 2021-2022
      if (year >= 2021 && year <= 2022) {
        basePrice *= (1 + (Math.random() * 0.15 + 0.1)); // 10-25% growth
      } else if (year >= 2018 && year <= 2020) {
        // Slight decline or stagnation during COVID
        basePrice *= (1 - (Math.random() * 0.05)); // 0-5% decline
      } else {
        // Normal years: 3-8% growth
        basePrice *= (1 + (Math.random() * 0.05 + 0.03));
      }
    }
    
    priceHistory.push({
      year,
      price: Math.round(basePrice / 10000) * 10000 // Round to nearest 10k
    });
  }
  
  return priceHistory;
}

// Generate nearby properties based on location and bedrooms
function generateNearbyProperties(location: string, bedrooms: number) {
  const nearby = [];
  
  for (let i = 0; i < 5; i++) {
    const originalYear = Math.floor(Math.random() * 10) + 2010;
    const originalPrice = Math.round((Math.random() * 2000000 + 800000) / 100000) * 100000;
    const currentYear = new Date().getFullYear();
    const growthFactor = 1 + (Math.random() * 0.1 + 0.05) * (currentYear - originalYear);
    const currentPrice = Math.round(originalPrice * growthFactor / 100000) * 100000;
    
    nearby.push({
      id: `nearby-${i}-${Date.now().toString().slice(-4)}`,
      name: `${location} ${['Heights', 'Residence', 'Tower', 'Gardens', 'View'][i % 5]} ${i+1}`,
      distance: Math.round((Math.random() * 4 + 0.5) * 10) / 10,
      originalPrice,
      originalYear,
      currentPrice,
      currentYear,
      beds: bedrooms + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.7 ? 1 : 0),
      baths: bedrooms + (Math.random() > 0.7 ? 1 : 0),
      sqft: Math.round((bedrooms * 400 + 800 + Math.random() * 500) / 50) * 50,
      developer: ['Emaar', 'Damac', 'Nakheel', 'Meraas', 'Dubai Properties'][Math.floor(Math.random() * 5)]
    });
  }
  
  return nearby;
}

// Generate ongoing projects for a location
function generateOngoingProjects(location: string, developer: string) {
  const ongoingProjects: OngoingProject[] = [];
  
  for (let i = 0; i < 3; i++) {
    const projectStatuses: Array<'In Ideation' | 'Pre-Funding' | 'Under Construction' | 'Nearly Complete'> = [
      'In Ideation', 'Pre-Funding', 'Under Construction', 'Nearly Complete'
    ];
    const status = projectStatuses[Math.floor(Math.random() * projectStatuses.length)];
    const completionYear = new Date().getFullYear() + Math.floor(Math.random() * 4) + 1;
    
    ongoingProjects.push({
      id: `project-${i}-${Date.now().toString().slice(-4)}`,
      name: `${['The', 'New', 'Royal', 'Grand', 'Elite'][i % 5]} ${location} ${['Residences', 'Towers', 'Heights', 'Estate', 'Gardens'][i % 5]}`,
      status,
      expectedCompletion: completionYear.toString(),
      developer
    });
  }
  
  return ongoingProjects;
}

// Generate developer information
function generateDeveloperInfo(developer: string) {
  return {
    id: `dev-${developer.toLowerCase().replace(/\s+/g, '-')}`,
    name: developer,
    headquarters: 'Dubai, UAE',
    totalProjects: Math.floor(Math.random() * 30) + 20,
    averageROI: Math.round((Math.random() * 6) + 4 + Math.random()),
    revenueByYear: Array.from({ length: 6 }, (_, i) => ({
      year: 2020 + i,
      residential: Math.round(Math.random() * 5000) + 2000,
      commercial: Math.round(Math.random() * 3000) + 1000,
      mixedUse: Math.round(Math.random() * 2000) + 500
    }))
  };
}

// Real data fetching function with retry mechanism
export async function fetchLivePropertyData(searchQuery: string, filterOptions?: {
  location?: string;
  propertyType?: string;
  bedrooms?: string | number;
}): Promise<PropertyData> {
  
  console.log('🔍 Fetching live property data for:', searchQuery, filterOptions);
  
  try {
    // Call the new property lookup API
    const response = await withRetry(async () => {
      const apiResponse = await axios.post('/api/property-lookup', {
        searchTerm: searchQuery,
        location: filterOptions?.location || searchQuery,
        propertyType: filterOptions?.propertyType,
        bedrooms: filterOptions?.bedrooms,
        priceRange: '',
        amenities: []
      });
      
      return apiResponse;
    });

    if (response.data.success && response.data.data) {
      const apiData = response.data.data;
      
      // Transform API response to PropertyData format
      const propertyData: PropertyData = {
        metadata: apiData.metadata,
        priceHistory: apiData.priceHistory,
        nearby: apiData.nearby,
        ongoingProjects: apiData.ongoingProjects,
        developer: apiData.developer
      };
      
      console.log('✅ Successfully fetched property data from API');
      return propertyData;
    } else {
      throw new Error(response.data.error || 'Failed to fetch property data');
    }
    
  } catch (error) {
    console.error('❌ API call failed, generating fallback data:', error);
    
    // Generate fallback data if API fails
    return generateFallbackPropertyData(searchQuery, filterOptions);
  }
}

// Generate fallback property data when API fails
function generateFallbackPropertyData(searchQuery: string, filterOptions?: {
  location?: string;
  propertyType?: string;
  bedrooms?: string | number;
}): PropertyData {
  console.log('🔄 Generating fallback property data for:', searchQuery);
  
  const location = filterOptions?.location || searchQuery || 'Dubai Marina';
  const propertyType = filterOptions?.propertyType || 'Apartment';
  const bedrooms = typeof filterOptions?.bedrooms === 'string' 
    ? (filterOptions.bedrooms === 'Studio' ? 0 : parseInt(filterOptions.bedrooms, 10))
    : (filterOptions?.bedrooms || 2);
  
  const developer = ['Emaar Properties', 'DAMAC Properties', 'Nakheel', 'Dubai Properties', 'Meraas'][Math.floor(Math.random() * 5)];
  const purchaseYear = Math.floor(Math.random() * 10) + 2015;
  const sqft = Math.round((bedrooms * 400 + 800 + Math.random() * 500) / 50) * 50;
  
  const metadata: PropertyMetadata = {
    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: searchQuery || `${location} ${propertyType}`,
    beds: bedrooms,
    baths: Math.max(1, bedrooms),
    sqft,
    developer,
    purchaseYear,
    location,
    status: Math.random() > 0.8 ? 'Under Construction' : 'Completed',
    coordinates: {
      lat: 25.0657 + (Math.random() - 0.5) * 0.1, // Dubai coordinates with variation
      lng: 55.1713 + (Math.random() - 0.5) * 0.1
    }
  };
  
  const priceHistory = generatePriceHistory(purchaseYear);
  const nearby = generateNearbyProperties(location, bedrooms);
  const ongoingProjects = generateOngoingProjects(location, developer);
  const developerInfo = generateDeveloperInfo(developer);
  
  return {
    metadata,
    priceHistory,
    nearby,
    ongoingProjects,
    developer: developerInfo
  };
}
