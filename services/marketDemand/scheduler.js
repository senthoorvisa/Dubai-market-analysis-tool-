const cron = require('node-cron');
const MarketDemandDataCollector = require('./dataCollector');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('DEMAND_SCHEDULER');

class DemandScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
    this.dataCollector = new MarketDemandDataCollector();
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      logger.warn('Demand scheduler is already running');
      return;
    }

    try {
      // Daily demand data collection at 4:00 AM Dubai time
      const dailyJob = cron.schedule('0 4 * * *', async () => {
        await this.runDailyCollection();
      }, {
        scheduled: false,
        timezone: 'Asia/Dubai'
      });

      // Weekly comprehensive analysis on Mondays at 5:00 AM Dubai time
      const weeklyJob = cron.schedule('0 5 * * 1', async () => {
        await this.runWeeklyAnalysis();
      }, {
        scheduled: false,
        timezone: 'Asia/Dubai'
      });

      // Monthly demographic update on 1st of each month at 6:00 AM Dubai time
      const monthlyJob = cron.schedule('0 6 1 * *', async () => {
        await this.runMonthlyUpdate();
      }, {
        scheduled: false,
        timezone: 'Asia/Dubai'
      });

      this.jobs = [
        { name: 'daily-demand-collection', job: dailyJob },
        { name: 'weekly-demand-analysis', job: weeklyJob },
        { name: 'monthly-demographic-update', job: monthlyJob }
      ];

      // Start all jobs
      this.jobs.forEach(({ name, job }) => {
        job.start();
        logger.info(`✅ Started ${name} scheduler`);
      });

      this.isRunning = true;
      logger.info('🕐 Market Demand scheduler started successfully');

    } catch (error) {
      logger.error('Failed to start demand scheduler:', error);
      throw error;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Demand scheduler is not running');
      return;
    }

    this.jobs.forEach(({ name, job }) => {
      job.stop();
      logger.info(`⏹️ Stopped ${name} scheduler`);
    });

    this.isRunning = false;
    logger.info('Market Demand scheduler stopped');
  }

  /**
   * Daily demand data collection
   */
  async runDailyCollection() {
    const startTime = Date.now();
    logger.info('🔄 Starting daily demand data collection...');

    try {
      // Collect current demand data for all major areas
      const areas = [
        'Downtown Dubai', 'Dubai Marina', 'Business Bay', 'DIFC',
        'Jumeirah Lake Towers', 'Dubai Hills Estate', 'City Walk',
        'Al Barsha', 'Jumeirah Village Circle', 'Dubai South'
      ];

      const results = [];
      
      for (const area of areas) {
        try {
          const demandData = await this.dataCollector.getCurrentDemandData(area);
          results.push({
            area,
            success: true,
            recordsCollected: demandData?.totalRecords || 0
          });
          
          // Small delay to avoid overwhelming APIs
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          logger.error(`Failed to collect demand data for ${area}:`, error);
          results.push({
            area,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalRecords = results.reduce((sum, r) => sum + (r.recordsCollected || 0), 0);
      
      const duration = Date.now() - startTime;
      
      logger.info(`✅ Daily demand collection completed in ${duration}ms`);
      logger.info(`📊 Collected data for ${successCount}/${areas.length} areas (${totalRecords} total records)`);

      // Check for significant changes and send notifications if needed
      await this.checkForSignificantChanges(results);

    } catch (error) {
      logger.error('❌ Daily demand collection failed:', error);
      throw error;
    }
  }

  /**
   * Weekly comprehensive analysis
   */
  async runWeeklyAnalysis() {
    const startTime = Date.now();
    logger.info('🔄 Starting weekly demand analysis...');

    try {
      // Generate comprehensive market insights
      const analysisResults = await this.dataCollector.generateWeeklyInsights();
      
      // Update area demand scores
      await this.dataCollector.updateAreaDemandScores();
      
      // Generate market predictions
      const predictions = await this.dataCollector.getMarketPredictions(null, '12m');
      
      const duration = Date.now() - startTime;
      
      logger.info(`✅ Weekly demand analysis completed in ${duration}ms`);
      logger.info(`📈 Generated insights for ${analysisResults?.areasAnalyzed || 0} areas`);
      logger.info(`🔮 Updated predictions for next 12 months`);

    } catch (error) {
      logger.error('❌ Weekly demand analysis failed:', error);
      throw error;
    }
  }

  /**
   * Monthly demographic update
   */
  async runMonthlyUpdate() {
    const startTime = Date.now();
    logger.info('🔄 Starting monthly demographic update...');

    try {
      // Update demographic data from official sources
      const demographicResults = await this.dataCollector.updateDemographicsData();
      
      // Refresh economic indicators
      await this.dataCollector.updateEconomicIndicators();
      
      // Recalculate demand models with new data
      await this.dataCollector.recalculateDemandModels();
      
      const duration = Date.now() - startTime;
      
      logger.info(`✅ Monthly demographic update completed in ${duration}ms`);
      logger.info(`👥 Updated demographic data for ${demographicResults?.areasUpdated || 0} areas`);

    } catch (error) {
      logger.error('❌ Monthly demographic update failed:', error);
      throw error;
    }
  }

  /**
   * Check for significant changes in demand patterns
   */
  async checkForSignificantChanges(results) {
    try {
      const significantChanges = [];
      
      for (const result of results.filter(r => r.success)) {
        // Get historical data for comparison
        const trends = await this.dataCollector.getDemandTrends(result.area, '1m');
        
        if (trends && trends.data && trends.data.length >= 2) {
          const latest = trends.data[trends.data.length - 1];
          const previous = trends.data[trends.data.length - 2];
          
          const changePercent = ((latest.demandScore - previous.demandScore) / previous.demandScore) * 100;
          
          // Flag changes greater than 15%
          if (Math.abs(changePercent) > 15) {
            significantChanges.push({
              area: result.area,
              changePercent: changePercent.toFixed(2),
              currentScore: latest.demandScore,
              previousScore: previous.demandScore,
              trend: changePercent > 0 ? 'increasing' : 'decreasing'
            });
          }
        }
      }

      if (significantChanges.length > 0) {
        logger.warn(`🚨 Significant demand changes detected in ${significantChanges.length} areas:`);
        significantChanges.forEach(change => {
          logger.warn(`   ${change.area}: ${change.changePercent}% ${change.trend} (${change.previousScore} → ${change.currentScore})`);
        });
        
        // Here you could integrate with notification services
        // await notificationService.sendAlert('Significant Market Changes', significantChanges);
      }

    } catch (error) {
      logger.error('Error checking for significant changes:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: this.jobs.map(({ name, job }) => ({
        name,
        running: job.running || false
      }))
    };
  }

  /**
   * Run manual collection for testing
   */
  async runManualCollection(area = null) {
    logger.info(`🔄 Running manual demand collection${area ? ` for ${area}` : ''}...`);
    
    try {
      if (area) {
        return await this.dataCollector.getCurrentDemandData(area);
      } else {
        return await this.runDailyCollection();
      }
    } catch (error) {
      logger.error('Manual collection failed:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const demandScheduler = new DemandScheduler();

module.exports = demandScheduler; 