const express = require('express');
const DeveloperDataCollector = require('./dataCollector');
const DeveloperAnalyzer = require('./analyzer');
const { createServiceLogger } = require('../utils/logger');

const router = express.Router();
const logger = createServiceLogger('DEVELOPER_ROUTES');

// Initialize services
const dataCollector = new DeveloperDataCollector();
const analyzer = new DeveloperAnalyzer();

// GET /api/developers - Get paginated list sorted by reputation score
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'reputationScore', order = 'desc' } = req.query;
    
    logger.info('Fetching developers list', { page, limit, sortBy, order });
    
    // Get latest analyzed data
    const rawData = await dataCollector.getLatestData();
    
    if (rawData.length === 0) {
      return res.json({
        message: 'No developer data available. Try running a refresh first.',
        developers: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    // Analyze all developers
    const analyses = await analyzer.analyzeAllDevelopers(rawData);
    
    // Sort by specified field
    const sortedAnalyses = analyses.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Paginate results
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDevelopers = sortedAnalyses.slice(startIndex, endIndex);

    res.json({
      message: 'Developers list retrieved successfully',
      developers: paginatedDevelopers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: analyses.length,
        pages: Math.ceil(analyses.length / parseInt(limit)),
        hasNext: endIndex < analyses.length,
        hasPrev: parseInt(page) > 1
      },
      sortBy,
      order,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching developers list', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch developers list',
      message: error.message
    });
  }
});

// GET /api/developers/:name - Get detailed metrics for specific developer
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const developerName = decodeURIComponent(name);
    
    logger.info('Fetching developer details', { developerName });
    
    // Get latest data
    const rawData = await dataCollector.getLatestData();
    const developerData = rawData.find(d => 
      d.developerName.toLowerCase() === developerName.toLowerCase()
    );

    if (!developerData) {
      return res.status(404).json({
        error: 'Developer not found',
        message: `Developer '${developerName}' not found in our database`
      });
    }

    // Analyze the specific developer
    const analysis = await analyzer.analyzeDeveloper(developerData);
    
    // Get market insights for comparison
    const allAnalyses = await analyzer.analyzeAllDevelopers(rawData);
    const marketInsights = analyzer.generateMarketInsights(allAnalyses);
    
    // Calculate developer's market position
    const sortedByReputation = allAnalyses.sort((a, b) => b.reputationScore - a.reputationScore);
    const marketPosition = sortedByReputation.findIndex(d => d.developerName === developerName) + 1;

    res.json({
      message: 'Developer details retrieved successfully',
      developer: analysis,
      marketPosition: {
        rank: marketPosition,
        totalDevelopers: allAnalyses.length,
        percentile: Math.round((1 - (marketPosition - 1) / allAnalyses.length) * 100)
      },
      marketComparison: {
        avgReputationScore: marketInsights.averageMetrics.reputationScore,
        avgCompletionRate: marketInsights.averageMetrics.completionRate,
        avgCompletionTime: marketInsights.averageMetrics.avgCompletionTime
      },
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching developer details', { 
      developerName: req.params.name, 
      error: error.message 
    });
    
    res.status(500).json({
      error: 'Failed to fetch developer details',
      message: error.message
    });
  }
});

// GET /api/developers/insights/market - Get market insights and trends
router.get('/insights/market', async (req, res) => {
  try {
    logger.info('Generating market insights');
    
    const rawData = await dataCollector.getLatestData();
    
    if (rawData.length === 0) {
      return res.json({
        message: 'No developer data available for market insights',
        insights: {
          marketLeaders: [],
          averageMetrics: {},
          marketTrends: {},
          performanceDistribution: {}
        }
      });
    }

    const analyses = await analyzer.analyzeAllDevelopers(rawData);
    const insights = analyzer.generateMarketInsights(analyses);

    res.json({
      message: 'Market insights generated successfully',
      insights,
      generatedAt: new Date().toISOString(),
      dataSource: 'developer_analysis'
    });

  } catch (error) {
    logger.error('Error generating market insights', { error: error.message });
    res.status(500).json({
      error: 'Failed to generate market insights',
      message: error.message
    });
  }
});

// POST /api/developers/refresh - Manually trigger data collection and analysis
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Manual developer data refresh triggered');
    
    // Collect fresh data
    const rawData = await dataCollector.collectAllData();
    
    if (rawData.length === 0) {
      return res.json({
        message: 'No developer data collected',
        result: {
          developersProcessed: 0,
          analysisCompleted: false
        }
      });
    }

    // Save raw data
    const savedPath = await dataCollector.saveData(rawData);
    
    // Analyze all developers
    const analyses = await analyzer.analyzeAllDevelopers(rawData);
    
    // Generate market insights
    const insights = analyzer.generateMarketInsights(analyses);

    res.json({
      message: 'Developer data refresh completed successfully',
      result: {
        developersProcessed: rawData.length,
        totalProjects: rawData.reduce((sum, dev) => sum + dev.projects.length, 0),
        analysisCompleted: true,
        savedPath,
        topDevelopers: insights.marketLeaders.slice(0, 3)
      },
      refreshedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error during manual refresh', { error: error.message });
    res.status(500).json({
      error: 'Failed to refresh developer data',
      message: error.message
    });
  }
});

// GET /api/developers/stats/summary - Get summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    logger.info('Generating developer summary statistics');
    
    const rawData = await dataCollector.getLatestData();
    
    if (rawData.length === 0) {
      return res.json({
        message: 'No developer data available for statistics',
        stats: {
          totalDevelopers: 0,
          totalProjects: 0,
          completedProjects: 0,
          avgReputationScore: 0
        }
      });
    }

    const analyses = await analyzer.analyzeAllDevelopers(rawData);
    
    const stats = {
      totalDevelopers: analyses.length,
      totalProjects: analyses.reduce((sum, a) => sum + a.totalProjects, 0),
      completedProjects: analyses.reduce((sum, a) => sum + a.completedProjects, 0),
      ongoingProjects: analyses.reduce((sum, a) => sum + a.ongoingProjects, 0),
      avgReputationScore: Math.round(
        analyses.reduce((sum, a) => sum + a.reputationScore, 0) / analyses.length * 100
      ) / 100,
      topPerformers: analyses
        .filter(a => a.reputationScore >= 80)
        .length,
      reputationDistribution: {
        excellent: analyses.filter(a => a.reputationScore >= 80).length,
        good: analyses.filter(a => a.reputationScore >= 60 && a.reputationScore < 80).length,
        average: analyses.filter(a => a.reputationScore >= 40 && a.reputationScore < 60).length,
        below: analyses.filter(a => a.reputationScore < 40).length
      }
    };

    res.json({
      message: 'Developer summary statistics generated',
      stats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating summary statistics', { error: error.message });
    res.status(500).json({
      error: 'Failed to generate summary statistics',
      message: error.message
    });
  }
});

// GET /api/developers/health - Health check for developer service
router.get('/health', (req, res) => {
  res.json({
    service: 'developer-analysis',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/developers',
      'GET /api/developers/:name',
      'GET /api/developers/insights/market',
      'POST /api/developers/refresh',
      'GET /api/developers/stats/summary',
      'GET /api/developers/health'
    ]
  });
});

module.exports = router; 