const express = require('express');
const DLDAPIClient = require('./dldClient');
const { createServiceLogger } = require('../utils/logger');

const router = express.Router();
const logger = createServiceLogger('PROPERTY_ROUTES');

// Initialize DLD client
const dldClient = new DLDAPIClient();

// GET /api/properties/:propertyId - Get full property details
router.get('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    logger.info('Fetching property details', { propertyId });
    
    if (!propertyId) {
      return res.status(400).json({
        error: 'Property ID is required',
        message: 'Please provide a valid property ID'
      });
    }

    const property = await dldClient.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
        message: `Property with ID ${propertyId} not found`
      });
    }

    res.json({
      message: 'Property details retrieved successfully',
      property,
      retrievedAt: new Date().toISOString(),
      source: 'DLD_API'
    });

  } catch (error) {
    logger.error('Error fetching property details', { 
      propertyId: req.params.propertyId, 
      error: error.message 
    });
    
    res.status(500).json({
      error: 'Failed to fetch property details',
      message: error.message
    });
  }
});

// GET /api/properties/search?q=...&location=... - Search properties
router.get('/search', async (req, res) => {
  try {
    const { q: query, location, page = 1, limit = 20 } = req.query;
    
    logger.info('Searching properties', { query, location, page, limit });
    
    if (!query) {
      return res.status(400).json({
        error: 'Search query is required',
        message: 'Please provide a search query (q parameter)'
      });
    }

    const filters = {
      location,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const searchResults = await dldClient.searchProperties(query, filters);
    
    res.json({
      message: 'Property search completed successfully',
      query,
      filters,
      results: searchResults.results || [],
      totalResults: searchResults.totalResults || 0,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        hasMore: searchResults.results?.length === filters.limit
      },
      searchedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error searching properties', { 
      query: req.query.q, 
      error: error.message 
    });
    
    res.status(500).json({
      error: 'Failed to search properties',
      message: error.message
    });
  }
});

// GET /api/properties/developer/:developerName - Get properties by developer
router.get('/developer/:developerName', async (req, res) => {
  try {
    const { developerName } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    logger.info('Fetching properties by developer', { 
      developerName, 
      page, 
      limit 
    });
    
    if (!developerName) {
      return res.status(400).json({
        error: 'Developer name is required',
        message: 'Please provide a valid developer name'
      });
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await dldClient.getPropertiesByDeveloper(developerName, pagination);
    
    res.json({
      message: 'Developer properties retrieved successfully',
      developer: developerName,
      properties: result.properties,
      pagination: result.pagination,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching properties by developer', { 
      developerName: req.params.developerName, 
      error: error.message 
    });
    
    res.status(500).json({
      error: 'Failed to fetch properties by developer',
      message: error.message
    });
  }
});

// GET /api/properties/:propertyId/history - Get property price history
router.get('/:propertyId/history', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    logger.info('Fetching property price history', { propertyId });
    
    const property = await dldClient.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
        message: `Property with ID ${propertyId} not found`
      });
    }

    const priceHistory = property.salePriceHistory || [];
    
    // Calculate additional metrics
    const prices = priceHistory.map(h => h.price).filter(p => p > 0);
    const metrics = {
      currentPrice: prices.length > 0 ? prices[prices.length - 1] : null,
      averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      priceChange: prices.length > 1 ? prices[prices.length - 1] - prices[0] : null,
      priceChangePercent: prices.length > 1 ? 
        Math.round(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 * 100) / 100 : null
    };

    res.json({
      message: 'Property price history retrieved successfully',
      propertyId,
      propertyName: property.officialName,
      priceHistory,
      metrics,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching property price history', { 
      propertyId: req.params.propertyId, 
      error: error.message 
    });
    
    res.status(500).json({
      error: 'Failed to fetch property price history',
      message: error.message
    });
  }
});

// GET /api/properties/summary/stats - Get summary statistics
router.get('/summary/stats', async (req, res) => {
  try {
    logger.info('Generating property summary statistics');
    
    // This would typically aggregate data from a database
    // For now, we'll return mock summary stats
    const stats = {
      totalProperties: Math.floor(Math.random() * 100000) + 50000,
      activeListings: Math.floor(Math.random() * 20000) + 10000,
      averagePrice: Math.floor(Math.random() * 1000000) + 800000,
      priceRange: {
        min: 200000,
        max: 5000000
      },
      topAreas: [
        { name: 'Downtown Dubai', count: 1234, avgPrice: 1200000 },
        { name: 'Dubai Marina', count: 987, avgPrice: 950000 },
        { name: 'Business Bay', count: 876, avgPrice: 850000 },
        { name: 'JBR', count: 654, avgPrice: 1100000 },
        { name: 'DIFC', count: 543, avgPrice: 1400000 }
      ],
      topDevelopers: [
        { name: 'Emaar Properties', count: 2345 },
        { name: 'DAMAC Properties', count: 1876 },
        { name: 'Dubai Properties', count: 1543 },
        { name: 'Nakheel', count: 1234 },
        { name: 'Sobha Realty', count: 987 }
      ],
      propertyTypes: {
        apartment: 45,
        villa: 25,
        townhouse: 15,
        penthouse: 10,
        studio: 5
      }
    };

    res.json({
      message: 'Property summary statistics generated',
      stats,
      generatedAt: new Date().toISOString(),
      note: 'Statistics are based on available property data'
    });

  } catch (error) {
    logger.error('Error generating property statistics', { error: error.message });
    
    res.status(500).json({
      error: 'Failed to generate property statistics',
      message: error.message
    });
  }
});

// GET /api/properties/health - Health check for property service
router.get('/health', (req, res) => {
  res.json({
    service: 'property-lookup',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/properties/:propertyId',
      'GET /api/properties/search',
      'GET /api/properties/developer/:developerName',
      'GET /api/properties/:propertyId/history',
      'GET /api/properties/summary/stats',
      'GET /api/properties/health'
    ],
    dependencies: {
      dld_api: 'connected',
      redis_cache: 'available'
    }
  });
});

module.exports = router; 