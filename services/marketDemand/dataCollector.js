const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const csvParser = require('csv-parser');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('DEMAND_COLLECTOR');

class MarketDemandDataCollector {
  constructor() {
    this.dscApiKey = process.env.DSC_API_KEY;
    this.dscBaseUrl = process.env.DSC_API_BASE_URL || 'https://api.dsc.gov.ae';
    this.rawDataPath = path.join(process.cwd(), 'data', 'demand', 'raw');
    this.processedDataPath = path.join(process.cwd(), 'data', 'demand', 'processed');
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.rawDataPath, { recursive: true });
      await fs.mkdir(this.processedDataPath, { recursive: true });
      logger.info('Market demand data directories ensured');
    } catch (error) {
      logger.error('Error creating directories', { error: error.message });
      throw error;
    }
  }

  async fetchDubaiStatistics() {
    try {
      logger.info('Fetching Dubai demographic and economic statistics');

      // Mock implementation - replace with actual DSC API calls
      const demographics = await this.getMockDemographics();
      const economics = await this.getMockEconomics();
      const employment = await this.getMockEmployment();

      const dubaiStats = {
        demographics,
        economics,
        employment,
        fetchedAt: new Date().toISOString(),
        source: 'dubai_statistics_center'
      };

      return dubaiStats;
    } catch (error) {
      logger.error('Error fetching Dubai statistics', { error: error.message });
      throw error;
    }
  }

  async fetchWorldBankData() {
    try {
      logger.info('Fetching World Bank comparative data');

      // Mock implementation - replace with actual World Bank API calls
      const comparativeData = {
        uae: {
          gdpPerCapita: 43103,
          populationGrowthRate: 1.23,
          urbanizationRate: 86.8,
          unemploymentRate: 2.4
        },
        regionalComparison: {
          qatar: { gdpPerCapita: 59324, populationGrowthRate: 1.73 },
          kuwait: { gdpPerCapita: 29301, populationGrowthRate: 1.63 },
          bahrain: { gdpPerCapita: 23504, populationGrowthRate: 3.68 },
          oman: { gdpPerCapita: 15343, populationGrowthRate: 2.65 },
          saudiArabia: { gdpPerCapita: 23186, populationGrowthRate: 2.40 }
        },
        fetchedAt: new Date().toISOString(),
        source: 'world_bank'
      };

      return comparativeData;
    } catch (error) {
      logger.error('Error fetching World Bank data', { error: error.message });
      return null;
    }
  }

  async getMockDemographics() {
    return {
      totalPopulation: 3411200,
      populationGrowthRate: 1.51,
      ageDistribution: {
        '0-14': 15.2,
        '15-24': 13.8,
        '25-54': 61.2,
        '55-64': 7.1,
        '65+': 2.7
      },
      nationalityBreakdown: {
        emirati: 11.5,
        indian: 27.1,
        pakistani: 12.5,
        bangladeshi: 7.5,
        filipino: 5.1,
        iranian: 4.1,
        egyptian: 3.2,
        other: 29.0
      },
      householdSize: 4.2,
      literacyRate: 95.8,
      lastUpdated: new Date().toISOString()
    };
  }

  async getMockEconomics() {
    return {
      gdp: 421142, // Million AED
      gdpGrowthRate: 3.4,
      gdpPerCapita: 123456,
      sectorContribution: {
        realEstate: 8.9,
        wholesale_retail: 11.2,
        manufacturing: 8.7,
        transport: 7.1,
        finance: 10.4,
        government: 9.8,
        construction: 8.2,
        other: 35.7
      },
      inflation: 1.9,
      averageIncome: 15420, // Monthly AED
      lastUpdated: new Date().toISOString()
    };
  }

  async getMockEmployment() {
    return {
      totalEmployed: 2156000,
      unemploymentRate: 2.4,
      laborForceParticipation: 78.9,
      sectorEmployment: {
        construction: 18.2,
        wholesale_retail: 16.8,
        manufacturing: 12.1,
        transport: 8.9,
        finance: 7.4,
        realEstate: 6.2,
        government: 15.1,
        other: 15.3
      },
      averageSalary: {
        construction: 4200,
        finance: 12500,
        realEstate: 8900,
        retail: 3800,
        government: 9200,
        manufacturing: 5100
      },
      lastUpdated: new Date().toISOString()
    };
  }

  async calculateDemandScores() {
    try {
      logger.info('Calculating demand scores by area');

      const dubaiAreas = [
        'Downtown Dubai', 'Dubai Marina', 'Business Bay', 'JBR', 'DIFC',
        'Dubai Hills Estate', 'Arabian Ranches', 'Jumeirah', 'Dubai South',
        'Dubai Creek Harbour', 'Mohammed Bin Rashid City', 'Jumeirah Lake Towers',
        'Palm Jumeirah', 'Dubai Investment Park', 'International City'
      ];

      const demandScores = {};

      for (const area of dubaiAreas) {
        const score = this.calculateAreaDemandScore(area);
        demandScores[area] = score;
      }

      return {
        areaScores: demandScores,
        calculatedAt: new Date().toISOString(),
        methodology: 'Composite score based on population density, income levels, infrastructure, and market activity'
      };
    } catch (error) {
      logger.error('Error calculating demand scores', { error: error.message });
      throw error;
    }
  }

  calculateAreaDemandScore(area) {
    // Mock calculation - replace with actual methodology
    const factors = {
      populationDensity: Math.random() * 100,
      averageIncome: Math.random() * 100,
      infrastructure: Math.random() * 100,
      marketActivity: Math.random() * 100,
      accessibility: Math.random() * 100
    };

    // Weighted calculation
    const weights = {
      populationDensity: 0.25,
      averageIncome: 0.25,
      infrastructure: 0.20,
      marketActivity: 0.20,
      accessibility: 0.10
    };

    let score = 0;
    Object.keys(factors).forEach(factor => {
      score += factors[factor] * weights[factor];
    });

    return {
      overallScore: Math.round(score * 100) / 100,
      factors,
      grade: this.getScoreGrade(score),
      trend: this.getRandomTrend()
    };
  }

  getScoreGrade(score) {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  getRandomTrend() {
    const trends = ['increasing', 'stable', 'decreasing'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  async collectAllData() {
    try {
      logger.info('Starting comprehensive market demand data collection');

      const [dubaiStats, worldBankData, demandScores] = await Promise.all([
        this.fetchDubaiStatistics(),
        this.fetchWorldBankData(),
        this.calculateDemandScores()
      ]);

      const combinedData = {
        dubaiStatistics: dubaiStats,
        comparativeData: worldBankData,
        demandAnalysis: demandScores,
        collectedAt: new Date().toISOString()
      };

      logger.info('Market demand data collection completed', {
        areasAnalyzed: Object.keys(demandScores.areaScores).length
      });

      return combinedData;
    } catch (error) {
      logger.error('Error in comprehensive data collection', { error: error.message });
      throw error;
    }
  }

  async saveRawData(data, filename = null) {
    try {
      await this.ensureDirectories();
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `demand_raw_${timestamp}.json`;
      const filePath = path.join(this.rawDataPath, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      logger.info('Raw demand data saved', { filePath });
      return filePath;
    } catch (error) {
      logger.error('Error saving raw demand data', { error: error.message });
      throw error;
    }
  }

  async saveProcessedData(data, filename = null) {
    try {
      await this.ensureDirectories();
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `demand_processed_${timestamp}.json`;
      const filePath = path.join(this.processedDataPath, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      logger.info('Processed demand data saved', { filePath });
      return filePath;
    } catch (error) {
      logger.error('Error saving processed demand data', { error: error.message });
      throw error;
    }
  }

  async getLatestData() {
    try {
      const files = await fs.readdir(this.processedDataPath);
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
      
      if (jsonFiles.length === 0) {
        logger.warn('No processed demand data files found');
        return null;
      }
      
      const latestFile = path.join(this.processedDataPath, jsonFiles[0]);
      const data = JSON.parse(await fs.readFile(latestFile, 'utf8'));
      
      logger.info('Latest demand data loaded', { file: jsonFiles[0] });
      return data;
    } catch (error) {
      logger.error('Error loading latest demand data', { error: error.message });
      return null;
    }
  }

  async processAndSave(rawData) {
    try {
      logger.info('Processing market demand data');

      // Process and enhance the data
      const processedData = {
        ...rawData,
        processedAt: new Date().toISOString(),
        summary: {
          totalAreas: Object.keys(rawData.demandAnalysis.areaScores).length,
          averageDemandScore: this.calculateAverageDemandScore(rawData.demandAnalysis.areaScores),
          topAreas: this.getTopAreas(rawData.demandAnalysis.areaScores, 5),
          marketTrends: this.analyzeMarketTrends(rawData)
        }
      };

      // Save both raw and processed data
      await this.saveRawData(rawData);
      const processedPath = await this.saveProcessedData(processedData);

      return {
        processedData,
        savedPath: processedPath
      };
    } catch (error) {
      logger.error('Error processing demand data', { error: error.message });
      throw error;
    }
  }

  calculateAverageDemandScore(areaScores) {
    const scores = Object.values(areaScores).map(area => area.overallScore);
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100;
  }

  getTopAreas(areaScores, count) {
    return Object.entries(areaScores)
      .sort(([,a], [,b]) => b.overallScore - a.overallScore)
      .slice(0, count)
      .map(([area, data]) => ({
        area,
        score: data.overallScore,
        grade: data.grade,
        trend: data.trend
      }));
  }

  analyzeMarketTrends(data) {
    return {
      populationGrowth: data.dubaiStatistics.demographics.populationGrowthRate,
      economicGrowth: data.dubaiStatistics.economics.gdpGrowthRate,
      employmentTrend: 'positive', // Based on low unemployment
      realEstateContribution: data.dubaiStatistics.economics.sectorContribution.realEstate,
      overallOutlook: 'positive'
    };
  }

  /**
   * Get current demand data for a specific area or all areas
   */
  async getCurrentDemandData(area = null, category = null) {
    try {
      logger.info(`Getting current demand data for area: ${area || 'all'}, category: ${category || 'all'}`);
      
      const latestData = await this.getLatestData();
      if (!latestData) {
        // If no data exists, collect fresh data
        const freshData = await this.collectAllData();
        const processed = await this.processAndSave(freshData);
        return this.filterDemandData(processed.processedData, area, category);
      }
      
      return this.filterDemandData(latestData, area, category);
    } catch (error) {
      logger.error('Error getting current demand data:', error);
      throw error;
    }
  }

  /**
   * Get demand trends over time
   */
  async getDemandTrends(area = null, period = '6m', category = null) {
    try {
      logger.info(`Getting demand trends for area: ${area || 'all'}, period: ${period}`);
      
      // Mock historical data - in real implementation, this would query historical records
      const trends = this.generateMockTrends(area, period, category);
      
      return {
        area: area || 'all',
        period,
        category: category || 'all',
        data: trends,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting demand trends:', error);
      throw error;
    }
  }

  /**
   * Get area insights with rankings and comparisons
   */
  async getAreaInsights(limit = 20, sortBy = 'demandScore') {
    try {
      logger.info(`Getting area insights, limit: ${limit}, sortBy: ${sortBy}`);
      
      const demandScores = await this.calculateDemandScores();
      const areas = Object.entries(demandScores.areaScores);
      
      // Sort areas based on criteria
      areas.sort(([,a], [,b]) => {
        switch (sortBy) {
          case 'demandScore':
            return b.overallScore - a.overallScore;
          case 'populationDensity':
            return b.factors.populationDensity - a.factors.populationDensity;
          case 'averageIncome':
            return b.factors.averageIncome - a.factors.averageIncome;
          default:
            return b.overallScore - a.overallScore;
        }
      });
      
      const limitedAreas = areas.slice(0, limit);
      
      return {
        areas: limitedAreas.map(([name, data], index) => ({
          rank: index + 1,
          name,
          ...data,
          insights: this.generateAreaInsights(name, data)
        })),
        sortBy,
        limit,
        totalAreas: areas.length,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting area insights:', error);
      throw error;
    }
  }

  /**
   * Get demographic data for specific area
   */
  async getDemographicsData(area = 'dubai') {
    try {
      logger.info(`Getting demographics data for: ${area}`);
      
      const dubaiStats = await this.fetchDubaiStatistics();
      
      if (area === 'dubai') {
        return dubaiStats.demographics;
      }
      
      // For specific areas, generate area-specific demographics
      return this.generateAreaDemographics(area);
    } catch (error) {
      logger.error('Error getting demographics data:', error);
      throw error;
    }
  }

  /**
   * Get market predictions
   */
  async getMarketPredictions(area = null, timeframe = '12m') {
    try {
      logger.info(`Generating market predictions for area: ${area || 'all'}, timeframe: ${timeframe}`);
      
      const currentData = await this.getCurrentDemandData(area);
      const trends = await this.getDemandTrends(area, '12m');
      
      return this.generatePredictions(currentData, trends, timeframe);
    } catch (error) {
      logger.error('Error generating market predictions:', error);
      throw error;
    }
  }

  /**
   * Refresh demand data
   */
  async refreshDemandData(area = null, force = false) {
    try {
      logger.info(`Refreshing demand data for area: ${area || 'all'}, force: ${force}`);
      
      const startTime = Date.now();
      
      // Check if refresh is needed (unless forced)
      if (!force) {
        const latestData = await this.getLatestData();
        if (latestData) {
          const lastUpdate = new Date(latestData.processedAt);
          const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate < 6) { // Don't refresh if updated within 6 hours
            logger.info('Data is recent, skipping refresh');
            return {
              refreshed: false,
              reason: 'Data is recent',
              lastUpdate: lastUpdate.toISOString()
            };
          }
        }
      }
      
      // Collect fresh data
      const freshData = await this.collectAllData();
      const processed = await this.processAndSave(freshData);
      
      const duration = Date.now() - startTime;
      
      return {
        refreshed: true,
        duration: `${duration}ms`,
        recordsUpdated: Object.keys(processed.processedData.demandAnalysis.areaScores).length,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error refreshing demand data:', error);
      throw error;
    }
  }

  /**
   * Get demand statistics overview
   */
  async getDemandStatistics() {
    try {
      logger.info('Getting demand statistics overview');
      
      const latestData = await this.getLatestData();
      if (!latestData) {
        throw new Error('No demand data available');
      }
      
      const areaScores = latestData.demandAnalysis.areaScores;
      const scores = Object.values(areaScores).map(area => area.overallScore);
      
      return {
        overview: {
          totalAreas: Object.keys(areaScores).length,
          averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100,
          highestScore: Math.max(...scores),
          lowestScore: Math.min(...scores),
          lastUpdated: latestData.processedAt
        },
        distribution: {
          gradeA: scores.filter(s => s >= 80).length,
          gradeB: scores.filter(s => s >= 70 && s < 80).length,
          gradeC: scores.filter(s => s >= 60 && s < 70).length,
          gradeD: scores.filter(s => s >= 50 && s < 60).length,
          gradeF: scores.filter(s => s < 50).length
        },
        trends: {
          increasing: Object.values(areaScores).filter(a => a.trend === 'increasing').length,
          stable: Object.values(areaScores).filter(a => a.trend === 'stable').length,
          decreasing: Object.values(areaScores).filter(a => a.trend === 'decreasing').length
        },
        topPerformers: this.getTopAreas(areaScores, 5),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting demand statistics:', error);
      throw error;
    }
  }

  /**
   * Generate weekly insights (for scheduler)
   */
  async generateWeeklyInsights() {
    try {
      logger.info('Generating weekly market insights');
      
      const currentData = await this.getCurrentDemandData();
      const stats = await this.getDemandStatistics();
      
      return {
        areasAnalyzed: stats.overview.totalAreas,
        marketSummary: {
          averageDemandScore: stats.overview.averageScore,
          topPerformingArea: stats.topPerformers[0],
          marketTrend: this.determineOverallMarketTrend(stats)
        },
        insights: [
          'Weekly market analysis completed',
          `${stats.trends.increasing} areas showing increasing demand`,
          `${stats.distribution.gradeA} areas rated Grade A`,
          `Average market score: ${stats.overview.averageScore}`
        ],
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error generating weekly insights:', error);
      throw error;
    }
  }

  /**
   * Update area demand scores (for scheduler)
   */
  async updateAreaDemandScores() {
    try {
      logger.info('Updating area demand scores');
      
      const freshScores = await this.calculateDemandScores();
      const processed = await this.processAndSave({ demandAnalysis: freshScores });
      
      return {
        updated: true,
        areasUpdated: Object.keys(freshScores.areaScores).length,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error updating area demand scores:', error);
      throw error;
    }
  }

  /**
   * Update demographics data (for scheduler)
   */
  async updateDemographicsData() {
    try {
      logger.info('Updating demographics data');
      
      const dubaiStats = await this.fetchDubaiStatistics();
      
      return {
        areasUpdated: 1, // Dubai overall
        lastUpdate: new Date().toISOString(),
        demographics: dubaiStats.demographics
      };
    } catch (error) {
      logger.error('Error updating demographics data:', error);
      throw error;
    }
  }

  /**
   * Update economic indicators (for scheduler)
   */
  async updateEconomicIndicators() {
    try {
      logger.info('Updating economic indicators');
      
      const worldBankData = await this.fetchWorldBankData();
      
      return {
        updated: true,
        indicators: worldBankData,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error updating economic indicators:', error);
      throw error;
    }
  }

  /**
   * Recalculate demand models (for scheduler)
   */
  async recalculateDemandModels() {
    try {
      logger.info('Recalculating demand models');
      
      // This would involve more sophisticated modeling in a real implementation
      const freshData = await this.collectAllData();
      const processed = await this.processAndSave(freshData);
      
      return {
        recalculated: true,
        modelsUpdated: Object.keys(processed.processedData.demandAnalysis.areaScores).length,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error recalculating demand models:', error);
      throw error;
    }
  }

  // Helper methods

  filterDemandData(data, area, category) {
    let filteredData = { ...data };
    
    if (area && data.demandAnalysis && data.demandAnalysis.areaScores) {
      const areaData = data.demandAnalysis.areaScores[area];
      if (areaData) {
        filteredData.demandAnalysis.areaScores = { [area]: areaData };
      }
    }
    
    // Category filtering would be implemented based on specific requirements
    if (category) {
      filteredData.category = category;
    }
    
    return filteredData;
  }

  generateMockTrends(area, period, category) {
    const months = this.getPeriodMonths(period);
    const trends = [];
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        demandScore: 60 + Math.random() * 30, // Random score between 60-90
        populationGrowth: 2 + Math.random() * 3, // 2-5%
        economicActivity: 70 + Math.random() * 20, // 70-90
        propertyActivity: 50 + Math.random() * 40 // 50-90
      });
    }
    
    return trends;
  }

  getPeriodMonths(period) {
    const periodMap = {
      '3m': 3,
      '6m': 6,
      '12m': 12,
      '24m': 24
    };
    return periodMap[period] || 6;
  }

  generateAreaInsights(name, data) {
    const insights = [];
    
    if (data.overallScore >= 80) {
      insights.push('High demand area with excellent growth potential');
    } else if (data.overallScore >= 60) {
      insights.push('Moderate demand area with stable growth');
    } else {
      insights.push('Emerging area with potential for development');
    }
    
    if (data.trend === 'increasing') {
      insights.push('Showing positive growth trends');
    } else if (data.trend === 'decreasing') {
      insights.push('Experiencing some market challenges');
    }
    
    return insights;
  }

  generateAreaDemographics(area) {
    return {
      population: Math.floor(50000 + Math.random() * 200000),
      averageAge: 25 + Math.random() * 15,
      householdSize: 2.5 + Math.random() * 2,
      employmentRate: 85 + Math.random() * 10,
      averageIncome: 80000 + Math.random() * 120000,
      educationLevel: 'High',
      area: area,
      generatedAt: new Date().toISOString()
    };
  }

  generatePredictions(currentData, trends, timeframe) {
    const months = this.getPeriodMonths(timeframe);
    
    return {
      timeframe,
      confidence: 'medium',
      predictions: {
        demandGrowth: `${(2 + Math.random() * 6).toFixed(1)}%`,
        priceAppreciation: `${(3 + Math.random() * 8).toFixed(1)}%`,
        populationGrowth: `${(1 + Math.random() * 3).toFixed(1)}%`,
        marketActivity: 'increasing'
      },
      factors: [
        'Population growth',
        'Economic diversification',
        'Infrastructure development',
        'Tourism recovery'
      ],
      risks: [
        'Global economic uncertainty',
        'Regional competition',
        'Regulatory changes'
      ],
      generatedAt: new Date().toISOString()
    };
  }

  determineOverallMarketTrend(stats) {
    const increasingRatio = stats.trends.increasing / stats.overview.totalAreas;
    
    if (increasingRatio > 0.6) return 'strongly positive';
    if (increasingRatio > 0.4) return 'positive';
    if (increasingRatio > 0.2) return 'stable';
    return 'cautious';
  }
}

module.exports = MarketDemandDataCollector; 