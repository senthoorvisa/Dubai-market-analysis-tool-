const express = require('express');
const { BayutScraper, DLDAPIClient } = require('./scraper');
const RentalDataProcessor = require('./dataProcessor');
const { createServiceLogger } = require('../utils/logger');

const router = express.Router();
const logger = createServiceLogger('RENTAL_ROUTES');

// Initialize services
const bayutScraper = new BayutScraper();
const dldClient = new DLDAPIClient();
const dataProcessor = new RentalDataProcessor();

// GET /api/rentals/current - Returns today's processed data
router.get('/current', async (req, res) => {
  try {
    logger.info('Fetching current rental data');
    
    const data = await dataProcessor.getLatestProcessedData();
    
    if (data.length === 0) {
      return res.json({
        message: 'No rental data available. Try running a refresh first.',
        data: [],
        totalListings: 0,
        lastUpdated: null
      });
    }

    // Get today's data or latest if none today
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.filter(record => 
      record.transactionDate.startsWith(today)
    );

    const responseData = todayData.length > 0 ? todayData : data;
    
    res.json({
      message: 'Current rental data retrieved successfully',
      data: responseData,
      totalListings: responseData.length,
      lastUpdated: responseData.length > 0 ? responseData[0].processedAt : null,
      isToday: todayData.length > 0
    });

  } catch (error) {
    logger.error('Error fetching current rental data', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch current rental data',
      message: error.message
    });
  }
});

// GET /api/rentals/trends?month=YYYY-MM - Returns aggregated stats for specified month
router.get('/trends', async (req, res) => {
  try {
    const { month } = req.query;
    
    logger.info('Fetching rental trends', { month });
    
    const data = await dataProcessor.getLatestProcessedData();
    
    if (data.length === 0) {
      return res.json({
        message: 'No rental data available for trend analysis',
        trends: {
          month: month || 'current',
          totalListings: 0,
          averageRent: 0,
          medianRent: 0,
          areaBreakdown: {},
          bedroomBreakdown: {}
        }
      });
    }

    const trends = dataProcessor.calculateTrends(data, month);
    
    res.json({
      message: 'Rental trends calculated successfully',
      trends,
      dataSource: 'processed_rental_data',
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error calculating rental trends', { error: error.message });
    res.status(500).json({
      error: 'Failed to calculate rental trends',
      message: error.message
    });
  }
});

// POST /api/rentals/refresh - Manually trigger data refresh
router.post('/refresh', async (req, res) => {
  try {
    const { filters = {} } = req.body;
    
    logger.info('Manual rental data refresh triggered', { filters });
    
    // Initialize scraper
    await bayutScraper.init();
    
    try {
      // Fetch data from both sources
      const [bayutData, dldData] = await Promise.all([
        bayutScraper.scrapeRentals(filters),
        dldClient.fetchRentalTransactions(filters)
      ]);
      
      // Combine data
      const allData = [...bayutData, ...dldData];
      
      if (allData.length === 0) {
        return res.json({
          message: 'No new rental data found',
          result: {
            originalCount: 0,
            processedCount: 0,
            data: [],
            savedPaths: null
          }
        });
      }
      
      // Process and save data
      const result = await dataProcessor.processAndSave(allData);
      
      res.json({
        message: 'Rental data refreshed successfully',
        result,
        sources: {
          bayut: bayutData.length,
          dld: dldData.length,
          total: allData.length
        },
        refreshedAt: new Date().toISOString()
      });
      
    } finally {
      await bayutScraper.close();
    }

  } catch (error) {
    logger.error('Error during manual refresh', { error: error.message });
    res.status(500).json({
      error: 'Failed to refresh rental data',
      message: error.message
    });
  }
});

// GET /api/rentals/stats - Returns summary statistics
router.get('/stats', async (req, res) => {
  try {
    logger.info('Fetching rental statistics');
    
    const data = await dataProcessor.getLatestProcessedData();
    
    if (data.length === 0) {
      return res.json({
        message: 'No rental data available for statistics',
        stats: {
          totalListings: 0,
          sources: {},
          areas: {},
          priceRanges: {},
          lastUpdated: null
        }
      });
    }

    // Calculate stats
    const stats = {
      totalListings: data.length,
      sources: {},
      areas: {},
      bedroomTypes: {},
      priceRanges: {
        'under_50k': 0,
        '50k_100k': 0,
        '100k_200k': 0,
        'over_200k': 0
      },
      lastUpdated: data[0]?.processedAt || null
    };

    data.forEach(record => {
      // Source breakdown
      const source = record.source || 'unknown';
      stats.sources[source] = (stats.sources[source] || 0) + 1;
      
      // Area breakdown
      if (record.area && record.area !== 'N/A') {
        stats.areas[record.area] = (stats.areas[record.area] || 0) + 1;
      }
      
      // Bedroom breakdown
      const bedrooms = record.bedrooms !== null ? record.bedrooms.toString() : 'unknown';
      stats.bedroomTypes[bedrooms] = (stats.bedroomTypes[bedrooms] || 0) + 1;
      
      // Price range breakdown
      if (record.rentAmount) {
        if (record.rentAmount < 50000) {
          stats.priceRanges.under_50k++;
        } else if (record.rentAmount < 100000) {
          stats.priceRanges['50k_100k']++;
        } else if (record.rentAmount < 200000) {
          stats.priceRanges['100k_200k']++;
        } else {
          stats.priceRanges.over_200k++;
        }
      }
    });

    res.json({
      message: 'Rental statistics calculated successfully',
      stats,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error calculating rental statistics', { error: error.message });
    res.status(500).json({
      error: 'Failed to calculate rental statistics',
      message: error.message
    });
  }
});

// GET /api/rentals/health - Health check for rental service
router.get('/health', (req, res) => {
  res.json({
    service: 'rental-analysis',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/rentals/current',
      'GET /api/rentals/trends',
      'POST /api/rentals/refresh',
      'GET /api/rentals/stats',
      'GET /api/rentals/health'
    ]
  });
});

module.exports = router; 