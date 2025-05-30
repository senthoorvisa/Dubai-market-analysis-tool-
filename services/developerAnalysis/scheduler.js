const cron = require('node-cron');
const DeveloperDataCollector = require('./dataCollector');
const DeveloperAnalyzer = require('./analyzer');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('DEVELOPER_SCHEDULER');

class DeveloperScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.task = null;
    this.previousAnalyses = new Map(); // Store previous analyses for change detection
    
    // Initialize services
    this.dataCollector = new DeveloperDataCollector();
    this.analyzer = new DeveloperAnalyzer();
  }

  async executeWeeklyAnalysis() {
    if (this.isRunning) {
      logger.warn('Developer analysis already in progress, skipping scheduled run');
      return;
    }

    try {
      this.isRunning = true;
      this.lastRun = new Date();
      
      logger.info('Starting scheduled developer analysis');

      // Collect fresh data
      const rawData = await this.dataCollector.collectAllData();
      
      if (rawData.length === 0) {
        logger.warn('No developer data collected during scheduled analysis');
        return;
      }

      // Save raw data
      const savedPath = await this.dataCollector.saveData(rawData);
      
      // Analyze all developers
      const currentAnalyses = await this.analyzer.analyzeAllDevelopers(rawData);
      
      // Detect significant changes
      const changes = this.detectSignificantChanges(currentAnalyses);
      
      // Generate market insights
      const insights = this.analyzer.generateMarketInsights(currentAnalyses);

      logger.info('Scheduled developer analysis completed successfully', {
        developersAnalyzed: currentAnalyses.length,
        totalProjects: rawData.reduce((sum, dev) => sum + dev.projects.length, 0),
        significantChanges: changes.length,
        savedPath
      });

      // Send notifications for significant changes
      if (changes.length > 0) {
        this.sendChangeNotifications(changes);
      }

      // Update stored analyses for next comparison
      this.updateStoredAnalyses(currentAnalyses);

      // Send success notification
      this.sendNotification('success', {
        message: 'Developer analysis completed successfully',
        developersAnalyzed: currentAnalyses.length,
        significantChanges: changes.length,
        topDevelopers: insights.marketLeaders.slice(0, 3)
      });

    } catch (error) {
      logger.error('Error during scheduled developer analysis', { 
        error: error.message,
        stack: error.stack 
      });

      // Send error notification
      this.sendNotification('error', {
        message: 'Developer analysis failed',
        error: error.message
      });

    } finally {
      this.isRunning = false;
    }
  }

  detectSignificantChanges(currentAnalyses) {
    const changes = [];
    const changeThreshold = 20; // 20% change threshold

    currentAnalyses.forEach(current => {
      const previous = this.previousAnalyses.get(current.developerName);
      
      if (!previous) {
        // New developer
        changes.push({
          type: 'new_developer',
          developerName: current.developerName,
          reputationScore: current.reputationScore,
          message: `New developer added: ${current.developerName}`
        });
        return;
      }

      // Check reputation score change
      const reputationChange = Math.abs(current.reputationScore - previous.reputationScore);
      const reputationChangePercent = (reputationChange / previous.reputationScore) * 100;
      
      if (reputationChangePercent >= changeThreshold) {
        changes.push({
          type: 'reputation_change',
          developerName: current.developerName,
          previousScore: previous.reputationScore,
          currentScore: current.reputationScore,
          changePercent: Math.round(reputationChangePercent * 100) / 100,
          direction: current.reputationScore > previous.reputationScore ? 'increase' : 'decrease',
          message: `${current.developerName} reputation score ${current.reputationScore > previous.reputationScore ? 'increased' : 'decreased'} by ${Math.round(reputationChangePercent * 100) / 100}%`
        });
      }

      // Check completion rate change
      const completionChange = Math.abs(current.completionRate - previous.completionRate);
      if (completionChange >= changeThreshold) {
        changes.push({
          type: 'completion_rate_change',
          developerName: current.developerName,
          previousRate: previous.completionRate,
          currentRate: current.completionRate,
          changePercent: Math.round(completionChange * 100) / 100,
          direction: current.completionRate > previous.completionRate ? 'increase' : 'decrease',
          message: `${current.developerName} completion rate ${current.completionRate > previous.completionRate ? 'improved' : 'declined'} by ${Math.round(completionChange * 100) / 100}%`
        });
      }

      // Check for new projects (significant increase)
      const projectIncrease = current.totalProjects - previous.totalProjects;
      if (projectIncrease >= 5) { // 5 or more new projects
        changes.push({
          type: 'project_increase',
          developerName: current.developerName,
          newProjects: projectIncrease,
          totalProjects: current.totalProjects,
          message: `${current.developerName} added ${projectIncrease} new projects (total: ${current.totalProjects})`
        });
      }
    });

    return changes;
  }

  updateStoredAnalyses(currentAnalyses) {
    this.previousAnalyses.clear();
    currentAnalyses.forEach(analysis => {
      this.previousAnalyses.set(analysis.developerName, {
        reputationScore: analysis.reputationScore,
        completionRate: analysis.completionRate,
        totalProjects: analysis.totalProjects,
        avgSalesPrice: analysis.avgSalesPrice
      });
    });
  }

  sendChangeNotifications(changes) {
    try {
      logger.info('Sending change notifications', { changeCount: changes.length });
      
      changes.forEach(change => {
        logger.info('Developer metric change detected', change);
        
        // TODO: Implement actual notification sending
        // Examples:
        // - Send email alerts for significant changes
        // - Post to Slack channel
        // - Send webhook notifications
        // - Update dashboard alerts
      });

    } catch (error) {
      logger.error('Error sending change notifications', { error: error.message });
    }
  }

  start() {
    try {
      // Schedule weekly on Sundays at 3 AM
      this.task = cron.schedule('0 3 * * 0', async () => {
        await this.executeWeeklyAnalysis();
      }, {
        scheduled: false,
        timezone: 'Asia/Dubai'
      });

      this.task.start();
      
      // Calculate next run time
      this.calculateNextRun();
      
      logger.info('Developer analysis scheduler started', {
        schedule: 'Weekly on Sundays at 3:00 AM (Dubai Time)',
        nextRun: this.nextRun
      });

      return true;
    } catch (error) {
      logger.error('Failed to start developer scheduler', { error: error.message });
      return false;
    }
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('Developer analysis scheduler stopped');
      return true;
    }
    return false;
  }

  calculateNextRun() {
    const now = new Date();
    const nextSunday = new Date(now);
    
    // Calculate days until next Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7;
    if (daysUntilSunday === 0 && now.getHours() >= 3) {
      // If it's Sunday and past 3 AM, schedule for next Sunday
      nextSunday.setDate(now.getDate() + 7);
    } else {
      nextSunday.setDate(now.getDate() + daysUntilSunday);
    }
    
    nextSunday.setHours(3, 0, 0, 0); // 3 AM
    this.nextRun = nextSunday;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.task !== null,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      schedule: 'Weekly on Sundays at 3:00 AM (Dubai Time)',
      storedAnalyses: this.previousAnalyses.size
    };
  }

  sendNotification(type, data) {
    try {
      const notification = {
        type,
        service: 'developer-analysis',
        timestamp: new Date().toISOString(),
        ...data
      };

      // Log the notification
      if (type === 'success') {
        logger.info('Developer analysis notification', notification);
      } else {
        logger.error('Developer analysis error notification', notification);
      }

      // TODO: Implement actual notification sending
      // Examples:
      // await sendSlackNotification(notification);
      // await sendEmailNotification(notification);
      // await sendWebhookNotification(notification);

    } catch (error) {
      logger.error('Error sending notification', { error: error.message });
    }
  }

  // Manual trigger for testing
  async triggerManualAnalysis() {
    logger.info('Manual developer analysis triggered');
    await this.executeWeeklyAnalysis();
  }
}

// Create singleton instance
const developerScheduler = new DeveloperScheduler();

module.exports = developerScheduler; 