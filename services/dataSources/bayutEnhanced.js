const playwright = require('playwright');
const axios = require('axios');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('BAYUT_ENHANCED');

class BayutRealTimeClient {
  constructor() {
    this.baseUrl = 'https://www.bayut.com';
    this.apiEndpoints = {
      search: '/api/properties/search',
      details: '/api/properties/details',
      transactions: '/api/transactions'
    };
    this.browser = null;
    this.requestDelay = 2000; // 2 seconds between requests
    this.maxRetries = 3;
  }

  /**
   * Initialize browser for web scraping
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await playwright.chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
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
   * Scrape real-time property listings with enhanced accuracy
   */
  async scrapeRealTimeListings(criteria) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set realistic user agent and headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      });

      // Build search URL based on criteria
      const searchUrl = this.buildSearchUrl(criteria);
      logger.info(`Scraping Bayut listings from: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for listings to load
      await page.waitForSelector('[data-testid="property-card"], .property-card, .listing-card', { 
        timeout: 15000 
      });
      
      // Extract enhanced property data
      const properties = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="property-card"], .property-card, .listing-card');
        const results = [];
        
        cards.forEach((card, index) => {
          try {
            // Enhanced data extraction
            const titleElement = card.querySelector('h2, .property-title, [data-testid="property-title"]');
            const priceElement = card.querySelector('[data-testid="property-price"], .price, .property-price');
            const detailsElement = card.querySelector('[data-testid="property-details"], .property-details, .details');
            const locationElement = card.querySelector('[data-testid="property-location"], .location, .property-location');
            const imageElement = card.querySelector('img');
            const linkElement = card.querySelector('a');
            const agentElement = card.querySelector('.agent-name, [data-testid="agent-name"]');
            const developerElement = card.querySelector('.developer-name, [data-testid="developer-name"]');
            
            if (titleElement && priceElement) {
              const title = titleElement.textContent.trim();
              const priceText = priceElement.textContent.trim();
              const details = detailsElement ? detailsElement.textContent.trim() : '';
              const location = locationElement ? locationElement.textContent.trim() : '';
              const imageUrl = imageElement ? imageElement.src : '';
              const propertyUrl = linkElement ? linkElement.href : '';
              const agentName = agentElement ? agentElement.textContent.trim() : '';
              const developerName = developerElement ? developerElement.textContent.trim() : '';
              
              // Enhanced price extraction
              const priceMatch = priceText.match(/AED\s*([\d,]+)/);
              const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
              
              // Enhanced details extraction
              const bedroomMatch = details.match(/(\d+)\s*bed/i);
              const bathroomMatch = details.match(/(\d+)\s*bath/i);
              const sizeMatch = details.match(/(\d+(?:,\d+)?)\s*sq\.?\s*ft/i);
              
              // Extract additional metadata
              const furnishedMatch = details.match(/(furnished|unfurnished)/i);
              const parkingMatch = details.match(/(\d+)\s*parking/i);
              
              results.push({
                id: `bayut_${index}_${Date.now()}`,
                title,
                price,
                priceText,
                bedrooms: bedroomMatch ? parseInt(bedroomMatch[1]) : 0,
                bathrooms: bathroomMatch ? parseInt(bathroomMatch[1]) : 0,
                size: sizeMatch ? parseInt(sizeMatch[1].replace(/,/g, '')) : 0,
                location,
                details,
                imageUrl,
                propertyUrl,
                agentName,
                developerName,
                furnished: furnishedMatch ? furnishedMatch[1].toLowerCase() : 'unknown',
                parking: parkingMatch ? parseInt(parkingMatch[1]) : 0,
                source: 'Bayut',
                scrapedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Error extracting property card data:', error);
          }
        });
        
        return results;
      });
      
      await page.close();
      
      logger.info(`Successfully scraped ${properties.length} properties from Bayut`);
      
      // Enhance properties with additional data
      const enhancedProperties = await this.enhancePropertiesData(properties);
      
      return enhancedProperties;

    } catch (error) {
      logger.error('Error scraping Bayut listings:', error);
      throw error;
    }
  }

  /**
   * Get detailed property information
   */
  async getPropertyDetails(propertyUrl) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      logger.info(`Fetching property details from: ${propertyUrl}`);
      
      await page.goto(propertyUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Extract detailed property information
      const propertyDetails = await page.evaluate(() => {
        const extractText = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : null;
        };
        
        const extractNumber = (text) => {
          if (!text) return 0;
          const match = text.match(/[\d,]+/);
          return match ? parseInt(match[0].replace(/,/g, '')) : 0;
        };
        
        return {
          title: extractText('h1, .property-title'),
          price: extractText('.price, .property-price'),
          developer: extractText('.developer-name, .developer'),
          location: extractText('.location, .property-location'),
          bedrooms: extractNumber(extractText('.bedrooms, .beds')),
          bathrooms: extractNumber(extractText('.bathrooms, .baths')),
          size: extractNumber(extractText('.size, .area')),
          propertyType: extractText('.property-type, .type'),
          completionDate: extractText('.completion-date, .handover'),
          launchDate: extractText('.launch-date, .announced'),
          amenities: Array.from(document.querySelectorAll('.amenity, .feature')).map(el => el.textContent.trim()),
          description: extractText('.description, .property-description'),
          agentName: extractText('.agent-name'),
          agentPhone: extractText('.agent-phone'),
          coordinates: {
            lat: window.propertyData?.latitude || null,
            lng: window.propertyData?.longitude || null
          }
        };
      });
      
      await page.close();
      
      return propertyDetails;

    } catch (error) {
      logger.error('Error fetching property details:', error);
      return null;
    }
  }

  /**
   * Validate property data against multiple sources
   */
  async validatePropertyData(propertyData) {
    try {
      const validationResults = {
        priceAccuracy: await this.validatePricing(propertyData),
        developerVerification: await this.verifyDeveloper(propertyData.developerName),
        locationAccuracy: await this.validateLocation(propertyData.location),
        dateAccuracy: await this.validateDates(propertyData),
        overallScore: 0
      };
      
      // Calculate overall accuracy score
      const scores = Object.values(validationResults).filter(score => typeof score === 'number');
      validationResults.overallScore = scores.length > 0 ? 
        Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
      
      return validationResults;

    } catch (error) {
      logger.error('Error validating property data:', error);
      return {
        priceAccuracy: 0,
        developerVerification: 0,
        locationAccuracy: 0,
        dateAccuracy: 0,
        overallScore: 0
      };
    }
  }

  /**
   * Build search URL based on criteria
   */
  buildSearchUrl(criteria) {
    let url = `${this.baseUrl}/to-rent/property/dubai/`;
    
    if (criteria.location) {
      const locationSlug = criteria.location.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      url += `${locationSlug}/`;
    }
    
    const params = new URLSearchParams();
    
    if (criteria.propertyType) {
      params.append('property_type', criteria.propertyType);
    }
    
    if (criteria.bedrooms) {
      params.append('bedrooms', criteria.bedrooms.toString());
    }
    
    if (criteria.priceRange) {
      if (criteria.priceRange.min) params.append('price_min', criteria.priceRange.min.toString());
      if (criteria.priceRange.max) params.append('price_max', criteria.priceRange.max.toString());
    }
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Enhance properties with additional data
   */
  async enhancePropertiesData(properties) {
    const enhanced = [];
    
    for (const property of properties) {
      try {
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
        
        let enhancedProperty = { ...property };
        
        // Get detailed information if property URL is available
        if (property.propertyUrl) {
          const details = await this.getPropertyDetails(property.propertyUrl);
          if (details) {
            enhancedProperty = { ...enhancedProperty, ...details };
          }
        }
        
        // Validate the property data
        const validation = await this.validatePropertyData(enhancedProperty);
        enhancedProperty.validation = validation;
        
        enhanced.push(enhancedProperty);
        
      } catch (error) {
        logger.error('Error enhancing property data:', error);
        enhanced.push(property); // Add original property if enhancement fails
      }
    }
    
    return enhanced;
  }

  /**
   * Validate pricing against market data
   */
  async validatePricing(propertyData) {
    try {
      // This would integrate with market data APIs
      // For now, return a basic validation score
      if (propertyData.price && propertyData.price > 0) {
        return 85; // 85% confidence in pricing
      }
      return 0;
    } catch (error) {
      logger.error('Error validating pricing:', error);
      return 0;
    }
  }

  /**
   * Verify developer information
   */
  async verifyDeveloper(developerName) {
    try {
      if (!developerName) return 0;
      
      // This would check against DLD developer registry
      // For now, return basic verification
      const knownDevelopers = [
        'Emaar Properties', 'DAMAC Properties', 'Nakheel', 'Dubai Properties',
        'Aldar Properties', 'Sobha Realty', 'Azizi Developments', 'Danube Properties'
      ];
      
      const isKnown = knownDevelopers.some(dev => 
        developerName.toLowerCase().includes(dev.toLowerCase()) ||
        dev.toLowerCase().includes(developerName.toLowerCase())
      );
      
      return isKnown ? 90 : 60;
    } catch (error) {
      logger.error('Error verifying developer:', error);
      return 0;
    }
  }

  /**
   * Validate location accuracy
   */
  async validateLocation(location) {
    try {
      if (!location) return 0;
      
      // This would integrate with Google Maps API
      // For now, return basic validation
      const dubaiAreas = [
        'Downtown Dubai', 'Dubai Marina', 'Business Bay', 'JBR', 'DIFC',
        'Dubai Hills', 'Arabian Ranches', 'Jumeirah', 'Bur Dubai', 'Deira'
      ];
      
      const isValidArea = dubaiAreas.some(area => 
        location.toLowerCase().includes(area.toLowerCase())
      );
      
      return isValidArea ? 80 : 50;
    } catch (error) {
      logger.error('Error validating location:', error);
      return 0;
    }
  }

  /**
   * Validate property dates
   */
  async validateDates(propertyData) {
    try {
      // This would cross-check with DLD records
      // For now, return basic validation
      if (propertyData.completionDate || propertyData.launchDate) {
        return 70;
      }
      return 30;
    } catch (error) {
      logger.error('Error validating dates:', error);
      return 0;
    }
  }

  /**
   * Get market statistics from Bayut
   */
  async getMarketStatistics(area = null) {
    try {
      const criteria = area ? { location: area } : {};
      const properties = await this.scrapeRealTimeListings(criteria);
      
      if (properties.length === 0) {
        return {
          totalListings: 0,
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          averagePricePerSqft: 0,
          propertyTypes: {},
          lastUpdated: new Date().toISOString()
        };
      }
      
      const prices = properties.map(p => p.price).filter(p => p > 0);
      const sizes = properties.map(p => p.size).filter(s => s > 0);
      
      // Calculate statistics
      const stats = {
        totalListings: properties.length,
        averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0
        },
        averagePricePerSqft: this.calculateAveragePricePerSqft(properties),
        propertyTypes: this.getPropertyTypeDistribution(properties),
        topDevelopers: this.getTopDevelopers(properties),
        lastUpdated: new Date().toISOString()
      };
      
      return stats;

    } catch (error) {
      logger.error('Error getting market statistics:', error);
      throw error;
    }
  }

  /**
   * Calculate average price per square foot
   */
  calculateAveragePricePerSqft(properties) {
    const validProperties = properties.filter(p => p.price > 0 && p.size > 0);
    if (validProperties.length === 0) return 0;
    
    const pricePerSqftValues = validProperties.map(p => p.price / p.size);
    return Math.round(pricePerSqftValues.reduce((a, b) => a + b, 0) / pricePerSqftValues.length);
  }

  /**
   * Get property type distribution
   */
  getPropertyTypeDistribution(properties) {
    const distribution = {};
    
    properties.forEach(property => {
      const type = this.categorizePropertyType(property);
      distribution[type] = (distribution[type] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * Categorize property type
   */
  categorizePropertyType(property) {
    const title = property.title.toLowerCase();
    const details = property.details.toLowerCase();
    
    if (title.includes('villa') || details.includes('villa')) return 'villa';
    if (title.includes('townhouse') || details.includes('townhouse')) return 'townhouse';
    if (title.includes('penthouse') || details.includes('penthouse')) return 'penthouse';
    if (title.includes('studio') || details.includes('studio') || property.bedrooms === 0) return 'studio';
    
    return 'apartment';
  }

  /**
   * Get top developers from listings
   */
  getTopDevelopers(properties) {
    const developers = {};
    
    properties.forEach(property => {
      if (property.developerName) {
        developers[property.developerName] = (developers[property.developerName] || 0) + 1;
      }
    });
    
    return Object.entries(developers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }
}

module.exports = BayutRealTimeClient; 