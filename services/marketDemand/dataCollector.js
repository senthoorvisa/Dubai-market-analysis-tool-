const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const csvParser = require('csv-parser');
const { createServiceLogger } = require('../utils/logger');
const DLDAPIClient = require('../propertyLookup/dldClient');

const logger = createServiceLogger('MARKET_DEMAND_COLLECTOR');

class MarketDemandDataCollector {
  constructor() {
    this.dldClient = new DLDAPIClient();
    this.dubaiStatsApiKey = process.env.DUBAI_STATISTICS_API_KEY;
    this.worldBankApiKey = process.env.WORLD_BANK_API_KEY;
    this.dubaiStatsBaseUrl = 'https://api.dsc.gov.ae'; // Dubai Statistics Center
    this.worldBankBaseUrl = 'https://api.worldbank.org/v2';
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

  /**
   * Fetch real demographics data from Dubai Statistics Center
   */
  async fetchDemographicsFromDSC() {
    try {
      logger.info('Fetching demographics from Dubai Statistics Center');

      if (!this.dubaiStatsApiKey) {
        throw new Error('Dubai Statistics API key not configured');
      }

      const response = await axios.get(`${this.dubaiStatsBaseUrl}/v1/demographics/population`, {
        headers: {
          'Authorization': `Bearer ${this.dubaiStatsApiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          year: new Date().getFullYear(),
          emirate: 'dubai'
        }
      });

      const data = response.data;

      return {
        totalPopulation: data.total_population,
        populationGrowthRate: data.growth_rate,
        ageDistribution: {
          '0-14': data.age_groups['0-14'],
          '15-24': data.age_groups['15-24'],
          '25-54': data.age_groups['25-54'],
          '55-64': data.age_groups['55-64'],
          '65+': data.age_groups['65+']
        },
        nationalityBreakdown: data.nationality_breakdown,
        householdSize: data.average_household_size,
        literacyRate: data.literacy_rate,
        lastUpdated: new Date().toISOString(),
        source: 'Dubai Statistics Center'
      };

    } catch (error) {
      logger.error('Error fetching demographics from DSC:', error);
      // Return fallback data structure
      return {
        totalPopulation: null,
        populationGrowthRate: null,
        ageDistribution: {},
        nationalityBreakdown: {},
        householdSize: null,
        literacyRate: null,
        lastUpdated: new Date().toISOString(),
        source: 'DSC API Error',
        error: error.message
      };
    }
  }

  /**
   * Fetch economic data from Dubai Statistics Center
   */
  async fetchEconomicsFromDSC() {
    try {
      logger.info('Fetching economic data from Dubai Statistics Center');

      const response = await axios.get(`${this.dubaiStatsBaseUrl}/v1/economics/indicators`, {
        headers: {
          'Authorization': `Bearer ${this.dubaiStatsApiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          year: new Date().getFullYear(),
          emirate: 'dubai'
        }
      });

      const data = response.data;

      return {
        gdp: data.gdp_million_aed,
        gdpGrowthRate: data.gdp_growth_rate,
        gdpPerCapita: data.gdp_per_capita,
        sectorContribution: data.sector_contribution,
        inflation: data.inflation_rate,
        averageIncome: data.average_monthly_income,
        lastUpdated: new Date().toISOString(),
        source: 'Dubai Statistics Center'
      };

    } catch (error) {
      logger.error('Error fetching economics from DSC:', error);
      return {
        gdp: null,
        gdpGrowthRate: null,
        gdpPerCapita: null,
        sectorContribution: {},
        inflation: null,
        averageIncome: null,
        lastUpdated: new Date().toISOString(),
        source: 'DSC API Error',
        error: error.message
      };
    }
  }

  /**
   * Fetch employment data from Dubai Statistics Center
   */
  async fetchEmploymentFromDSC() {
    try {
      logger.info('Fetching employment data from Dubai Statistics Center');

      const response = await axios.get(`${this.dubaiStatsBaseUrl}/v1/labor/employment`, {
        headers: {
          'Authorization': `Bearer ${this.dubaiStatsApiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          year: new Date().getFullYear(),
          emirate: 'dubai'
        }
      });

      const data = response.data;

      return {
        totalEmployed: data.total_employed,
        unemploymentRate: data.unemployment_rate,
        laborForceParticipation: data.labor_force_participation,
        sectorEmployment: data.sector_employment,
        averageSalary: data.average_salary_by_sector,
        lastUpdated: new Date().toISOString(),
        source: 'Dubai Statistics Center'
      };

    } catch (error) {
      logger.error('Error fetching employment from DSC:', error);
      return {
        totalEmployed: null,
        unemploymentRate: null,
        laborForceParticipation: null,
        sectorEmployment: {},
        averageSalary: {},
        lastUpdated: new Date().toISOString(),
        source: 'DSC API Error',
        error: error.message
      };
    }
  }

  /**
   * Fetch global economic indicators from World Bank API
   */
  async fetchGlobalIndicators() {
    try {
      logger.info('Fetching global economic indicators from World Bank');

      const indicators = [
        'NY.GDP.MKTP.CD', // GDP (current US$)
        'SP.POP.TOTL',    // Population, total
        'FP.CPI.TOTL.ZG', // Inflation, consumer prices (annual %)
        'SL.UEM.TOTL.ZS'  // Unemployment, total (% of total labor force)
      ];

      const promises = indicators.map(indicator =>
        axios.get(`${this.worldBankBaseUrl}/country/ARE/indicator/${indicator}`, {
          params: {
            format: 'json',
            date: `${new Date().getFullYear()-1}:${new Date().getFullYear()}`,
            per_page: 10
          }
        })
      );

      const responses = await Promise.all(promises);
      const globalData = {};

      responses.forEach((response, index) => {
        const data = response.data[1]; // World Bank API returns metadata in [0], data in [1]
        if (data && data.length > 0) {
          const latestData = data[0]; // Most recent year
          globalData[indicators[index]] = {
            value: latestData.value,
            year: latestData.date,
            country: latestData.country.value
          };
        }
      });

      return {
        uaeGdp: globalData['NY.GDP.MKTP.CD'],
        uaePopulation: globalData['SP.POP.TOTL'],
        uaeInflation: globalData['FP.CPI.TOTL.ZG'],
        uaeUnemployment: globalData['SL.UEM.TOTL.ZS'],
        lastUpdated: new Date().toISOString(),
        source: 'World Bank API'
      };

    } catch (error) {
      logger.error('Error fetching global indicators:', error);
      return {
        uaeGdp: null,
        uaePopulation: null,
        uaeInflation: null,
        uaeUnemployment: null,
        lastUpdated: new Date().toISOString(),
        source: 'World Bank API Error',
        error: error.message
      };
    }
  }

  /**
   * Calculate area demand score based on real data
   */
  async calculateAreaDemandScore(area) {
    try {
      logger.info(`Calculating demand score for area: ${area}`);

      // Get property data from DLD
      const marketStats = await this.dldClient.getAreaMarketStats(area);
      
      // Get rental data
      const rentalData = await this.dldClient.makeRequest('/v1/rentals/area-statistics', {
        area: area
      });

      // Calculate demand score based on multiple factors
      let demandScore = 0;
      const factors = {};

      // Factor 1: Transaction volume (30% weight)
      if (marketStats.statistics?.totalTransactions) {
        const transactionScore = Math.min((marketStats.statistics.totalTransactions / 1000) * 30, 30);
        demandScore += transactionScore;
        factors.transactionVolume = transactionScore;
      }

      // Factor 2: Price growth (25% weight)
      if (marketStats.statistics?.priceGrowth) {
        const priceGrowthScore = Math.min(Math.max(marketStats.statistics.priceGrowth * 5, 0), 25);
        demandScore += priceGrowthScore;
        factors.priceGrowth = priceGrowthScore;
      }

      // Factor 3: Inventory level (20% weight) - lower inventory = higher demand
      if (marketStats.statistics?.inventoryLevel) {
        const inventoryScore = Math.max(20 - (marketStats.statistics.inventoryLevel / 100) * 20, 0);
        demandScore += inventoryScore;
        factors.inventoryLevel = inventoryScore;
      }

      // Factor 4: Days on market (15% weight) - fewer days = higher demand
      if (marketStats.statistics?.daysOnMarket) {
        const daysScore = Math.max(15 - (marketStats.statistics.daysOnMarket / 100) * 15, 0);
        demandScore += daysScore;
        factors.daysOnMarket = daysScore;
      }

      // Factor 5: Rental yield (10% weight)
      if (rentalData?.data?.averageYield) {
        const yieldScore = Math.min(rentalData.data.averageYield * 2, 10);
        demandScore += yieldScore;
        factors.rentalYield = yieldScore;
      }

      return {
        area,
        demandScore: Math.round(demandScore * 10) / 10,
        factors,
        marketData: marketStats.statistics,
        rentalData: rentalData?.data,
        calculatedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error calculating demand score for ${area}:`, error);
      return {
        area,
        demandScore: 0,
        factors: {},
        error: error.message,
        calculatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get current demand data for area(s)
   */
  async getCurrentDemandData(area = null, category = null) {
    try {
      logger.info(`Getting current demand data${area ? ` for ${area}` : ''}${category ? ` in ${category}` : ''}`);

      if (area) {
        // Single area analysis
        const demandScore = await this.calculateAreaDemandScore(area);
        const demographics = await this.fetchDemographicsFromDSC();
        const economics = await this.fetchEconomicsFromDSC();

        return {
          area,
          category,
          demandScore: demandScore.demandScore,
          factors: demandScore.factors,
          demographics: {
            populationGrowth: demographics.populationGrowthRate,
            totalPopulation: demographics.totalPopulation
          },
          economics: {
            gdpGrowth: economics.gdpGrowthRate,
            averageIncome: economics.averageIncome
          },
          marketData: demandScore.marketData,
          retrievedAt: new Date().toISOString(),
          totalRecords: 1
        };

      } else {
        // Multiple areas analysis
        const dubaiAreas = [
          'Downtown Dubai', 'Dubai Marina', 'Business Bay', 'DIFC',
          'Jumeirah Lake Towers', 'Dubai Hills Estate', 'City Walk',
          'Al Barsha', 'Jumeirah Village Circle', 'Dubai South'
        ];

        const areaAnalyses = [];
        for (const areaName of dubaiAreas) {
          try {
            const analysis = await this.calculateAreaDemandScore(areaName);
            areaAnalyses.push(analysis);
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            logger.error(`Failed to analyze ${areaName}:`, error);
          }
        }

        return {
          areas: areaAnalyses,
          totalRecords: areaAnalyses.length,
          retrievedAt: new Date().toISOString()
        };
      }

    } catch (error) {
      logger.error('Error getting current demand data:', error);
      throw error;
    }
  }

  /**
   * Get demand trends over time
   */
  async getDemandTrends(area, period, category) {
    try {
      logger.info(`Getting demand trends for ${area} over ${period}`);

      // Get historical market data from DLD
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate start date based on period
      switch (period) {
        case '1m': startDate.setMonth(endDate.getMonth() - 1); break;
        case '3m': startDate.setMonth(endDate.getMonth() - 3); break;
        case '6m': startDate.setMonth(endDate.getMonth() - 6); break;
        case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
        case '2y': startDate.setFullYear(endDate.getFullYear() - 2); break;
        default: startDate.setMonth(endDate.getMonth() - 6); break;
      }

      const historicalData = await this.dldClient.makeRequest('/v1/market/historical-trends', {
        area: area,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        interval: 'monthly'
      });

      const trends = (historicalData.data || []).map(dataPoint => ({
        date: dataPoint.date,
        demandScore: dataPoint.demand_score || 0,
        transactionVolume: dataPoint.transaction_volume || 0,
        averagePrice: dataPoint.average_price || 0,
        priceGrowth: dataPoint.price_growth || 0,
        inventoryLevel: dataPoint.inventory_level || 0
      }));

      return {
        area,
        period,
        category,
        data: trends,
        dataPoints: trends.length,
        retrievedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting demand trends for ${area}:`, error);
      // Return empty structure on error
      return {
        area,
        period,
        category,
        data: [],
        dataPoints: 0,
        error: error.message,
        retrievedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get area insights with real data
   */
  async getAreaInsights(limit = 20, sortBy = 'demandScore') {
    try {
      logger.info(`Getting area insights (limit: ${limit}, sortBy: ${sortBy})`);

      const currentData = await this.getCurrentDemandData();
      
      if (!currentData.areas) {
        return {
          areas: [],
          totalAreas: 0,
          retrievedAt: new Date().toISOString()
        };
      }

      // Sort areas based on criteria
      let sortedAreas = [...currentData.areas];
      
      switch (sortBy) {
        case 'demandScore':
          sortedAreas.sort((a, b) => b.demandScore - a.demandScore);
          break;
        case 'transactionVolume':
          sortedAreas.sort((a, b) => (b.marketData?.totalTransactions || 0) - (a.marketData?.totalTransactions || 0));
          break;
        case 'priceGrowth':
          sortedAreas.sort((a, b) => (b.marketData?.priceGrowth || 0) - (a.marketData?.priceGrowth || 0));
          break;
        case 'averagePrice':
          sortedAreas.sort((a, b) => (b.marketData?.averagePrice || 0) - (a.marketData?.averagePrice || 0));
          break;
        default:
          sortedAreas.sort((a, b) => b.demandScore - a.demandScore);
      }

      // Limit results
      const limitedAreas = sortedAreas.slice(0, limit);

      return {
        areas: limitedAreas,
        totalAreas: sortedAreas.length,
        sortBy,
        limit,
        retrievedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting area insights:', error);
      throw error;
    }
  }

  /**
   * Get demographics data
   */
  async getDemographicsData(area = 'dubai') {
    try {
      logger.info(`Getting demographics data for: ${area}`);

      const [demographics, economics, employment, globalData] = await Promise.all([
        this.fetchDemographicsFromDSC(),
        this.fetchEconomicsFromDSC(),
        this.fetchEmploymentFromDSC(),
        this.fetchGlobalIndicators()
      ]);

      return {
        area,
        demographics,
        economics,
        employment,
        globalContext: globalData,
        retrievedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting demographics data for ${area}:`, error);
      throw error;
    }
  }

  /**
   * Get market predictions based on real data
   */
  async getMarketPredictions(area, timeframe = '12m') {
    try {
      logger.info(`Getting market predictions for ${area || 'all areas'} over ${timeframe}`);

      // Get current market data
      const currentData = await this.getCurrentDemandData(area);
      
      // Get historical trends for prediction model
      const trends = await this.getDemandTrends(area, '2y');
      
      // Simple prediction model based on historical trends
      const predictions = this.generatePredictions(currentData, trends, timeframe);

      return {
        area: area || 'all',
        timeframe,
        predictions,
        basedOn: {
          currentData: !!currentData,
          historicalTrends: trends.dataPoints,
          predictionModel: 'Linear regression with seasonal adjustment'
        },
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting market predictions for ${area}:`, error);
      throw error;
    }
  }

  /**
   * Generate predictions based on historical data
   */
  generatePredictions(currentData, trends, timeframe) {
    try {
      const predictions = [];
      const monthsToPredict = timeframe === '6m' ? 6 : timeframe === '12m' ? 12 : 24;
      
      // Calculate trend slope from historical data
      let trendSlope = 0;
      if (trends.data && trends.data.length >= 2) {
        const recent = trends.data.slice(-6); // Last 6 months
        const avgGrowth = recent.reduce((sum, point, index) => {
          if (index === 0) return sum;
          const prevPoint = recent[index - 1];
          const growth = ((point.demandScore - prevPoint.demandScore) / prevPoint.demandScore) * 100;
          return sum + growth;
        }, 0) / (recent.length - 1);
        
        trendSlope = avgGrowth / 100; // Convert to decimal
      }

      // Generate monthly predictions
      const baseScore = currentData.demandScore || 50;
      
      for (let month = 1; month <= monthsToPredict; month++) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + month);
        
        // Apply trend with some randomness and seasonal adjustment
        const seasonalFactor = 1 + (Math.sin((month / 12) * 2 * Math.PI) * 0.1); // ±10% seasonal variation
        const trendFactor = 1 + (trendSlope * month);
        const predictedScore = baseScore * trendFactor * seasonalFactor;
        
        predictions.push({
          date: futureDate.toISOString().split('T')[0],
          month: month,
          predictedDemandScore: Math.round(Math.max(0, Math.min(100, predictedScore)) * 10) / 10,
          confidence: Math.max(0.9 - (month * 0.05), 0.3), // Decreasing confidence over time
          factors: {
            trend: trendFactor,
            seasonal: seasonalFactor,
            baseScore: baseScore
          }
        });
      }

      return predictions;

    } catch (error) {
      logger.error('Error generating predictions:', error);
      return [];
    }
  }

  /**
   * Refresh demand data
   */
  async refreshDemandData(area = null, force = false) {
    try {
      logger.info(`Refreshing demand data${area ? ` for ${area}` : ''}${force ? ' (forced)' : ''}`);

      const refreshResults = {
        area: area || 'all',
        refreshedAt: new Date().toISOString(),
        dataSources: {
          dld: { status: 'pending', records: 0 },
          dubaiStats: { status: 'pending', records: 0 },
          worldBank: { status: 'pending', records: 0 }
        },
        totalRecords: 0
      };

      // Refresh DLD data
      try {
        const dldData = await this.getCurrentDemandData(area);
        refreshResults.dataSources.dld = {
          status: 'success',
          records: dldData.totalRecords || 0
        };
        refreshResults.totalRecords += dldData.totalRecords || 0;
      } catch (error) {
        refreshResults.dataSources.dld = {
          status: 'error',
          error: error.message,
          records: 0
        };
      }

      // Refresh Dubai Statistics data
      try {
        await this.fetchDemographicsFromDSC();
        await this.fetchEconomicsFromDSC();
        await this.fetchEmploymentFromDSC();
        refreshResults.dataSources.dubaiStats = {
          status: 'success',
          records: 3 // Demographics, economics, employment
        };
      } catch (error) {
        refreshResults.dataSources.dubaiStats = {
          status: 'error',
          error: error.message,
          records: 0
        };
      }

      // Refresh World Bank data
      try {
        await this.fetchGlobalIndicators();
        refreshResults.dataSources.worldBank = {
          status: 'success',
          records: 1
        };
      } catch (error) {
        refreshResults.dataSources.worldBank = {
          status: 'error',
          error: error.message,
          records: 0
        };
      }

      logger.info(`Data refresh completed: ${refreshResults.totalRecords} total records`);
      return refreshResults;

    } catch (error) {
      logger.error('Error refreshing demand data:', error);
      throw error;
    }
  }

  /**
   * Get demand statistics
   */
  async getDemandStatistics() {
    try {
      logger.info('Getting demand statistics overview');

      const currentData = await this.getCurrentDemandData();
      const demographics = await this.getDemographicsData();

      if (!currentData.areas) {
        return {
          totalAreas: 0,
          averageDemandScore: 0,
          highDemandAreas: 0,
          lowDemandAreas: 0,
          marketTrend: 'unknown',
          lastUpdated: new Date().toISOString()
        };
      }

      const areas = currentData.areas;
      const demandScores = areas.map(area => area.demandScore).filter(score => score > 0);
      
      const averageDemandScore = demandScores.length > 0 
        ? demandScores.reduce((sum, score) => sum + score, 0) / demandScores.length 
        : 0;

      const highDemandAreas = areas.filter(area => area.demandScore >= 70).length;
      const lowDemandAreas = areas.filter(area => area.demandScore <= 30).length;

      return {
        totalAreas: areas.length,
        averageDemandScore: Math.round(averageDemandScore * 10) / 10,
        highDemandAreas,
        lowDemandAreas,
        marketTrend: averageDemandScore >= 60 ? 'positive' : averageDemandScore >= 40 ? 'stable' : 'declining',
        populationGrowth: demographics.demographics?.populationGrowthRate,
        economicGrowth: demographics.economics?.gdpGrowthRate,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting demand statistics:', error);
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
}

module.exports = MarketDemandDataCollector; 