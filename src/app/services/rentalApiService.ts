// Type definitions
export interface RentalListing {
  id: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  rent: number;
  furnishing: 'Furnished' | 'Unfurnished' | 'Partially Furnished';
  availableSince: string;
  location: string;
  amenities: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  propertyAge: string;
  viewType: string;
  floorLevel: number;
  parkingSpaces: number;
  petFriendly: boolean;
  nearbyAttractions: string[];
  description: string;
  images: string[];
  link: string; // Direct link to the original listing
  bhk?: string; // BHK configuration
}

export interface RentalApiResponse {
  listings: RentalListing[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RentalFilter {
  propertyType?: string;
  bedrooms?: string;
  sizeMin?: string;
  sizeMax?: string;
  rentMin?: string;
  rentMax?: string;
  furnishing?: string;
}

// Service for fetching real rental listings from Dubai real estate websites
import axios from 'axios';

// API retry configuration
const API_RETRY_COUNT = 3;
const API_RETRY_DELAY = 2000; // ms

/**
 * Retry function for API calls
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Delay between retries in ms
 */
async function withRetry<T>(fn: () => Promise<T>, retries = API_RETRY_COUNT, delay = API_RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`API call failed, retrying... (${API_RETRY_COUNT - retries + 1}/${API_RETRY_COUNT})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 1.5); // Exponential backoff
  }
}

/**
 * Real-time web scraping function for Bayut.com
 */
async function scrapeBayutListings(area: string, filters: RentalFilter = {}): Promise<RentalListing[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('purpose', 'for-rent');
    searchParams.append('location', area);
    
    if (filters.propertyType) searchParams.append('categoryExternalID', getPropertyTypeId(filters.propertyType));
    if (filters.bedrooms) searchParams.append('roomsMin', filters.bedrooms);
    if (filters.rentMin) searchParams.append('priceMin', filters.rentMin);
    if (filters.rentMax) searchParams.append('priceMax', filters.rentMax);

    // Use a CORS proxy to bypass CORS restrictions
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = encodeURIComponent(`https://www.bayut.com/api/properties?${searchParams.toString()}`);
    
    const response = await axios.get(`${proxyUrl}${targetUrl}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = JSON.parse(response.data.contents);
    const listings: RentalListing[] = [];

    if (data.hits && Array.isArray(data.hits)) {
      for (const hit of data.hits) {
        // Determine furnishing status
        let furnishingStatus: 'Furnished' | 'Unfurnished' | 'Partially Furnished' = 'Unfurnished';
        if (hit.furnishingStatus) {
          const status = hit.furnishingStatus.toLowerCase();
          if (status.includes('furnished') && !status.includes('unfurnished')) {
            furnishingStatus = status.includes('partially') ? 'Partially Furnished' : 'Furnished';
          } else if (status.includes('unfurnished')) {
            furnishingStatus = 'Unfurnished';
          }
        }

        const listing: RentalListing = {
          id: hit.id || `bayut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: hit.category?.[0]?.name || 'Apartment',
          bedrooms: parseInt(hit.rooms) || 0,
          bathrooms: parseInt(hit.baths) || 0,
          size: parseInt(hit.area) || 0,
          rent: parseInt(hit.price) || 0,
          furnishing: furnishingStatus,
          availableSince: hit.dateInsert || new Date().toISOString(),
          location: hit.location?.[0]?.name || area,
          amenities: hit.amenities || [],
          contactName: hit.contactName || hit.agency?.name || '',
          contactPhone: hit.phoneNumber?.mobile || '',
          contactEmail: hit.contactEmail || '',
          propertyAge: hit.completionStatus || 'Unknown',
          viewType: hit.keywords?.join(', ') || '',
          floorLevel: parseInt(hit.floor) || 0,
          parkingSpaces: parseInt(hit.parking) || 0,
          petFriendly: hit.petFriendly === 'yes',
          nearbyAttractions: hit.nearbyPlaces || [],
          description: hit.description || `${hit.category?.[0]?.name || 'Property'} for rent in ${area}`,
          images: hit.photos?.map((photo: any) => photo.url) || [],
          link: `https://www.bayut.com${hit.path}`,
          bhk: hit.rooms === '0' ? 'Studio' : `${hit.rooms} BHK`
        };
        listings.push(listing);
      }
    }

