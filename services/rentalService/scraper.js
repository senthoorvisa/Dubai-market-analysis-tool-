const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('RENTAL_SCRAPER');

class BayutScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://www.bayut.com';
  }

  async init() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      
      // Set user agent to avoid blocking
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      logger.info('Bayut scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scraper', { error: error.message });
      throw error;
    }
  }

  async scrapeRentals(filters = {}) {
    const {
      area = '',
      bedrooms = '',
      minPrice = '',
      maxPrice = '',
      maxPages = 5
    } = filters;

    try {
      // Build search URL
      let searchUrl = `${this.baseUrl}/to-rent/property/dubai/`;
      const params = new URLSearchParams();
      
      if (area) params.append('area', area);
      if (bedrooms) params.append('bedrooms', bedrooms);
      if (minPrice) params.append('price_min', minPrice);
      if (maxPrice) params.append('price_max', maxPrice);
      
      if (params.toString()) {
        searchUrl += '?' + params.toString();
      }

      logger.info('Starting rental scraping', { url: searchUrl, filters });

      await this.page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      const listings = [];
      let currentPage = 1;

      while (currentPage <= maxPages) {
        logger.info(`Scraping page ${currentPage}`);
        
        // Wait for listings to load
        await this.page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 });
        
        // Extract listings from current page
        const pageListings = await this.page.evaluate(() => {
          const cards = document.querySelectorAll('[data-testid="property-card"]');
          const listings = [];
          
          cards.forEach((card, index) => {
            try {
              const listingId = card.getAttribute('data-property-id') || `bayut_${Date.now()}_${index}`;
              
              // Property name
              const nameElement = card.querySelector('h2, .title, [data-testid="property-title"]');
              const propertyName = nameElement ? nameElement.textContent.trim() : 'N/A';
              
              // Area/Location
              const locationElement = card.querySelector('[data-testid="property-location"], .location, .area');
              const area = locationElement ? locationElement.textContent.trim() : 'N/A';
              
              // Bedrooms
              const bedroomsElement = card.querySelector('[data-testid="property-bedrooms"], .bedrooms');
              let bedrooms = 'N/A';
              if (bedroomsElement) {
                const bedroomText = bedroomsElement.textContent;
                const match = bedroomText.match(/(\d+)/);
                bedrooms = match ? parseInt(match[1]) : 'Studio';
              }
              
              // Rent amount
              const priceElement = card.querySelector('[data-testid="property-price"], .price');
              let rentAmount = 'N/A';
              if (priceElement) {
                const priceText = priceElement.textContent.replace(/[^0-9]/g, '');
                rentAmount = priceText ? parseInt(priceText) : 'N/A';
              }
              
              // Size
              const sizeElement = card.querySelector('[data-testid="property-size"], .size, .area-size');
              let sizeSqFt = 'N/A';
              if (sizeElement) {
                const sizeText = sizeElement.textContent.replace(/[^0-9]/g, '');
                sizeSqFt = sizeText ? parseInt(sizeText) : 'N/A';
              }
              
              listings.push({
                listingId,
                propertyName,
                area,
                bedrooms,
                rentAmount,
                sizeSqFt,
                transactionDate: new Date().toISOString(),
                source: 'bayut',
                url: window.location.href
              });
            } catch (error) {
              console.error('Error extracting listing:', error);
            }
          });
          
          return listings;
        });

        listings.push(...pageListings);
        logger.info(`Extracted ${pageListings.length} listings from page ${currentPage}`);

        // Try to go to next page
        const nextButton = await this.page.$('[data-testid="pagination-next"], .next-page, .pagination-next');
        if (nextButton && currentPage < maxPages) {
          try {
            await nextButton.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000); // Wait a bit for content to load
            currentPage++;
          } catch (error) {
            logger.warn('Could not navigate to next page', { page: currentPage, error: error.message });
            break;
          }
        } else {
          break;
        }
      }

      logger.info(`Scraping completed. Total listings: ${listings.length}`);
      return listings;

    } catch (error) {
      logger.error('Error during scraping', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('Scraper browser closed');
    }
  }
}

// DLD API integration (mock implementation - replace with actual API when available)
class DLDAPIClient {
  constructor() {
    this.apiKey = process.env.DLD_API_KEY;
    this.baseUrl = process.env.DLD_API_BASE_URL || 'https://api.dubailand.gov.ae';
  }

  async fetchRentalTransactions(filters = {}) {
    try {
      logger.info('Fetching DLD rental transactions', { filters });
      
      // Mock implementation - replace with actual API call
      const mockData = [
        {
          listingId: `dld_${Date.now()}_1`,
          propertyName: 'Sample DLD Property 1',
          area: 'Downtown Dubai',
          bedrooms: 2,
          rentAmount: 85000,
          sizeSqFt: 1200,
          transactionDate: new Date().toISOString(),
          source: 'dld'
        },
        {
          listingId: `dld_${Date.now()}_2`,
          propertyName: 'Sample DLD Property 2',
          area: 'Dubai Marina',
          bedrooms: 1,
          rentAmount: 65000,
          sizeSqFt: 800,
          transactionDate: new Date().toISOString(),
          source: 'dld'
        }
      ];

      logger.info(`Fetched ${mockData.length} DLD transactions`);
      return mockData;

    } catch (error) {
      logger.error('Error fetching DLD data', { error: error.message });
      return [];
    }
  }
}

module.exports = {
  BayutScraper,
  DLDAPIClient
}; 