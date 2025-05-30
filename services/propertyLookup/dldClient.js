const axios = require('axios');
const { createServiceLogger } = require('../utils/logger');
const cache = require('../utils/redis');

const logger = createServiceLogger('DLD_CLIENT');

class DLDAPIClient {
  constructor() {
    this.apiKey = process.env.DLD_API_KEY;
    this.apiSecret = process.env.DLD_API_SECRET;
    this.baseUrl = process.env.DLD_BASE_URL || 'https://api.dld.gov.ae';
    this.accessToken = null;
    this.tokenExpiry = null;
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting helper
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get or refresh access token
   */
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      if (!this.apiKey || !this.apiSecret) {
        throw new Error('DLD API credentials not configured. Please set DLD_API_KEY and DLD_API_SECRET environment variables.');
      }

      logger.info('Requesting new DLD access token');

      const response = await axios.post(`${this.baseUrl}/auth/token`, {
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 minute early

      logger.info('DLD access token obtained successfully');
      return this.accessToken;

    } catch (error) {
      logger.error('Failed to get DLD access token:', error);
      throw new Error(`DLD authentication failed: ${error.message}`);
    }
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, params = {}) {
    try {
      await this.enforceRateLimit();
      
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params,
        timeout: 30000 // 30 second timeout
      });

      return response.data;

    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, clear it and retry once
        this.accessToken = null;
        this.tokenExpiry = null;
        
        logger.warn('DLD token expired, retrying with new token');
        
        const token = await this.getAccessToken();
        const response = await axios.get(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          params,
          timeout: 30000
        });

