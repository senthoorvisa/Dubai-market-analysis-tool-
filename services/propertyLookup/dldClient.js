const axios = require('axios');
const cache = require('../utils/redis');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('DLD_CLIENT');

class DLDAPIClient {
  constructor() {
    this.apiKey = process.env.DLD_API_KEY;
    this.baseUrl = process.env.DLD_API_BASE_URL || 'https://api.dubailand.gov.ae';
    this.rateLimitDelay = 1000; // 1 second between requests
    this.maxRetries = 3;
    this.lastRequestTime = 0;
  }

  async authenticate() {
    try {
      // Mock authentication - replace with actual DLD auth when available
      if (!this.apiKey) {
        logger.warn('DLD API key not configured, using mock mode');
        return { token: 'mock_token', expiresAt: Date.now() + 3600000 };
      }

      const response = await axios.post(`${this.baseUrl}/auth/token`, {
        apiKey: this.apiKey
      });

      logger.info('DLD API authentication successful');
      return response.data;
    } catch (error) {
      logger.error('DLD API authentication failed', { error: error.message });
      throw new Error('DLD API authentication failed');
    }
  }

  async makeRequest(endpoint, params = {}, retryCount = 0) {
    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.rateLimitDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
        );
      }
      this.lastRequestTime = Date.now();

      const config = {
        method: 'GET',
        url: `${this.baseUrl}${endpoint}`,
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey || 'mock_token'}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      const response = await axios(config);
      return response.data;

    } catch (error) {
      logger.error('DLD API request failed', { 
        endpoint, 
        params, 
        error: error.message, 
        retryCount 
      });

      // Retry logic
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        logger.info('Retrying DLD API request', { endpoint, retryCount: retryCount + 1 });
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return this.makeRequest(endpoint, params, retryCount + 1);
      }

      throw error;
    }
  }

  shouldRetry(error) {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status === 429 || status >= 500; // Rate limit or server error
  }

  async getPropertyById(propertyId) {
    try {
      const cacheKey = `property:${propertyId}`;
      
      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Property data found in cache', { propertyId });
        return cached;
      }

      logger.info('Fetching property from DLD API', { propertyId });

      // Mock implementation - replace with actual API call
      const mockProperty = {
        propertyId: propertyId,
        officialName: `Property ${propertyId}`,
        developer: this.getMockDeveloper(),
        projectName: this.getMockProjectName(),
        locationCoordinates: {
          latitude: 25.0657 + (Math.random() - 0.5) * 0.1,
          longitude: 55.1713 + (Math.random() - 0.5) * 0.1
        },
        salePriceHistory: this.generateMockPriceHistory(),
        plotSize: Math.floor(Math.random() * 5000) + 1000,
        builtUpArea: Math.floor(Math.random() * 3000) + 800,
        propertyType: this.getMockPropertyType(),
        registrationDate: this.getRandomDate(),
        lastSaleDate: this.getRandomDate(),
        currentValuation: Math.floor(Math.random() * 2000000) + 500000,
        status: 'Active'
      };

      // Cache for 24 hours
      await cache.set(cacheKey, mockProperty, 24 * 3600);

      logger.info('Property data cached successfully', { propertyId });
      return mockProperty;

    } catch (error) {
      logger.error('Error fetching property', { propertyId, error: error.message });
      throw error;
    }
  }

  async searchProperties(query, filters = {}) {
    try {
      const { location, page = 1, limit = 20 } = filters;
      
      const cacheKey = `property_search:${JSON.stringify({ query, location, page, limit })}`;
      
      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Property search results found in cache');
        return cached;
      }

      logger.info('Searching properties in DLD API', { query, filters });

      // Mock implementation - replace with actual API call
      const mockResults = this.generateMockSearchResults(query, filters);

      // Cache for 1 hour
      await cache.set(cacheKey, mockResults, 3600);

      return mockResults;

    } catch (error) {
      logger.error('Error searching properties', { query, filters, error: error.message });
      throw error;
    }
  }

  async getPropertiesByDeveloper(developerName, pagination = {}) {
    try {
      const { page = 1, limit = 50 } = pagination;
      
      logger.info('Fetching properties by developer', { developerName, page, limit });

      // Mock implementation
      const properties = [];
      const totalProperties = Math.floor(Math.random() * 200) + 50;
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, totalProperties);

      for (let i = startIndex; i < endIndex; i++) {
        properties.push({
          propertyId: `dev_${developerName.replace(/\s+/g, '_')}_${i + 1}`,
          officialName: `${developerName} Property ${i + 1}`,
          developer: developerName,
          projectName: this.getMockProjectName(),
          currentValuation: Math.floor(Math.random() * 2000000) + 500000,
          registrationDate: this.getRandomDate(),
          status: 'Active'
        });
      }

      return {
        properties,
        pagination: {
          page,
          limit,
          total: totalProperties,
          pages: Math.ceil(totalProperties / limit),
          hasNext: page < Math.ceil(totalProperties / limit),
          hasPrev: page > 1
        }
      };

    } catch (error) {
      logger.error('Error fetching properties by developer', { 
        developerName, 
        error: error.message 
      });
      throw error;
    }
  }

  // Helper methods for mock data generation
  getMockDeveloper() {
    const developers = [
      'Emaar Properties', 'DAMAC Properties', 'Dubai Properties', 
      'Nakheel', 'Sobha Realty', 'Meraas', 'Azizi Developments',
      'Ellington Properties', 'Omniyat', 'Deyaar Development'
    ];
    return developers[Math.floor(Math.random() * developers.length)];
  }

  getMockProjectName() {
    const projects = [
      'Downtown Views', 'Marina Residences', 'Palm Gardens',
      'Sky Heights', 'Golden Square', 'Crystal Towers',
      'Emerald Bay', 'Diamond District', 'Platinum Plaza'
    ];
    return projects[Math.floor(Math.random() * projects.length)];
  }

  getMockPropertyType() {
    const types = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  }

  generateMockPriceHistory() {
    const history = [];
    const basePrice = Math.floor(Math.random() * 1500000) + 500000;
    let currentPrice = basePrice;
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Add some variation
      currentPrice += (Math.random() - 0.5) * 50000;
      currentPrice = Math.max(currentPrice, basePrice * 0.8); // Don't go below 80% of base
      
      history.unshift({
        date: date.toISOString(),
        price: Math.floor(currentPrice)
      });
    }
    
    return history;
  }

  generateMockSearchResults(query, filters) {
    const results = [];
    const totalResults = Math.floor(Math.random() * 100) + 20;
    const limit = Math.min(filters.limit || 20, totalResults);

    for (let i = 0; i < limit; i++) {
      results.push({
        propertyId: `search_${Date.now()}_${i}`,
        officialName: `${query} Property ${i + 1}`,
        developer: this.getMockDeveloper(),
        projectName: this.getMockProjectName(),
        location: filters.location || 'Dubai',
        currentValuation: Math.floor(Math.random() * 2000000) + 500000,
        propertyType: this.getMockPropertyType(),
        relevanceScore: Math.random() * 100
      });
    }

    return {
      results,
      totalResults,
      query,
      filters,
      searchedAt: new Date().toISOString()
    };
  }
}

module.exports = DLDAPIClient; 