    console.log(`Successfully scraped ${listings.length} listings from Bayut`);
    return listings;
  } catch (error) {
    console.error('Bayut scraping failed:', error);
    return [];
  }
}

/**
 * Real-time web scraping function for PropertyFinder.ae
 */
async function scrapePropertyFinderListings(area: string, filters: RentalFilter = {}): Promise<RentalListing[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('c', '2'); // For rent
    searchParams.append('l', getLocationId(area));
    
    if (filters.propertyType) searchParams.append('t', getPropertyFinderTypeId(filters.propertyType));
    if (filters.bedrooms) searchParams.append('rms', filters.bedrooms);
    if (filters.rentMin) searchParams.append('pf', filters.rentMin);
    if (filters.rentMax) searchParams.append('pt', filters.rentMax);

    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = encodeURIComponent(`https://www.propertyfinder.ae/en/search?${searchParams.toString()}`);
    
    const response = await axios.get(`${proxyUrl}${targetUrl}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse HTML content to extract listing data
    const htmlContent = response.data.contents;
    const listings: RentalListing[] = await parsePropertyFinderHTML(htmlContent, area);
    
    console.log(`Successfully scraped ${listings.length} listings from PropertyFinder`);
    return listings;
  } catch (error) {
    console.error('PropertyFinder scraping failed:', error);
    return [];
  }
}

/**
 * Real-time web scraping function for Dubizzle.com
 */
async function scrapeDubizzleListings(area: string, filters: RentalFilter = {}): Promise<RentalListing[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('keywords', `${area} rent`);
    searchParams.append('is_basic_search_widget', '0');
    searchParams.append('is_search', '1');
    
    if (filters.propertyType) searchParams.append('category', 'apartments-for-rent');
    if (filters.bedrooms) searchParams.append('bedrooms', filters.bedrooms);

    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = encodeURIComponent(`https://dubai.dubizzle.com/property-for-rent/residential/?${searchParams.toString()}`);
    
    const response = await axios.get(`${proxyUrl}${targetUrl}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const htmlContent = response.data.contents;
    const listings: RentalListing[] = await parseDubizzleHTML(htmlContent, area);
    
    console.log(`Successfully scraped ${listings.length} listings from Dubizzle`);
    return listings;
  } catch (error) {
    console.error('Dubizzle scraping failed:', error);
    return [];
  }
}

/**
 * Parse PropertyFinder HTML content
 */
async function parsePropertyFinderHTML(htmlContent: string, area: string): Promise<RentalListing[]> {
  const listings: RentalListing[] = [];
  
  try {
    // Use regex patterns to extract listing data from HTML
    const listingPattern = /<div[^>]*class="[^"]*card-list[^"]*"[^>]*>(.*?)<\/div>/g;
    const matches = htmlContent.match(listingPattern);
    
    if (matches) {
      for (const match of matches.slice(0, 20)) { // Limit to 20 listings
        const priceMatch = match.match(/AED\s*([\d,]+)/);
        const bedroomsMatch = match.match(/(\d+)\s*bed/i);
        const sizeMatch = match.match(/([\d,]+)\s*sq\.?\s*ft/i);
        const linkMatch = match.match(/href="([^"]+)"/);
        
        if (priceMatch) {
          const listing: RentalListing = {
            id: `pf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'Apartment',
            bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0,
            bathrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 1,
            size: sizeMatch ? parseInt(sizeMatch[1].replace(/,/g, '')) : 0,
            rent: parseInt(priceMatch[1].replace(/,/g, '')),
            furnishing: 'Unfurnished',
            availableSince: new Date().toISOString(),
            location: area,
            amenities: [],
            contactName: 'PropertyFinder Agent',
            contactPhone: '',
            contactEmail: '',
            propertyAge: 'Unknown',
            viewType: '',
            floorLevel: 0,
            parkingSpaces: 0,
            petFriendly: false,
            nearbyAttractions: [],
            description: `Property for rent in ${area}`,
            images: [],
            link: linkMatch ? `https://www.propertyfinder.ae${linkMatch[1]}` : '',
            bhk: bedroomsMatch ? `${bedroomsMatch[1]} BHK` : 'Studio'
          };
          listings.push(listing);
        }
      }
    }
  } catch (error) {
    console.error('Error parsing PropertyFinder HTML:', error);
  }
  
  return listings;
}

