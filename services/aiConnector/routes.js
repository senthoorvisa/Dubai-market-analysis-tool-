const express = require('express');
const router = express.Router();
const GeminiClient = require('./geminiClient');
const { logger } = require('../utils/logger');

// Initialize Gemini client
let geminiClient;
try {
  geminiClient = new GeminiClient();
  logger.info('Gemini AI client initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Gemini client:', error);
}

/**
 * Generate market insights
 * POST /api/ai/insights
 */
router.post('/insights', async (req, res) => {
  try {
    if (!geminiClient) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available',
        message: 'Gemini client not initialized'
      });
    }

    const { marketData, analysisType = 'comprehensive' } = req.body;

    if (!marketData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        message: 'marketData is required'
      });
    }

    logger.info(`Generating ${analysisType} market insights`);

    const insights = await geminiClient.generateMarketInsights(marketData, analysisType);

    res.json({
      success: true,
      data: insights,
      analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating market insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      message: error.message
    });
  }
});

/**
 * Generate investment recommendations
 * POST /api/ai/recommendations
 */
router.post('/recommendations', async (req, res) => {
  try {
    if (!geminiClient) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available',
        message: 'Gemini client not initialized'
      });
    }

    const { propertyData, userPreferences = {} } = req.body;

    if (!propertyData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        message: 'propertyData is required'
      });
    }

    logger.info('Generating investment recommendations');

    const recommendations = await geminiClient.generateInvestmentRecommendations(
      propertyData, 
      userPreferences
    );

    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating investment recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
});

/**
 * Generate market predictions
 * POST /api/ai/predictions
 */
router.post('/predictions', async (req, res) => {
  try {
    if (!geminiClient) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available',
        message: 'Gemini client not initialized'
      });
    }

    const { historicalData, timeframe = '12m' } = req.body;

    if (!historicalData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        message: 'historicalData is required'
      });
    }

    logger.info(`Generating ${timeframe} market predictions`);

    const predictions = await geminiClient.generateMarketPredictions(historicalData, timeframe);

    res.json({
      success: true,
      data: predictions,
      timeframe,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating market predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate predictions',
      message: error.message
    });
  }
});

/**
 * Analyze developer performance
 * POST /api/ai/developer-analysis
 */
router.post('/developer-analysis', async (req, res) => {
  try {
    if (!geminiClient) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available',
        message: 'Gemini client not initialized'
      });
    }

    const { developerData } = req.body;

    if (!developerData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        message: 'developerData is required'
      });
    }

    logger.info('Analyzing developer performance');

    const analysis = await geminiClient.analyzeDeveloperPerformance(developerData);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error analyzing developer performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze developer',
      message: error.message
    });
  }
});

/**
 * Get comprehensive market analysis
 * POST /api/ai/comprehensive-analysis
 */
router.post('/comprehensive-analysis', async (req, res) => {
  try {
    if (!geminiClient) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available',
        message: 'Gemini client not initialized'
      });
    }

    const { 
      rentalData, 
      propertyData, 
      developerData, 
      demandData,
      analysisScope = 'full'
    } = req.body;

    if (!rentalData && !propertyData && !developerData && !demandData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        message: 'At least one data type is required'
      });
    }

    logger.info(`Generating comprehensive ${analysisScope} market analysis`);

    // Combine all available data
    const combinedData = {
      rental: rentalData || null,
      properties: propertyData || null,
      developers: developerData || null,
      demand: demandData || null,
      scope: analysisScope
    };

    const insights = await geminiClient.generateMarketInsights(combinedData, 'comprehensive');

    res.json({
      success: true,
      data: insights,
      scope: analysisScope,
      dataTypes: Object.keys(combinedData).filter(key => combinedData[key] !== null),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating comprehensive analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate comprehensive analysis',
      message: error.message
    });
  }
});

/**
 * Generate area comparison analysis
 * POST /api/ai/area-comparison
 */
router.post('/area-comparison', async (req, res) => {
  try {
    if (!geminiClient) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available',
        message: 'Gemini client not initialized'
      });
    }

    const { areas, comparisonCriteria = [] } = req.body;

    if (!areas || !Array.isArray(areas) || areas.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data',
        message: 'At least 2 areas are required for comparison'
      });
    }

    logger.info(`Comparing ${areas.length} areas: ${areas.join(', ')}`);

    const comparisonData = {
      areas,
      criteria: comparisonCriteria,
      analysisType: 'area-comparison'
    };

    const comparison = await geminiClient.generateMarketInsights(comparisonData, 'area-comparison');

    res.json({
      success: true,
      data: comparison,
      areas,
      criteria: comparisonCriteria,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating area comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate area comparison',
      message: error.message
    });
  }
});

/**
 * Generate investment portfolio recommendations
 * POST /api/ai/portfolio-recommendations
 */
router.post('/portfolio-recommendations', async (req, res) => {
  try {
    if (!geminiClient) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available',
        message: 'Gemini client not initialized'
      });
    }

    const { 
      budget, 
      riskTolerance = 'medium', 
      investmentGoals = [], 
      timeHorizon = '5-10 years',
      preferredAreas = [],
      propertyTypes = []
    } = req.body;

    if (!budget) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        message: 'budget is required'
      });
    }

    logger.info(`Generating portfolio recommendations for budget: ${budget}`);

    const portfolioData = {
      budget,
      riskTolerance,
      investmentGoals,
      timeHorizon,
      preferredAreas,
      propertyTypes,
      analysisType: 'portfolio-optimization'
    };

    const recommendations = await geminiClient.generateInvestmentRecommendations(
      portfolioData,
      { type: 'portfolio', diversification: true }
    );

    res.json({
      success: true,
      data: recommendations,
      parameters: {
        budget,
        riskTolerance,
        timeHorizon
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating portfolio recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate portfolio recommendations',
      message: error.message
    });
  }
});

/**
 * Get AI service status
 * GET /api/ai/status
 */
router.get('/status', (req, res) => {
  try {
    const status = {
      service: 'AI Connector',
      available: !!geminiClient,
      timestamp: new Date().toISOString()
    };

    if (geminiClient) {
      status.client = geminiClient.getStatus();
    }

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('Error getting AI service status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service status',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 * GET /api/ai/health
 */
router.get('/health', (req, res) => {
  const health = {
    status: geminiClient ? 'healthy' : 'unhealthy',
    service: 'AI Connector',
    model: 'gemini-1.5-pro',
    timestamp: new Date().toISOString()
  };

  const statusCode = geminiClient ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router; 