        return response.data;
      }

      logger.error(`DLD API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get property details by ID
   */
  async getPropertyDetails(propertyId) {
    try {
      const cacheKey = `dld:property:${propertyId}`;
      
      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info(`Property details retrieved from cache: ${propertyId}`);
        return { ...cached, fromCache: true };
      }

      logger.info(`Fetching property details from DLD API: ${propertyId}`);

      const data = await this.makeRequest('/v1/properties/details', {
        property_id: propertyId
      });

      if (!data.property) {
        throw new Error(`Property not found: ${propertyId}`);
      }

      const propertyDetails = {
        propertyId: data.property.property_id,
        officialName: data.property.property_name,
        developer: data.property.developer_name,
        projectName: data.property.project_name,
        location: data.property.location,
        area: data.property.area,
        subArea: data.property.sub_area,
        propertyType: data.property.property_type,
        propertySubType: data.property.property_sub_type,
        bedrooms: data.property.bedrooms,
        bathrooms: data.property.bathrooms,
        size: data.property.property_size,
        plotSize: data.property.plot_size,
        buildingAge: data.property.building_age,
        completionDate: data.property.completion_date,
        currentValuation: data.property.current_valuation,
        lastSalePrice: data.property.last_sale_price,
        lastSaleDate: data.property.last_sale_date,
        coordinates: {
          lat: data.property.latitude,
          lng: data.property.longitude
        },
        amenities: data.property.amenities || [],
        nearestLandmarks: data.property.landmarks || [],
        accessibility: data.property.accessibility || {},
        utilities: data.property.utilities || {},
        retrievedAt: new Date().toISOString()
      };

      // Cache for 24 hours
      await cache.set(cacheKey, propertyDetails, 86400);

      logger.info(`Property details retrieved successfully: ${propertyId}`);
      return propertyDetails;

    } catch (error) {
      logger.error(`Error fetching property details for ${propertyId}:`, error);
      throw error;
    }
  }

  /**
   * Search properties
   */
  async searchProperties(query, filters = {}) {
    try {
      const cacheKey = `dld:search:${JSON.stringify({ query, filters })}`;
      
      // Try cache first (shorter TTL for search results)
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info('Property search results retrieved from cache');
        return { ...cached, fromCache: true };
      }

      logger.info(`Searching properties in DLD API: "${query}"`);

      const params = {
        q: query,
        limit: filters.limit || 20,
        offset: filters.offset || 0
      };

      // Add filters
      if (filters.area) params.area = filters.area;
      if (filters.propertyType) params.property_type = filters.propertyType;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.minSize) params.min_size = filters.minSize;
      if (filters.maxSize) params.max_size = filters.maxSize;

      const data = await this.makeRequest('/v1/properties/search', params);

      const searchResults = {
        results: (data.properties || []).map(property => ({
          propertyId: property.property_id,
          officialName: property.property_name,
          developer: property.developer_name,
          projectName: property.project_name,
          location: property.location,
          area: property.area,
          propertyType: property.property_type,
          bedrooms: property.bedrooms,
          size: property.property_size,
          currentValuation: property.current_valuation,
          lastSalePrice: property.last_sale_price,
          coordinates: {
            lat: property.latitude,
            lng: property.longitude
          },
          relevanceScore: property.relevance_score || 0
        })),
        totalResults: data.total_count || 0,
        query,
        filters,
        searchedAt: new Date().toISOString()
      };

      // Cache for 1 hour
      await cache.set(cacheKey, searchResults, 3600);

      logger.info(`Property search completed: ${searchResults.results.length} results found`);
      return searchResults;

    } catch (error) {
      logger.error(`Error searching properties for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get properties by developer
   */
  async getPropertiesByDeveloper(developerName, filters = {}) {
    try {
      const cacheKey = `dld:developer:${developerName}:${JSON.stringify(filters)}`;
      
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info(`Developer properties retrieved from cache: ${developerName}`);
        return { ...cached, fromCache: true };
      }

      logger.info(`Fetching properties by developer from DLD API: ${developerName}`);

      const params = {
        developer_name: developerName,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      };

      if (filters.status) params.status = filters.status;
      if (filters.propertyType) params.property_type = filters.propertyType;

      const data = await this.makeRequest('/v1/developers/properties', params);

      const developerProperties = {
        developer: developerName,
        properties: (data.properties || []).map(property => ({
          propertyId: property.property_id,
          projectName: property.project_name,
          propertyName: property.property_name,
          location: property.location,
          area: property.area,
          propertyType: property.property_type,
          status: property.status,
          totalUnits: property.total_units,
          soldUnits: property.sold_units,
          availableUnits: property.available_units,
          startDate: property.start_date,
          completionDate: property.completion_date,
          averagePrice: property.average_price,
          coordinates: {
            lat: property.latitude,
            lng: property.longitude
          }
        })),
        totalProperties: data.total_count || 0,
        retrievedAt: new Date().toISOString()
      };

      // Cache for 6 hours
      await cache.set(cacheKey, developerProperties, 21600);

      logger.info(`Developer properties retrieved: ${developerProperties.properties.length} properties`);
      return developerProperties;

    } catch (error) {
      logger.error(`Error fetching properties for developer ${developerName}:`, error);
      throw error;
    }
  }

  /**
   * Get property price history
   */
  async getPropertyPriceHistory(propertyId) {
    try {
      const cacheKey = `dld:price_history:${propertyId}`;
      
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info(`Price history retrieved from cache: ${propertyId}`);
        return { ...cached, fromCache: true };
      }

      logger.info(`Fetching price history from DLD API: ${propertyId}`);

      const data = await this.makeRequest('/v1/properties/price-history', {
        property_id: propertyId
      });

      const priceHistory = {
        propertyId,
        transactions: (data.transactions || []).map(transaction => ({
          transactionId: transaction.transaction_id,
          transactionDate: transaction.transaction_date,
          transactionType: transaction.transaction_type,
          amount: transaction.amount,
          pricePerSqFt: transaction.price_per_sqft,
          buyer: transaction.buyer_name,
          seller: transaction.seller_name,
          mortgageAmount: transaction.mortgage_amount,
          registrationFee: transaction.registration_fee
        })),
        priceMetrics: {
          currentValue: data.current_valuation,
          averagePrice: data.average_price,
          priceAppreciation: data.price_appreciation,
          lastSalePrice: data.last_sale_price,
          lastSaleDate: data.last_sale_date,
          totalTransactions: data.total_transactions
        },
        retrievedAt: new Date().toISOString()
      };

      // Cache for 12 hours
      await cache.set(cacheKey, priceHistory, 43200);

      logger.info(`Price history retrieved: ${priceHistory.transactions.length} transactions`);
      return priceHistory;

    } catch (error) {
      logger.error(`Error fetching price history for ${propertyId}:`, error);
      throw error;
    }
  }

  /**
   * Get market statistics for an area
   */
  async getAreaMarketStats(area) {
    try {
      const cacheKey = `dld:market_stats:${area}`;
      
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info(`Market stats retrieved from cache: ${area}`);
        return { ...cached, fromCache: true };
      }

      logger.info(`Fetching market statistics from DLD API: ${area}`);

      const data = await this.makeRequest('/v1/market/area-statistics', {
        area: area
      });

      const marketStats = {
        area,
        statistics: {
          totalProperties: data.total_properties,
          averagePrice: data.average_price,
          medianPrice: data.median_price,
          pricePerSqFt: data.price_per_sqft,
          totalTransactions: data.total_transactions,
          transactionVolume: data.transaction_volume,
          priceGrowth: data.price_growth,
          inventoryLevel: data.inventory_level,
          daysOnMarket: data.days_on_market
        },
        propertyTypes: data.property_types || [],
        priceRanges: data.price_ranges || [],
        trends: data.trends || [],
        retrievedAt: new Date().toISOString()
      };

      // Cache for 4 hours
      await cache.set(cacheKey, marketStats, 14400);

      logger.info(`Market statistics retrieved for: ${area}`);
      return marketStats;

    } catch (error) {
      logger.error(`Error fetching market stats for ${area}:`, error);
      throw error;
    }
  }

  /**
   * Health check for DLD API
   */
  async healthCheck() {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/v1/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        status: 'healthy',
        apiVersion: response.data.version,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('DLD API health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = DLDAPIClient; 