/**
 * Parse Dubizzle HTML content
 */
async function parseDubizzleHTML(htmlContent: string, area: string): Promise<RentalListing[]> {
  const listings: RentalListing[] = [];
  
  try {
    // Use regex patterns to extract listing data from HTML
    const listingPattern = /<div[^>]*class="[^"]*listing[^"]*"[^>]*>(.*?)<\/div>/g;
    const matches = htmlContent.match(listingPattern);
    
    if (matches) {
      for (const match of matches.slice(0, 15)) { // Limit to 15 listings
        const priceMatch = match.match(/AED\s*([\d,]+)/);
        const bedroomsMatch = match.match(/(\d+)\s*bedroom/i);
        const linkMatch = match.match(/href="([^"]+)"/);
        
        if (priceMatch) {
          const listing: RentalListing = {
            id: `dubizzle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'Apartment',
            bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0,
            bathrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 1,
            size: 0, // Will be extracted from individual listing page
            rent: parseInt(priceMatch[1].replace(/,/g, '')),
            furnishing: 'Unfurnished',
            availableSince: new Date().toISOString(),
            location: area,
            amenities: [],
            contactName: 'Dubizzle Agent',
            contactPhone: '',
            contactEmail: '',
            propertyAge: 'Unknown',
            viewType: '',
            floorLevel: 0,
            parkingSpaces: 0,
            petFriendly: false,
            nearbyAttractions: [],
            description: `Property for rent in ${area}`,
            images: [],
            link: linkMatch ? `https://dubai.dubizzle.com${linkMatch[1]}` : '',
            bhk: bedroomsMatch ? `${bedroomsMatch[1]} BHK` : 'Studio'
          };
          listings.push(listing);
        }
      }
    }
  } catch (error) {
    console.error('Error parsing Dubizzle HTML:', error);
  }
  
  return listings;
}

/**
 * Helper functions for mapping filters to website-specific IDs
 */
function getPropertyTypeId(type: string): string {
  const typeMap: { [key: string]: string } = {
    'Apartment': '1',
    'Villa': '2',
    'Townhouse': '3',
    'Penthouse': '4',
    'Studio': '5'
  };
  return typeMap[type] || '1';
}

function getPropertyFinderTypeId(type: string): string {
  const typeMap: { [key: string]: string } = {
    'Apartment': 'ap',
    'Villa': 'vi',
    'Townhouse': 'th',
    'Penthouse': 'ph',
    'Studio': 'st'
  };
  return typeMap[type] || 'ap';
}

function getLocationId(area: string): string {
  const locationMap: { [key: string]: string } = {
    'Dubai Marina': '2',
    'Downtown Dubai': '1',
    'Palm Jumeirah': '3',
    'Business Bay': '4',
    'Jumeirah Lake Towers': '5'
  };
  return locationMap[area] || '2';
}

/**
 * Cross-verify prices across multiple sources
 */
