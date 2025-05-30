const express = require('express');
const router = express.Router();
const MarketDemandDataCollector = require('./dataCollector');
const { createServiceLogger } = require('../utils/logger');
const cache = require('../utils/redis');

const logger = createServiceLogger('DEMAND_ROUTES');

// Initialize data collector
const dataCollector = new MarketDemandDataCollector();

// Helper functions for cache
const getFromCache = async (key) => {
  return await cache.get(key);
};

const setCache = async (key, value, ttl) => {
  return await cache.set(key, value, ttl);
};

/**
 * Get current market demand data
 * GET /api/demand/current
 */
router.get('/current', async (req, res) => {
  try {
    const { area, category } = req.query;
    const cacheKey = `demand:current:${area || 'all'}:${category || 'all'}`;
    
    // Try cache first
    let demandData = await getFromCache(cacheKey);
    
    if (!demandData) {
      demandData = await dataCollector.getCurrentDemandData(area, category);
      await setCache(cacheKey, demandData, 3600); // 1 hour cache
    }
    
    res.json({
      success: true,
      data: demandData,
      timestamp: new Date().toISOString(),
      cached: !!demandData.fromCache
    });
    
  } catch (error) {
    logger.error('Error fetching current demand data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demand data',
      message: error.message
    });
  }
});

/**
 * Get demand trends over time
 * GET /api/demand/trends
 */
router.get('/trends', async (req, res) => {
  try {
    const { area, period = '6m', category } = req.query;
    const cacheKey = `demand:trends:${area || 'all'}:${period}:${category || 'all'}`;
    
    let trendsData = await getFromCache(cacheKey);
    
    if (!trendsData) {
      trendsData = await dataCollector.getDemandTrends(area, period, category);
      await setCache(cacheKey, trendsData, 7200); // 2 hour cache
    }
    
    res.json({
      success: true,
      data: trendsData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error fetching demand trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demand trends',
      message: error.message
    });
  }
});

/**
 * Get area-specific insights
 * GET /api/demand/areas
 */
router.get('/areas', async (req, res) => {
  try {
    const { limit = 20, sortBy = 'demandScore' } = req.query;
    const cacheKey = `demand:areas:${limit}:${sortBy}`;
    
    let areasData = await getFromCache(cacheKey);
    
    if (!areasData) {
      areasData = await dataCollector.getAreaInsights(parseInt(limit), sortBy);
      await setCache(cacheKey, areasData, 3600); // 1 hour cache
    }
    
    res.json({
      success: true,
      data: areasData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error fetching area insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch area insights',
      message: error.message
    });
  }
});

/**
 * Get demographic data
 * GET /api/demand/demographics
 */
router.get('/demographics', async (req, res) => {
  try {
    const { area } = req.query;
    const cacheKey = `demand:demographics:${area || 'dubai'}`;
    
    let demographicsData = await getFromCache(cacheKey);
    
    if (!demographicsData) {
      demographicsData = await dataCollector.getDemographicsData(area);
      await setCache(cacheKey, demographicsData, 86400); // 24 hour cache
    }
    
    res.json({
      success: true,
      data: demographicsData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error fetching demographics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demographics data',
      message: error.message
    });
  }
});

/**
 * Get market predictions
 * GET /api/demand/predictions
 */
router.get('/predictions', async (req, res) => {
  try {
    const { area, timeframe = '12m' } = req.query;
    const cacheKey = `demand:predictions:${area || 'all'}:${timeframe}`;
    
    let predictionsData = await getFromCache(cacheKey);
    
    if (!predictionsData) {
      predictionsData = await dataCollector.getMarketPredictions(area, timeframe);
      await setCache(cacheKey, predictionsData, 43200); // 12 hour cache
    }
    
    res.json({
      success: true,
      data: predictionsData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error fetching market predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market predictions',
      message: error.message
    });
  }
});

/**
 * Refresh demand data
 * POST /api/demand/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { area, force = false } = req.body;
    
    logger.info(`Manual demand data refresh requested for area: ${area || 'all'}`);
    
    const result = await dataCollector.refreshDemandData(area, force);
    
    res.json({
      success: true,
      message: 'Demand data refresh completed',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error refreshing demand data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh demand data',
      message: error.message
    });
  }
});

/**
 * Get demand statistics
 * GET /api/demand/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const cacheKey = 'demand:stats:overview';
    
    let statsData = await getFromCache(cacheKey);
    
    if (!statsData) {
      statsData = await dataCollector.getDemandStatistics();
      await setCache(cacheKey, statsData, 1800); // 30 minute cache
    }
    
    res.json({
      success: true,
      data: statsData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error fetching demand statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demand statistics',
      message: error.message
    });
  }
});

module.exports = router; 