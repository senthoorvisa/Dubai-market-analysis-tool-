const playwright = require('playwright');
const axios = require('axios');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('RENTAL_SCRAPER');

class RentalDataScraper {
  constructor() {
    this.browser = null;
    this.dldApiKey = process.env.DLD_API_KEY;
    this.dldApiSecret = process.env.DLD_API_SECRET;
    this.dldBaseUrl = process.env.DLD_BASE_URL || 'https://api.dld.gov.ae';
    this.bayutBaseUrl = 'https://www.bayut.com';
    this.requestDelay = 2000; // 2 seconds between requests
  }

  /**
   * Initialize browser for web scraping
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await playwright.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Get DLD authentication token
   */
  async getDLDAuthToken() {
    try {
      if (!this.dldApiKey || !this.dldApiSecret) {
        throw new Error('DLD API credentials not configured');
      }

      const response = await axios.post(`${this.dldBaseUrl}/auth/token`, {
        api_key: this.dldApiKey,
        api_secret: this.dldApiSecret
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('Failed to get DLD auth token:', error);
      throw error;
    }
  }

  /**
   * Scrape rental data from DLD API
   */
  async scrapeDLDRentals(area = null, limit = 100) {
    try {
      const token = await this.getDLDAuthToken();
      
      const params = {
        limit,
        offset: 0,
        property_type: 'residential',
        transaction_type: 'rental'
      };

      if (area) {
        params.area = area;
      }

      const response = await axios.get(`${this.dldBaseUrl}/v1/transactions/rental`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params
      });

      const rentals = response.data.data || [];
      
      logger.info(`Scraped ${rentals.length} rental records from DLD API`);
      
      return rentals.map(rental => ({
        source: 'DLD',
        propertyId: rental.property_id,
        area: rental.area,
        subArea: rental.sub_area,
        propertyType: rental.property_type,
        bedrooms: rental.bedrooms,
        bathrooms: rental.bathrooms,
        size: rental.property_size,
        monthlyRent: rental.annual_amount / 12,
        annualRent: rental.annual_amount,
        contractDate: rental.registration_date,
        startDate: rental.start_date,
        endDate: rental.end_date,
        developer: rental.developer,
        project: rental.project_name,
        furnishing: rental.furnishing_status,
        parking: rental.parking_spaces,
        coordinates: {
          lat: rental.latitude,
          lng: rental.longitude
        },
        scrapedAt: new Date().toISOString()
      }));

    } catch (error) {
      logger.error('Error scraping DLD rentals:', error);
      throw error;
    }
  }

  /**
   * Scrape rental listings from Bayut
   */
  async scrapeBayutRentals(area = null, limit = 50) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      let searchUrl = `${this.bayutBaseUrl}/to-rent/property/dubai/`;
      if (area) {
        const areaSlug = area.toLowerCase().replace(/\s+/g, '-');
        searchUrl = `${this.bayutBaseUrl}/to-rent/property/dubai/${areaSlug}/`;
      }

      logger.info(`Scraping Bayut rentals from: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      // Wait for listings to load
      await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 });
      
      // Extract rental data
      const rentals = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="property-card"]');
        const results = [];
        
        cards.forEach((card, index) => {
          try {
            const titleElement = card.querySelector('h2');
            const priceElement = card.querySelector('[data-testid="property-price"]');
            const detailsElement = card.querySelector('[data-testid="property-details"]');
            const locationElement = card.querySelector('[data-testid="property-location"]');
            const imageElement = card.querySelector('img');
            
            if (titleElement && priceElement) {
              const title = titleElement.textContent.trim();
              const priceText = priceElement.textContent.trim();
              const details = detailsElement ? detailsElement.textContent.trim() : '';
              const location = locationElement ? locationElement.textContent.trim() : '';
              const imageUrl = imageElement ? imageElement.src : '';
              
              // Extract price (remove AED and commas)
              const priceMatch = priceText.match(/AED\s*([\d,]+)/);
              const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
              
              // Extract bedrooms and bathrooms
              const bedroomMatch = details.match(/(\d+)\s*bed/i);
              const bathroomMatch = details.match(/(\d+)\s*bath/i);
              const sizeMatch = details.match(/(\d+)\s*sq\.?\s*ft/i);
              
              results.push({
                title,
                price,
                bedrooms: bedroomMatch ? parseInt(bedroomMatch[1]) : 0,
                bathrooms: bathroomMatch ? parseInt(bathroomMatch[1]) : 0,
                size: sizeMatch ? parseInt(sizeMatch[1]) : 0,
                location,
                details,
                imageUrl,
                url: card.querySelector('a') ? card.querySelector('a').href : ''
              });
            }
          } catch (error) {
            console.error('Error extracting card data:', error);
          }
        });
        
        return results;
      });
      
      await page.close();
      
      logger.info(`Scraped ${rentals.length} rental listings from Bayut`);
      
      return rentals.map(rental => ({
        source: 'Bayut',
        propertyId: `bayut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: rental.title,
        area: area || this.extractAreaFromLocation(rental.location),
        propertyType: this.extractPropertyType(rental.title),
        bedrooms: rental.bedrooms,
        bathrooms: rental.bathrooms,
        size: rental.size,
        monthlyRent: rental.price,
        annualRent: rental.price * 12,
        location: rental.location,
        imageUrl: rental.imageUrl,
        listingUrl: rental.url,
        scrapedAt: new Date().toISOString()
      }));

    } catch (error) {
      logger.error('Error scraping Bayut rentals:', error);
      throw error;
    }
  }

  /**
   * Scrape GitHub repositories for real estate data sources
   */
  async scrapeGitHubDataSources() {
    try {
      const searchQueries = [
        'dubai real estate data',
        'dubai property prices',
        'uae rental data',
        'dubai land department api',
        'bayut scraper'
      ];

      const repositories = [];

      for (const query of searchQueries) {
        try {
          const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
              q: query,
              sort: 'stars',
              order: 'desc',
              per_page: 10
            },
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Dubai-Market-Analysis-Tool'
            }
          });

          const repos = response.data.items || [];
          repositories.push(...repos.map(repo => ({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            updatedAt: repo.updated_at,
            topics: repo.topics || [],
            query: query
          })));

          // Rate limiting for GitHub API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          logger.error(`Error searching GitHub for "${query}":`, error);
        }
      }

      logger.info(`Found ${repositories.length} relevant GitHub repositories`);
      return repositories;

    } catch (error) {
      logger.error('Error scraping GitHub data sources:', error);
      throw error;
    }
  }

  /**
   * Extract area from location string
   */
  extractAreaFromLocation(location) {
    const dubaiAreas = [
      'Downtown Dubai', 'Dubai Marina', 'Business Bay', 'JBR', 'DIFC',
      'Dubai Hills Estate', 'Arabian Ranches', 'Jumeirah', 'Palm Jumeirah',
      'Dubai South', 'Al Barsha', 'Jumeirah Village Circle', 'City Walk'
    ];

    for (const area of dubaiAreas) {
      if (location.toLowerCase().includes(area.toLowerCase())) {
        return area;
      }
    }

    return location.split(',')[0].trim();
  }

  /**
   * Extract property type from title
   */
  extractPropertyType(title) {
    const types = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio'];
    
    for (const type of types) {
      if (title.toLowerCase().includes(type)) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }

    return 'Apartment'; // Default
  }

  /**
   * Comprehensive rental data collection
   */
  async scrapeAllRentalData(area = null) {
    try {
      logger.info(`Starting comprehensive rental data scraping${area ? ` for ${area}` : ''}`);
      
      const results = {
        dldData: [],
        bayutData: [],
        githubSources: [],
        totalRecords: 0,
        scrapedAt: new Date().toISOString()
      };

      // Scrape DLD data
      try {
        results.dldData = await this.scrapeDLDRentals(area);
      } catch (error) {
        logger.error('DLD scraping failed:', error);
      }

      // Scrape Bayut data
      try {
        results.bayutData = await this.scrapeBayutRentals(area);
      } catch (error) {
        logger.error('Bayut scraping failed:', error);
      }

      // Scrape GitHub sources (once per session)
      if (!area) {
        try {
          results.githubSources = await this.scrapeGitHubDataSources();
        } catch (error) {
          logger.error('GitHub scraping failed:', error);
        }
      }

      results.totalRecords = results.dldData.length + results.bayutData.length;
      
      logger.info(`Scraping completed: ${results.totalRecords} total records`);
      logger.info(`- DLD: ${results.dldData.length} records`);
      logger.info(`- Bayut: ${results.bayutData.length} records`);
      logger.info(`- GitHub sources: ${results.githubSources.length} repositories`);

      return results;

    } catch (error) {
      logger.error('Error in comprehensive rental data scraping:', error);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }
}

module.exports = RentalDataScraper; 