async function crossVerifyPrice(listing: RentalListing, allListings: RentalListing[]): Promise<number> {
  // Find similar properties (same type, similar size, same area)
  const similarListings = allListings.filter(l => 
    l.type === listing.type &&
    l.location === listing.location &&
    Math.abs(l.size - listing.size) <= 200 && // Within 200 sqft
    l.id !== listing.id
  );

  if (similarListings.length >= 2) {
    const prices = similarListings.map(l => l.rent);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // If current price is more than 30% different from average, use the average
    const priceDiff = Math.abs((listing.rent - avgPrice) / avgPrice);
    if (priceDiff > 0.3) {
      console.log(`Price adjusted for ${listing.type} in ${listing.location}: ${listing.rent} -> ${Math.round(avgPrice)} AED`);
      return Math.round(avgPrice);
    }
  }

  return listing.rent;
}

const rentalApiService = {
  // Get rental listings from multiple real estate websites
  getRentalListings: async (
    area: string,
    filters: RentalFilter = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<RentalApiResponse> => {
    return await withRetry(async () => {
      console.log(`Fetching real-time rental data for ${area}...`);
      
      // Fetch from multiple sources in parallel
      const [bayutListings, pfListings, dubizzleListings] = await Promise.allSettled([
        scrapeBayutListings(area, filters),
        scrapePropertyFinderListings(area, filters),
        scrapeDubizzleListings(area, filters)
      ]);

      // Collect successful results
      let allListings: RentalListing[] = [];
      
      if (bayutListings.status === 'fulfilled') {
        allListings = [...allListings, ...bayutListings.value];
      }
      
      if (pfListings.status === 'fulfilled') {
        allListings = [...allListings, ...pfListings.value];
      }
      
      if (dubizzleListings.status === 'fulfilled') {
        allListings = [...allListings, ...dubizzleListings.value];
      }

      // Remove duplicates based on similar properties
      const uniqueListings: RentalListing[] = [];
      const seenProperties = new Set();

      for (const listing of allListings) {
        const key = `${listing.type}-${listing.bedrooms}-${listing.location}-${Math.round(listing.rent / 1000)}`;
        if (!seenProperties.has(key)) {
          seenProperties.add(key);
          uniqueListings.push(listing);
        }
      }

      // Cross-verify and adjust prices
      const verifiedListings = await Promise.all(
        uniqueListings.map(async (listing) => ({
          ...listing,
          rent: await crossVerifyPrice(listing, uniqueListings)
        }))
      );

      // Apply additional filters
      let filteredListings = verifiedListings.filter(listing => {
        if (filters.rentMin && listing.rent < parseInt(filters.rentMin)) return false;
        if (filters.rentMax && listing.rent > parseInt(filters.rentMax)) return false;
        if (filters.sizeMin && listing.size < parseInt(filters.sizeMin)) return false;
        if (filters.sizeMax && listing.size > parseInt(filters.sizeMax)) return false;
        if (filters.furnishing && listing.furnishing !== filters.furnishing) return false;
        return true;
      });

      // Sort by rent (ascending)
      filteredListings.sort((a, b) => a.rent - b.rent);

      // Paginate results
      const startIndex = (page - 1) * pageSize;
      const paginatedListings = filteredListings.slice(startIndex, startIndex + pageSize);

      if (filteredListings.length === 0) {
        throw new Error(`No rental listings found for ${area} with current filters`);
      }

      console.log(`Successfully fetched ${filteredListings.length} verified rental listings`);

      return {
        listings: paginatedListings,
        total: filteredListings.length,
        page,
        pageSize
      };
    });
  },

  // Check for new listings since the last fetch
  checkForNewListings: async (area: string, lastFetchTime: number): Promise<number> => {
    try {
      // Fetch recent listings from Bayut
      const recentListings = await scrapeBayutListings(area);
      
      // Count listings newer than lastFetchTime
      const newListings = recentListings.filter(listing => {
        const listingTime = new Date(listing.availableSince).getTime();
        return listingTime > lastFetchTime;
      });

      return newListings.length;
    } catch (error) {
      console.error('Error checking for new listings:', error);
      return 0;
    }
  }
};

export default rentalApiService;
