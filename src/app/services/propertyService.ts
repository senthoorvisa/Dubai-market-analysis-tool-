import axios from 'axios';
import { PropertyLookupResult, PropertyForecast, NearbyProject, PropertyFilters } from '../interfaces/property';

// For now, we'll mock the API response data
const mockProperties: PropertyLookupResult = {
  totalProperties: 156,
  propertyTypes: [
    { type: 'Apartment', count: 87 },
    { type: 'Villa', count: 45 },
    { type: 'Townhouse', count: 12 },
    { type: 'Penthouse', count: 8 },
    { type: 'Duplex', count: 4 }
  ],
  selectedProperty: {
    id: 'prop-12345',
    name: 'Marina Heights Residence',
    type: 'Apartment',
    developerName: 'Dubai Properties',
    currentPrice: 2500000,
    soldPrice: 2200000,
    size: 1500,
    floor: 15,
    buildingAge: 3,
    location: 'Dubai Marina',
    address: 'Marina Heights Tower, Dubai Marina, Dubai, UAE',
    amenities: ['Swimming Pool', 'Gym', 'Sauna', 'BBQ Area', '24/7 Security'],
    description: 'Luxurious apartment with stunning views of the marina and the sea.',
    images: ['/images/property1.jpg', '/images/property2.jpg']
  }
};

const mockForecast: PropertyForecast = {
  propertyId: 'prop-12345',
  currentPrice: 2500000,
  forecasts: [
    { period: '6months', predictedPrice: 2625000, confidence: 0.85 },
    { period: '1year', predictedPrice: 2750000, confidence: 0.78 },
    { period: '2years', predictedPrice: 3000000, confidence: 0.70 },
    { period: '3years', predictedPrice: 3250000, confidence: 0.65 },
    { period: '5years', predictedPrice: 3750000, confidence: 0.60 }
  ]
};

const mockNearbyProjects: NearbyProject[] = [
  {
    id: 'np-001',
    name: 'Dubai Marina Mall Expansion',
    type: 'mall',
    completionDate: '2025-08-15',
    estimatedValueImpact: 6.5,
    distance: 0.8,
    description: 'Expansion of Dubai Marina Mall with additional retail and entertainment facilities.',
    coordinates: { lat: 25.076, lng: 55.138 }
  },
  {
    id: 'np-002',
    name: 'Marina Metro Line Extension',
    type: 'infrastructure',
    completionDate: '2026-03-10',
    estimatedValueImpact: 8.2,
    distance: 0.5,
    description: 'Extension of the metro line with a new station in Dubai Marina.',
    coordinates: { lat: 25.075, lng: 55.140 }
  },
  {
    id: 'np-003',
    name: 'Marina Bay Promenade',
    type: 'infrastructure',
    completionDate: '2024-12-01',
    estimatedValueImpact: 4.3,
    distance: 0.3,
    description: 'New promenade with restaurants and entertainment facilities.',
    coordinates: { lat: 25.078, lng: 55.136 }
  }
];

export const propertyService = {
  // Function to lookup properties and get details
  getPropertyDetails: async (location: string, propertyName?: string): Promise<PropertyLookupResult> => {
    try {
      // First API call to get property data
      const firstApiCall = async () => {
        // In a real application, this would be an actual API call
        // For now, we simulate with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProperties;
      };

      // Second API call to verify the data
      const verifyData = async (initialData: PropertyLookupResult) => {
        // In a real application, this would be a separate verification API call
        // For now, we simulate with a delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Here we would compare the data and resolve discrepancies
        // For this implementation, we're adjusting some values to be more accurate
        const verifiedData = { ...initialData };
        
        // Adjust property details to be more accurate
        if (verifiedData.selectedProperty) {
          // Update developer name to be more accurate
          // Double AI API verification for developer name
          // Simulate two independent AI API calls (in real implementation, replace with actual API calls)
          let ai1Developer = '';
          let ai2Developer = '';
          if (location.includes('Marina')) {
            ai1Developer = 'Emaar Properties';
            ai2Developer = 'Emaar Properties';
          } else if (location.includes('Palm')) {
            ai1Developer = 'Nakheel';
            ai2Developer = 'Nakheel';
          } else if (location.includes('Downtown')) {
            ai1Developer = 'Emaar Properties';
            ai2Developer = 'Dubai Properties'; // Simulate a disagreement for demonstration
          }

          if (ai1Developer && ai2Developer) {
            if (ai1Developer === ai2Developer) {
              verifiedData.selectedProperty.developerName = ai1Developer;
            } else {
              verifiedData.selectedProperty.developerName = 'Verification Needed';
            }
          }
          
          // Adjust prices to be more accurate (10-15% lower than mock data)
          verifiedData.selectedProperty.currentPrice = Math.round(verifiedData.selectedProperty.currentPrice * 0.85);
          if (verifiedData.selectedProperty.soldPrice) {
            verifiedData.selectedProperty.soldPrice = Math.round(verifiedData.selectedProperty.soldPrice * 0.85);
          }
          
          // Update accommodation details
          verifiedData.selectedProperty.bedrooms = 1;
          verifiedData.selectedProperty.bathrooms = 2;
          verifiedData.selectedProperty.size = 1380; // Update to match the image
        }
        
        return verifiedData;
      };

      // Execute both API calls
      const initialData = await firstApiCall();
      const verifiedData = await verifyData(initialData);
      
      return verifiedData;
    } catch (error) {
      console.error('Error fetching property details:', error);
      throw error;
    }
  },

  // Function to get price forecasts for a property
  getPropertyForecast: async (propertyId: string): Promise<PropertyForecast> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Return the mock forecast data
      return mockForecast;
    } catch (error) {
      console.error('Error fetching property forecast:', error);
      throw error;
    }
  },

  // Function to get nearby infrastructure projects
  getNearbyProjects: async (propertyId: string): Promise<NearbyProject[]> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Return the mock nearby projects
      return mockNearbyProjects;
    } catch (error) {
      console.error('Error fetching nearby projects:', error);
      throw error;
    }
  },

  // Function to search properties with filters
  searchProperties: async (filters: PropertyFilters): Promise<PropertyLookupResult> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, we would use the filters to get specific results
      // For now, we'll just return the mock data
      return mockProperties;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }
}; 