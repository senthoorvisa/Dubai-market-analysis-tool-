// Unified Backend API Service
// Communicates with the unified server (frontend + backend on same port)

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BackendApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Rental Analysis APIs
  async getCurrentRentals() {
    return this.makeRequest('/api/rentals/current');
  }

  async getRentalTrends(params?: { month?: string }) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/api/rentals/trends${queryString}`);
  }

  async refreshRentalData(filters?: any) {
    return this.makeRequest('/api/rentals/refresh', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  }

  async getRentalStats() {
    return this.makeRequest('/api/rentals/stats');
  }

  // Additional rental methods for frontend compatibility
  async getRentalListings(area?: string, filters?: any) {
    const params: any = {};
    if (area) params.area = area;
    if (filters) Object.assign(params, filters);
    
    const queryString = Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/api/rentals/current${queryString}`);
  }

  async checkForNewListings(area: string, lastFetchTime: number) {
    const params = { area, since: lastFetchTime.toString() };
    const queryString = new URLSearchParams(params).toString();
    const response = await this.makeRequest<{ count: number }>(`/api/rentals/new-count?${queryString}`);
    return response.data?.count || 0;
  }

  async analyzeRentalData(area: string, listings: any[]) {
    return this.makeRequest('/api/ai/rental-analysis', {
      method: 'POST',
      body: JSON.stringify({ area, listings }),
    });
  }

  // Property Lookup APIs
  async getPropertyDetails(id: string) {
    return this.makeRequest(`/api/properties/details/${id}`);
  }

  async searchProperties(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/api/properties/search?${queryString}`);
  }

  async getDeveloperProperties(name: string) {
    return this.makeRequest(`/api/properties/developer/${encodeURIComponent(name)}`);
  }

  async getPropertyPriceHistory(id: string) {
    return this.makeRequest(`/api/properties/price-history/${id}`);
  }

  // Developer Analysis APIs
  async getAllDevelopers(params?: { limit?: number; sortBy?: string }) {
    if (params) {
      const stringParams: Record<string, string> = {};
      if (params.limit !== undefined) stringParams.limit = params.limit.toString();
      if (params.sortBy !== undefined) stringParams.sortBy = params.sortBy;
      const queryString = `?${new URLSearchParams(stringParams).toString()}`;
      return this.makeRequest(`/api/developers/list${queryString}`);
    }
    return this.makeRequest('/api/developers/list');
  }

  async getDeveloperAnalysis(name: string) {
    return this.makeRequest(`/api/developers/analysis/${encodeURIComponent(name)}`);
  }

  async getDeveloperInsights() {
    return this.makeRequest('/api/developers/insights');
  }

  async refreshDeveloperAnalysis() {
    return this.makeRequest('/api/developers/refresh', {
      method: 'POST',
    });
  }

  // Market Demand APIs
  async getCurrentDemand(params?: { area?: string; category?: string }) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/api/demand/current${queryString}`);
  }

  async getDemandTrends(params?: { area?: string; period?: string; category?: string }) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/api/demand/trends${queryString}`);
  }

  async getAreaInsights(params?: { limit?: number; sortBy?: string }) {
    if (params) {
      const stringParams: Record<string, string> = {};
      if (params.limit !== undefined) stringParams.limit = params.limit.toString();
      if (params.sortBy !== undefined) stringParams.sortBy = params.sortBy;
      const queryString = `?${new URLSearchParams(stringParams).toString()}`;
      return this.makeRequest(`/api/demand/insights${queryString}`);
    }
    return this.makeRequest('/api/demand/insights');
  }

  async getDemographicsData(area?: string) {
    const queryString = area ? `?area=${encodeURIComponent(area)}` : '';
    return this.makeRequest(`/api/demand/demographics${queryString}`);
  }

  // AI Services APIs
  async generateMarketInsights(data: any) {
    return this.makeRequest('/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvestmentRecommendations(data: any) {
    return this.makeRequest('/api/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMarketPredictions(data: any) {
    return this.makeRequest('/api/ai/predictions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getComprehensiveAnalysis(data: any) {
    return this.makeRequest('/api/ai/comprehensive-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

// Export singleton instance
const backendApiService = new BackendApiService();
export default backendApiService; 