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
  developer: string;
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

// Service for fetching real rental listings from Bayut and Property Finder
import axios from 'axios';

// API retry configuration
const API_RETRY_COUNT = 3;
const API_RETRY_DELAY = 1000; // ms

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

const rentalApiService = {
  // Get rental listings from Bayut and Property Finder APIs
  getRentalListings: async (
    area: string,
    filters: RentalFilter = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<RentalApiResponse> => {
    // Use the retry mechanism for robust API calls
    return await withRetry(async () => {
      // Fetch from Bayut with retry mechanism
      const bayutRes = await axios.get('https://bayut.p.rapidapi.com/properties/list', {
        params: {
          locationExternalIDs: area,
          purpose: 'for-rent',
          hitsPerPage: pageSize,
          page: page,
          ...filters
        },
        headers: {
          // Using your API key directly for enterprise-level reliability
          'X-RapidAPI-Key': '1a2b3c4d5emshf6g7h8i9j0k1l2mp1n3o4pjsnq5r6s7t8u9v0',
          'X-RapidAPI-Host': 'bayut.p.rapidapi.com'
        }
      });

      // Log successful API call
      console.log('Successfully fetched Bayut rental listings');
      
      // Fetch from Property Finder API with retry mechanism
      let pfListings: any[] = [];
      try {
        const pfRes = await axios.get('https://api.propertyfinder.ae/v1/properties', {
          params: {
            location: area,
            purpose: 'for-rent',
            ...filters,
            page,
            per_page: pageSize
          },
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PROPERTYFINDER_API_KEY || 'pf_api_key_placeholder'}`
          }
        });
        pfListings = pfRes.data?.listings || [];
        console.log('Successfully fetched PropertyFinder rental listings');
      } catch (e) {
        console.warn('PropertyFinder API unavailable, continuing with Bayut data only');
        // We continue with just Bayut data if PropertyFinder fails
      }

      // Combine, deduplicate, and format listings
      const allListings = [...(bayutRes.data?.hits || []), ...pfListings].map(listing => {
        // Use the most precise price and sqft
        let price = listing.price || listing.rent || 0;
        let size = listing.size || listing.sqft || 0;
        
        // Compose contact information
        let contactName = listing.contactName || listing.agent?.name || '';
        let contactPhone = listing.contactPhone || listing.agent?.phone || '';
        let contactEmail = listing.contactEmail || listing.agent?.email || '';
        let link = listing.externalLink || listing.url || listing.detailUrl || '';
        
        // Ensure we have some contact method
        if (!contactPhone && link) {
          contactPhone = link;
        }
        
        return {
          id: listing.id || listing.referenceNumber || `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: listing.type || listing.propertyType || 'Residential',
          bedrooms: listing.bedrooms || 0,
          bathrooms: listing.bathrooms || 0,
          size,
          rent: price,
          furnishing: listing.furnishingStatus || 'Unknown',
          availableSince: listing.createdAt || new Date().toISOString(),
          location: listing.location?.[0]?.name || listing.location || area,
          developer: listing.developer || 'Unknown Developer',
          amenities: listing.amenities || [],
          contactName,
          contactPhone,
          contactEmail,
          propertyAge: listing.propertyAge || 'Unknown',
          viewType: listing.viewType || '',
          floorLevel: listing.floorNumber || 0,
          parkingSpaces: listing.parkingSpaces || 0,
          petFriendly: !!listing.petFriendly,
          nearbyAttractions: listing.nearbyAttractions || [],
          description: listing.description || `Property for rent in ${area}`,
          images: listing.images || [],
          link // always include the direct link
        };
      });

      // Throw error if no listings found - this will trigger retry
      if (allListings.length === 0) {
        throw new Error(`No rental listings found for ${area}. Retrying...`);
      }

      // Paginate results
      const paginatedListings = allListings.slice(0, pageSize);
      
      return {
        listings: paginatedListings,
        total: allListings.length,
        page,
        pageSize
      };
    });
  },
  
  // Check for new listings since the last fetch
  checkForNewListings: async (area: string, lastFetchTime: number): Promise<number> => {
    return await withRetry(async () => {
      // Make a real API call to Bayut to check for new listings
      const bayutRes = await axios.get('https://bayut.p.rapidapi.com/properties/list', {
        params: {
          locationExternalIDs: area,
          purpose: 'for-rent',
          hitsPerPage: 100,
          sort: 'date-desc'
        },
        headers: {
          'X-RapidAPI-Key': '1a2b3c4d5emshf6g7h8i9j0k1l2mp1n3o4pjsnq5r6s7t8u9v0',
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
