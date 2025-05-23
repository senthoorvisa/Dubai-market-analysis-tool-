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

// Service for fetching real rental listings from multiple sources
import axios from 'axios';

// API retry configuration
const API_RETRY_COUNT = 3;
const API_RETRY_DELAY = 1000; // ms

// Define API endpoints for data fetching
const BAYUT_API_ENDPOINT = 'https://bayut.p.rapidapi.com/properties/list';
const PROPERTYFINDER_API_ENDPOINT = 'https://api.propertyfinder.ae/v1/properties';
const DUBIZZLE_API_ENDPOINT = 'https://uae.dubizzle.com/api/v1/properties';
// Add Property Monitor API for verified price data
const PROPERTYMONITOR_API_ENDPOINT = 'https://api.propertymonitor.ae/properties/rent';

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
    return withRetry(fn, retries - 1, delay);
  }
}

/**
 * Function to verify and correct price data using Property Monitor API
 * @param area Area name
 * @param propertyType Property type
 * @param rent Initial rent value
 * @param size Property size in sqft
 */
async function verifyRentPrice(area: string, propertyType: string, rent: number, size: number): Promise<number> {
  try {
    // Call Property Monitor API to get verified rental data
    const response = await axios.get(PROPERTYMONITOR_API_ENDPOINT, {
      params: {
        area,
        property_type: propertyType,
        size_sqft: size
      },
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PROPERTYMONITOR_API_KEY || 'pm_api_key'}`
      }
    });
    
    if (response.data && response.data.verified_price) {
      // If the difference is significant (more than 15%), use the verified price
      const verifiedPrice = response.data.verified_price;
      const priceDiff = Math.abs((rent - verifiedPrice) / verifiedPrice);
      
      if (priceDiff > 0.15) {
        console.log(`Price corrected for ${propertyType} in ${area}: ${rent} -> ${verifiedPrice} AED`);
        return verifiedPrice;
      }
    }
    
    return rent; // Return original if verification failed or difference is acceptable
  } catch (error) {
    console.warn('Price verification failed, using original price:', error);
    return rent;
  }
}

/**
 * Function to normalize and enhance property data
 */
function normalizeListingData(rawListing: any, source: string): Partial<RentalListing> {
  // Extract basic property details
  let type = rawListing.type || rawListing.propertyType || 'Residential';
  let bedrooms = rawListing.bedrooms || 0;
  let price = rawListing.price || rawListing.rent || 0;
  let size = rawListing.size || rawListing.sqft || 0;
  let location = rawListing.location?.[0]?.name || rawListing.location || '';
  let amenities = rawListing.amenities || [];
  
  // Extract BHK configuration
  let bhk = bedrooms === 0 ? 'Studio' : `${bedrooms} BHK`;
  
  // Extract contact information
  let contactName = rawListing.contactName || rawListing.agent?.name || '';
  let contactPhone = rawListing.contactPhone || rawListing.agent?.phone || '';
  let contactEmail = rawListing.contactEmail || rawListing.agent?.email || '';
  
  // Extract link to original listing
  let link = rawListing.externalLink || rawListing.url || rawListing.detailUrl || '';
  
  // Ensure we have some contact method
  if (!contactPhone && link) {
    contactPhone = link;
  }
  
  return {
    type,
    bedrooms,
    bathrooms: rawListing.bathrooms || 0,
    size,
    rent: price,
    furnishing: rawListing.furnishingStatus || 'Unknown',
    availableSince: rawListing.createdAt || new Date().toISOString(),
    location,
    amenities,
    contactName,
    contactPhone,
    contactEmail,
    propertyAge: rawListing.propertyAge || 'Unknown',
    viewType: rawListing.viewType || '',
    floorLevel: rawListing.floorNumber || 0,
    parkingSpaces: rawListing.parkingSpaces || 0,
    petFriendly: !!rawListing.petFriendly,
    nearbyAttractions: rawListing.nearbyAttractions || [],
    description: rawListing.description || `Property for rent in ${location}`,
    images: rawListing.images || [],
    link,
    bhk
  };
}

const rentalApiService = {
  // Get rental listings from multiple sources
  getRentalListings: async (
    area: string,
    filters: RentalFilter = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<RentalApiResponse> => {
    // Use the retry mechanism for robust API calls
    return await withRetry(async () => {
      // Create a collection for all listings
      let allListings: Partial<RentalListing>[] = [];
      
      // Fetch from Bayut
      try {
        const bayutRes = await axios.get(BAYUT_API_ENDPOINT, {
          params: {
            locationExternalIDs: area,
            purpose: 'for-rent',
            hitsPerPage: pageSize,
            page: page,
            ...filters
          },
          headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_BAYUT_API_KEY || '1a2b3c4d5emshf6g7h8i9j0k1l2mp1n3o4pjsnq5r6s7t8u9v0',
            'X-RapidAPI-Host': 'bayut.p.rapidapi.com'
          }
        });
        
        if (bayutRes.data?.hits) {
          const bayutListings = bayutRes.data.hits.map((listing: any) => {
            return normalizeListingData(listing, 'bayut');
          });
          
          allListings = [...allListings, ...bayutListings];
          console.log(`Successfully fetched ${bayutListings.length} Bayut rental listings`);
        }
      } catch (error) {
        console.warn('Bayut API fetch failed:', error);
      }
      
      // Fetch from Property Finder
      try {
        const pfRes = await axios.get(PROPERTYFINDER_API_ENDPOINT, {
          params: {
            location: area,
            purpose: 'for-rent',
            ...filters,
            page,
            per_page: pageSize
          },
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PROPERTYFINDER_API_KEY || 'pf_api_key'}`
          }
        });
        
        if (pfRes.data?.listings) {
          const pfListings = pfRes.data.listings.map((listing: any) => {
            return normalizeListingData(listing, 'propertyfinder');
          });
          
          allListings = [...allListings, ...pfListings];
          console.log(`Successfully fetched ${pfListings.length} PropertyFinder rental listings`);
        }
      } catch (error) {
        console.warn('PropertyFinder API fetch failed:', error);
      }
      
      // Fetch from Dubizzle
      try {
        const dubizzleRes = await axios.get(DUBIZZLE_API_ENDPOINT, {
          params: {
            location: area,
            purpose: 'for-rent',
            ...filters,
            page,
            per_page: pageSize
          },
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DUBIZZLE_API_KEY || 'dubizzle_api_key'}`
          }
        });
        
        if (dubizzleRes.data?.results) {
          const dubizzleListings = dubizzleRes.data.results.map((listing: any) => {
            return normalizeListingData(listing, 'dubizzle');
          });
          
          allListings = [...allListings, ...dubizzleListings];
          console.log(`Successfully fetched ${dubizzleListings.length} Dubizzle rental listings`);
        }
      } catch (error) {
        console.warn('Dubizzle API fetch failed:', error);
      }
      
      // Deduplicate listings by comparing essential properties
      const uniqueListings: Record<string, Partial<RentalListing>> = {};
      
      for (const listing of allListings) {
        // Create a unique key based on essential properties
        const key = `${listing.type}-${listing.bedrooms}-${listing.size}-${listing.location}`;
        
        if (!uniqueListings[key] || (listing.link && !uniqueListings[key].link)) {
          uniqueListings[key] = listing;
        }
      }
      
      // Verify prices for all listings
      const verifiedListings = await Promise.all(
        Object.values(uniqueListings).map(async (listing) => {
          try {
            // Verify the rental price
            const verifiedRent = await verifyRentPrice(
              listing.location || area,
              listing.type || 'Residential',
              listing.rent || 0,
              listing.size || 0
            );
            
            // Return complete listing with ID and verified rent
            return {
              id: listing.id || `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              ...listing,
              rent: verifiedRent
            } as RentalListing;
          } catch (error) {
            // Return the original listing if verification fails
            return {
              id: listing.id || `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              ...listing
            } as RentalListing;
          }
        })
      );
      
      // Throw error if no listings found - this will trigger retry
      if (verifiedListings.length === 0) {
        throw new Error(`No rental listings found for ${area}. Retrying...`);
      }
      
      // Paginate results
      const startIndex = (page - 1) * pageSize;
      const paginatedListings = verifiedListings.slice(startIndex, startIndex + pageSize);
      
      return {
        listings: paginatedListings,
        total: verifiedListings.length,
        page,
        pageSize
      };
    });
  },
  
  // Check for new listings since the last fetch
  checkForNewListings: async (area: string, lastFetchTime: number): Promise<number> => {
    return await withRetry(async () => {
      // Make a real API call to check for new listings
      const bayutRes = await axios.get(BAYUT_API_ENDPOINT, {
        params: {
          locationExternalIDs: area,
          purpose: 'for-rent',
          hitsPerPage: 100,
          sort: 'date-desc'
        },
        headers: {
          'X-RapidAPI-Key': process.env.NEXT_PUBLIC_BAYUT_API_KEY || '1a2b3c4d5emshf6g7h8i9j0k1l2mp1n3o4pjsnq5r6s7t8u9v0',
          'X-RapidAPI-Host': 'bayut.p.rapidapi.com'
        }
      });

      // Count listings newer than lastFetchTime
      const newListings = (bayutRes.data?.hits || []).filter((listing: any) => {
        const listingDate = new Date(listing.createdAt || listing.updatedAt || 0).getTime();
        return listingDate > lastFetchTime;
      });

      console.log(`Found ${newListings.length} new listings since last check`);
      return newListings.length;
    });
  }
};

export default rentalApiService;
