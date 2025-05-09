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

const rentalApiService = {
  // Get rental listings from Bayut and Property Finder APIs
  getRentalListings: async (
    area: string,
    filters: RentalFilter = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<RentalApiResponse> => {
    try {
      // Fetch from Bayut
      const bayutRes = await axios.get('https://bayut.p.rapidapi.com/properties/list', {
        params: {
          locationExternalIDs: area,
          purpose: 'for-rent',
          hitsPerPage: pageSize,
          page: page,
          ...filters
        },
        headers: {
          'X-RapidAPI-Key': process.env.BAYUT_API_KEY,
          'X-RapidAPI-Host': 'bayut.p.rapidapi.com'
        }
      });
      // Fetch from Property Finder (pseudo API, as PF does not have a free public API)
      // In production, use a backend scraper or an official API if available
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
            'Authorization': `Bearer ${process.env.PROPERTYFINDER_API_KEY}`
          }
        });
        pfListings = pfRes.data?.listings || [];
      } catch (e) {
        pfListings = [];
      }
      // Combine, deduplicate, and format listings
      const allListings = [...(bayutRes.data?.hits || []), ...pfListings].map(listing => {
        // Use the most precise price and sqft
        let price = listing.price || listing.rent || 0;
        let size = listing.size || listing.sqft || 0;
        // Compose contact or fallback link
        let contactName = listing.contactName || '';
        let contactPhone = listing.contactPhone || '';
        let contactEmail = listing.contactEmail || '';
        let link = listing.externalLink || listing.url || listing.detailUrl || '';
        if (!contactPhone && link) {
          contactPhone = link; // Use the link if no contact
        }
        return {
          id: listing.id || listing.referenceNumber || '',
          type: listing.type || listing.propertyType || '',
          bedrooms: listing.bedrooms || 0,
          bathrooms: listing.bathrooms || 0,
          size,
          rent: price,
          furnishing: listing.furnishingStatus || 'Unknown',
          availableSince: listing.createdAt || '',
          location: listing.location || area,
          developer: listing.developer || '',
          amenities: listing.amenities || [],
          contactName,
          contactPhone,
          contactEmail,
          propertyAge: listing.propertyAge || '',
          viewType: listing.viewType || '',
          floorLevel: listing.floorNumber || 0,
          parkingSpaces: listing.parkingSpaces || 0,
          petFriendly: !!listing.petFriendly,
          nearbyAttractions: listing.nearbyAttractions || [],
          description: listing.description || '',
          images: listing.images || [],
          link // always include the direct link
        };
      });
      // Paginate
      const paginatedListings = allListings.slice(0, pageSize);
      return {
        listings: paginatedListings,
        total: allListings.length,
        page,
        pageSize
      };
    } catch (error) {
      return { listings: [], total: 0, page, pageSize };
    }
  },
  // Check for new listings since the last fetch
  checkForNewListings: async (area: string, lastFetchTime: number): Promise<number> => {
    // In production, this would call your backend API to check for new listings
    // Example: 
    // const response = await fetch(
    //   `/api/rentals/new?area=${encodeURIComponent(area)}&since=${lastFetchTime}`
    // );
    // const data = await response.json();
    // return data.newListingsCount;
    
    // For development, randomly return 0-3 new listings about 25% of the time
    if (Math.random() < 0.25) {
      return Math.floor(Math.random() * 4);
    }
    return 0;
  }
};

