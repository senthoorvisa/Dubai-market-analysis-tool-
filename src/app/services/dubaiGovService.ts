import axios from 'axios';

// Dubai Municipality Makani API
const MAKANI_API_BASE = 'https://www.dm.gov.ae/api/makani';
// Dubai Land Department API
const DLD_API_BASE = 'https://www.dubailand.gov.ae/api';
// RERA API
const RERA_API_BASE = 'https://www.rera.gov.ae/api';
// Dubai Statistics Center
const DSC_API_BASE = 'https://www.dsc.gov.ae/api';

export interface PropertyLocation {
  makaniNumber: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  area: string;
}

export interface PropertyTransaction {
  transactionId: string;
  propertyType: string;
  area: number;
  price: number;
  date: string;
  location: PropertyLocation;
}

export interface RentalData {
  area: string;
  propertyType: string;
  averageRent: number;
  yearOverYearChange: number;
  occupancyRate: number;
}

export interface DemographicData {
  area: string;
  population: number;
  averageIncome: number;
  nationalityDistribution: Record<string, number>;
}

// Get property location from Makani number
export async function getPropertyLocation(makaniNumber: string): Promise<PropertyLocation> {
  try {
    const response = await axios.get(`${MAKANI_API_BASE}/location/${makaniNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property location:', error);
    throw error;
  }
}

// Get property transactions from DLD
export async function getPropertyTransactions(area: string, startDate: string, endDate: string): Promise<PropertyTransaction[]> {
  try {
    const response = await axios.get(`${DLD_API_BASE}/transactions`, {
      params: {
        area,
        startDate,
        endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property transactions:', error);
    throw error;
  }
}

// Get rental market data from RERA
export async function getRentalMarketData(area: string, propertyType: string): Promise<RentalData> {
  try {
    const response = await axios.get(`${RERA_API_BASE}/rental-market`, {
      params: {
        area,
        propertyType
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rental market data:', error);
    throw error;
  }
}

// Get demographic data from Dubai Statistics Center
export async function getDemographicData(area: string): Promise<DemographicData> {
  try {
    const response = await axios.get(`${DSC_API_BASE}/demographics`, {
      params: { area }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching demographic data:', error);
    throw error;
  }
} 