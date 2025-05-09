export interface Property {
  id: string;
  name: string;
  type: string;
  developerName: string;
  currentPrice: number;
  soldPrice?: number;
  size: number;
  floor?: number;
  buildingAge: number;
  location: string;
  address: string;
  amenities: string[];
  description: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
}

export interface PropertyLookupResult {
  totalProperties: number;
  propertyTypes: {
    type: string;
    count: number;
  }[];
  selectedProperty: Property | null;
}

export interface PropertyForecast {
  propertyId: string;
  currentPrice: number;
  forecasts: {
    period: '6months' | '1year' | '2years' | '3years' | '5years';
    predictedPrice: number;
    confidence: number;
  }[];
}

export interface NearbyProject {
  id: string;
  name: string;
  type: 'airport' | 'mall' | 'theme_park' | 'infrastructure' | 'other';
  completionDate: string;
  estimatedValueImpact: number;
  distance: number;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PropertyFilters {
  location: string;
  propertyName?: string;
  propertyType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
}

export interface UpcomingProject {
  id: number;
  name: string;
  developer: string;
  location: string;
  completionDate: string;
  propertyTypes: string[];
  priceRange: string;
  totalUnits: number;
  keyFeatures: string[];
  constructionStatus: string;
  imageUrl?: string;
}

export interface OngoingProject {
  id: number;
  name: string;
  developer: string;
  location: string;
  completionDate: string;
  propertyTypes: string[];
  priceRange: string;
  totalUnits: number;
  percentageCompleted: number;
  keyFeatures: string[];
  constructionUpdate: string;
  imageUrl?: string;
} 