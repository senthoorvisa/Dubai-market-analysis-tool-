const cron = require('node-cron');
const RentalDataScraper = require('./scraper');
const RentalDataProcessor = require('./dataProcessor');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('RENTAL_SCHEDULER');

class RentalScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.task = null;
    
    // Initialize services
    this.rentalScraper = new RentalDataScraper();
    this.dataProcessor = new RentalDataProcessor();
  }

  async executeDataRefresh() {
    if (this.isRunning) {
      logger.warn('Data refresh already in progress, skipping scheduled run');
      return;
    }

    try {
      this.isRunning = true;
      this.lastRun = new Date();
      
      logger.info('Starting scheduled rental data refresh');

      // Initialize scraper
      await this.rentalScraper.initBrowser();

      try {
        // Default filters for daily scraping
        const defaultFilters = {
          maxPages: 10 // Limit pages for daily refresh
        };

        // Fetch data from scraper (includes both Bayut and DLD)
        const scraperData = await this.rentalScraper.scrapeAllRentalData();

        if (scraperData.totalRecords === 0) {
          logger.warn('No new rental data found during scheduled refresh');
          return;
        }

        // Combine all data
        const allData = [...scraperData.dldData, ...scraperData.bayutData];

        // Process and save data
        const result = await this.dataProcessor.processAndSave(allData);

        logger.info('Scheduled rental data refresh completed successfully', {
          sources: {
            dld: scraperData.dldData.length,
            bayut: scraperData.bayutData.length,
            total: scraperData.totalRecords
          },
          processed: result.processedCount || allData.length,
          savedPaths: result.savedPaths
        });

        // Send success notification (if monitoring service is configured)
        this.sendNotification('success', {
          message: 'Rental data refresh completed successfully',
          totalRecords: scraperData.totalRecords,
          sources: { 
            dld: scraperData.dldData.length, 
            bayut: scraperData.bayutData.length 
          }
        });

      } finally {
        await this.rentalScraper.closeBrowser();
      }

    } catch (error) {
      logger.error('Error during scheduled rental data refresh', { 
        error: error.message,
        stack: error.stack 
      });

      // Send error notification
      this.sendNotification('error', {
        message: 'Rental data refresh failed',
        error: error.message
      });

    } finally {
      this.isRunning = false;
    }
  }

  start() {
    try {
      // Schedule daily at 2 AM
      this.task = cron.schedule('0 2 * * *', async () => {
        await this.executeDataRefresh();
      }, {
        scheduled: false,
        timezone: 'Asia/Dubai'
      });

      this.task.start();
      
      // Calculate next run time
      this.calculateNextRun();
      
      logger.info('Rental data scheduler started', {
        schedule: 'Daily at 2:00 AM (Dubai Time)',
        nextRun: this.nextRun
      });

      return true;
    } catch (error) {
      logger.error('Failed to start rental scheduler', { error: error.message });
      return false;
    }
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('Rental data scheduler stopped');
      return true;
    }
    return false;
  }

  calculateNextRun() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 2 AM
    
    // If it's already past 2 AM today, next run is tomorrow at 2 AM
    if (now.getHours() >= 2) {
      this.nextRun = tomorrow;
    } else {
      // Next run is today at 2 AM
      const today = new Date(now);
      today.setHours(2, 0, 0, 0);
      this.nextRun = today;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.task !== null,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      schedule: 'Daily at 2:00 AM (Dubai Time)'
    };
  }

  sendNotification(type, data) {
    try {
      // This could be extended to send notifications via email, Slack, etc.
      const notification = {
        type,
        service: 'rental-analysis',
        timestamp: new Date().toISOString(),
        ...data
      };

      // Log the notification
      if (type === 'success') {
        logger.info('Rental refresh notification', notification);
      } else {
        logger.error('Rental refresh error notification', notification);
      }

      // TODO: Implement actual notification sending (email, Slack, webhook, etc.)
      // Example:
      // await sendSlackNotification(notification);
      // await sendEmailNotification(notification);

    } catch (error) {
      logger.error('Error sending notification', { error: error.message });
    }
  }

  // Manual trigger for testing
  async triggerManualRefresh() {
    logger.info('Manual rental data refresh triggered');
    await this.executeDataRefresh();
  }
}

// Create singleton instance
const rentalScheduler = new RentalScheduler();

module.exports = rentalScheduler; 