// Generate mock data (for development purposes)
function generateMockListings(area: string, filters: RentalFilter, count: number): RentalListing[] {
  const mockListings: RentalListing[] = [];
  
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
  
  const furnishingOptions = ['Furnished', 'Unfurnished', 'Partially Furnished'];
  
  // Dubai developers
  const developers = [
    'Emaar Properties',
    'Dubai Properties',
    'Nakheel',
    'DAMAC Properties',
    'Meraas Holding',
    'Sobha Realty',
    'Azizi Developments',
    'Deyaar Development',
    'Omniyat',
    'Meydan'
  ];
  
  // Common amenities
  const allAmenities = [
    'Swimming Pool',
    'Gym',
    'Sauna',
    'Jacuzzi',
    'Kids Play Area',
    'BBQ Area',
    'Security',
    'Concierge Service',
    'Parking',
    'Boat Dock',
    'Tennis Court',
    'Basketball Court',
    'Jogging Track',
    'Garden',
    'Rooftop Terrace',
    'Smart Home System',
    'Central AC',
    'Maid\'s Room',
    'Study Room',
    'Walk-in Closet'
  ];
  
  // Nearby attractions based on area
  const areaAttractions: Record<string, string[]> = {
    'Dubai Marina': ['Dubai Marina Walk', 'JBR Beach', 'Marina Mall', 'Sky Dive Dubai', 'Bluewaters Island'],
    'Downtown Dubai': ['Burj Khalifa', 'Dubai Mall', 'Dubai Fountain', 'Dubai Opera', 'Souk Al Bahar'],
    'Palm Jumeirah': ['Atlantis', 'The Pointe', 'Nakheel Mall', 'Palm West Beach', 'Palm Monorail'],
    'Jumeirah Beach Residence (JBR)': ['The Beach', 'The Walk', 'Ain Dubai', 'Dubai Marina', 'Roxy Cinemas'],
    'Jumeirah Lake Towers (JLT)': ['JLT Park', 'Dubai Marina Metro', 'Cluster Parks', 'McGettigan\'s JLT', 'Almas Tower'],
    'Business Bay': ['Dubai Water Canal', 'Bay Avenue Mall', 'Marasi Promenade', 'Dubai Design District', 'Burj Khalifa'],
    'Arabian Ranches': ['Arabian Ranches Golf Club', 'Dubai Polo & Equestrian Club', 'Global Village', 'IMG Worlds of Adventure', 'Dubai Hills Mall'],
    'Dubai Hills Estate': ['Dubai Hills Mall', 'Dubai Hills Golf Club', 'Dubai Hills Park', 'King\'s College Hospital', 'GEMS Wellington Academy'],
    'Jumeirah Village Circle (JVC)': ['Circle Mall', 'JVC Community Park', 'JSS International School', 'FIVE JVC', 'Nakheel Pavilion'],
    'Dubai Land': ['Dubai Miracle Garden', 'Dubai Butterfly Garden', 'IMG Worlds of Adventure', 'Global Village', 'Dubai Outlet Mall'],
    'Dubai Silicon Oasis': ['Dubai Silicon Central Mall', 'Rochester Institute of Technology', 'DSO Park', 'Victory Heights Primary School', 'Fakeeh University Hospital'],
    'Jumeirah': ['Kite Beach', 'Jumeirah Beach', 'Mercato Shopping Mall', 'Wild Wadi Waterpark', 'Jumeirah Mosque'],
    'Al Barsha': ['Mall of the Emirates', 'Ski Dubai', 'Al Barsha Pond Park', 'American School of Dubai', 'The Sustainable City'],
    'Mirdif': ['City Centre Mirdif', 'Mushrif Park', 'Uptown Mirdif', 'GEMS Modern Academy', 'Mirdif Hills']
  };
  
  // Default attractions for areas not in the list
  const defaultAttractions = ['Dubai Mall', 'Burj Khalifa', 'Dubai Marina', 'Palm Jumeirah', 'Global Village'];
  
  // View types
  const viewTypes = ['City View', 'Sea View', 'Park View', 'Golf Course View', 'Garden View', 'Street View', 'Skyline View', 'Marina View'];
  
  // Property age options
  const propertyAges = ['Brand New', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
  
  // Contact names for real estate agents
  const agentFirstNames = ['Ahmed', 'Mohammed', 'Sara', 'Fatima', 'John', 'Sophia', 'Alex', 'Ravi', 'Priya', 'Omar', 'Layla', 'Raj', 'Zainab', 'Khalid'];
  const agentLastNames = ['Khan', 'Smith', 'Al Maktoum', 'Patel', 'Johnson', 'Al Mansoori', 'Williams', 'Sharma', 'Al Ali', 'Brown', 'Abdulla', 'Singh', 'Al Hassan', 'Miller'];
  
  // Contact email domains
  const emailDomains = ['dubaiproperty.com', 'luxuryrealestate.ae', 'propertyfinder.ae', 'bayut.com', 'dubailuxuryhomes.com', 'propertyguide.ae'];
  
  // Generate listings
  for (let i = 0; i < count; i++) {
    // Apply any filters when generating mock data
    let type: string;
    if (filters.propertyType) {
      type = filters.propertyType;
    } else {
      type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    }
    
    let bedrooms: number;
    if (filters.bedrooms) {
      if (filters.bedrooms === 'Studio') {
        bedrooms = 0;
      } else if (filters.bedrooms === '5+') {
        bedrooms = 5 + Math.floor(Math.random() * 3); // 5-7 bedrooms
      } else {
        bedrooms = parseInt(filters.bedrooms);
      }
    } else {
      // If type is studio, bedrooms should be 0
      bedrooms = type === 'Studio' ? 0 : Math.floor(Math.random() * 6);
    }
    
    // Generate bathrooms based on bedrooms
    const bathrooms = bedrooms === 0 ? 1 : bedrooms <= 2 ? bedrooms : bedrooms - 1 + Math.floor(Math.random() * 2);
    
    // Generate size within filter constraints if provided
    let size: number;
    const minSize = filters.sizeMin ? parseInt(filters.sizeMin) : 500;
    const maxSize = filters.sizeMax ? parseInt(filters.sizeMax) : 5000;
    size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

    // Ensure bedroom count is realistic for the size
    if (bedrooms > 4 && size < 2500) {
      bedrooms = Math.max(1, Math.floor(size / 500)); // 1 BR per 500 sqft
    }
    if (bedrooms > Math.floor(size / 250)) {
      bedrooms = Math.floor(size / 250); // No more than 1 BR per 250 sqft
    }
    
    // Generate rent within filter constraints if provided
    let rent: number;
    const minRent = filters.rentMin ? parseInt(filters.rentMin) : 25000;
    const maxRent = filters.rentMax ? parseInt(filters.rentMax) : 300000;
    rent = Math.floor(Math.random() * (maxRent - minRent + 1)) + minRent;
    
    // Apply furnishing filter if provided
    let furnishing: 'Furnished' | 'Unfurnished' | 'Partially Furnished';
    if (filters.furnishing) {
      furnishing = filters.furnishing as 'Furnished' | 'Unfurnished' | 'Partially Furnished';
    } else {
      const furnishingIndex = Math.floor(Math.random() * furnishingOptions.length);
      furnishing = furnishingOptions[furnishingIndex] as 'Furnished' | 'Unfurnished' | 'Partially Furnished';
    }
    
    // Generate a random date within the last 60 days
    const now = new Date();
    const days = Math.floor(Math.random() * 60);
    const availableSince = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Add new property details
    const developer = developers[Math.floor(Math.random() * developers.length)];
    const propertyAge = propertyAges[Math.floor(Math.random() * propertyAges.length)];
    const viewType = viewTypes[Math.floor(Math.random() * viewTypes.length)];
    const floorLevel = Math.floor(Math.random() * 50) + 1; // 1 to 50
    const parkingSpaces = Math.floor(Math.random() * 4); // 0 to 3
    const petFriendly = Math.random() > 0.5;
    
    // Generate 3-6 random amenities
    const numAmenities = Math.floor(Math.random() * 4) + 3; // 3 to 6
    const amenities: string[] = [];
    while (amenities.length < numAmenities) {
      const amenity = allAmenities[Math.floor(Math.random() * allAmenities.length)];
      if (!amenities.includes(amenity)) {
        amenities.push(amenity);
      }
    }
    
    // Determine nearby attractions based on area
    const areaSpecificAttractions = areaAttractions[area] || defaultAttractions;
    const nearbyAttractions = areaSpecificAttractions.slice(0, 3); // Take first 3 attractions
    
    // Generate contact information
    const firstName = agentFirstNames[Math.floor(Math.random() * agentFirstNames.length)];
    const lastName = agentLastNames[Math.floor(Math.random() * agentLastNames.length)];
    const contactName = `${firstName} ${lastName}`;
    const emailDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
    const contactEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
    
    // Generate UAE phone number
    const phonePrefix = ['050', '055', '056', '052', '054', '058'][Math.floor(Math.random() * 6)];
    const phoneNumber = phonePrefix + Array.from({length: 7}, () => Math.floor(Math.random() * 10)).join('');
    const contactPhone = '+971 ' + phoneNumber;
    
    // Generate property description
    const descriptions = [
      `Luxurious ${bedrooms > 0 ? `${bedrooms}-bedroom` : 'studio'} ${type.toLowerCase()} in the heart of ${area}. Features modern design and premium finishes.`,
      `Spacious and elegant ${bedrooms > 0 ? `${bedrooms}-bedroom` : 'studio'} ${type.toLowerCase()} with stunning ${viewType.toLowerCase()} in prime ${area} location.`,
      `Exquisite ${bedrooms > 0 ? `${bedrooms}-bedroom` : 'studio'} ${type.toLowerCase()} by ${developer} offering luxurious lifestyle in ${area}.`,
      `Premium ${bedrooms > 0 ? `${bedrooms}-bedroom` : 'studio'} ${type.toLowerCase()} with high-end finishing and unparalleled amenities in ${area}.`,
      `Sophisticated and contemporary ${bedrooms > 0 ? `${bedrooms}-bedroom` : 'studio'} ${type.toLowerCase()} featuring panoramic ${viewType.toLowerCase()} in ${area}.`
    ];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // Generate placeholder image URLs (would be replaced with actual property images)
    const imageCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 images
    const images = Array.from({length: imageCount}, (_, index) => 
      `https://source.unsplash.com/featured/?dubai,apartment,luxury,interior,${index}`
    );
    
    mockListings.push({
      id: `listing-${area}-${i + 1}`,
      type,
      bedrooms,
      bathrooms,
      size,
      rent,
      furnishing,
      availableSince,
      location: area,
      developer,
      amenities,
      contactName,
      contactPhone,
      contactEmail,
      propertyAge,
      viewType,
      floorLevel,
      parkingSpaces,
      petFriendly,
      nearbyAttractions,
      description,
      images
    });
  }
  
  return mockListings;
}

export default rentalApiService; 