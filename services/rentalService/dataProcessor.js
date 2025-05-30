const fs = require('fs').promises;
const path = require('path');
const csvWriter = require('csv-writer');
const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('RENTAL_PROCESSOR');

class RentalDataProcessor {
  constructor() {
    this.rawDataPath = path.join(process.cwd(), 'data', 'rentals', 'raw');
    this.processedDataPath = path.join(process.cwd(), 'data', 'rentals', 'processed');
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.rawDataPath, { recursive: true });
      await fs.mkdir(this.processedDataPath, { recursive: true });
      logger.info('Data directories ensured');
    } catch (error) {
      logger.error('Error creating directories', { error: error.message });
      throw error;
    }
  }

  normalizeRecord(record) {
    try {
      return {
        listingId: record.listingId || `unknown_${Date.now()}`,
        propertyName: this.cleanString(record.propertyName || 'N/A'),
        area: this.cleanString(record.area || 'N/A'),
        bedrooms: this.normalizeBedrooms(record.bedrooms),
        rentAmount: this.normalizePrice(record.rentAmount),
        sizeSqFt: this.normalizeSize(record.sizeSqFt),
        transactionDate: this.normalizeDate(record.transactionDate),
        source: record.source || 'unknown',
        url: record.url || '',
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error normalizing record', { record, error: error.message });
      return null;
    }
  }

  cleanString(str) {
    if (typeof str !== 'string') return String(str);
    return str.trim().replace(/\s+/g, ' ').replace(/[^\w\s\-\.]/g, '');
  }

  normalizeBedrooms(bedrooms) {
    if (typeof bedrooms === 'number') return bedrooms;
    if (typeof bedrooms === 'string') {
      if (bedrooms.toLowerCase().includes('studio')) return 0;
      const match = bedrooms.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
    return null;
  }

  normalizePrice(price) {
    if (typeof price === 'number' && price > 0) return price;
    if (typeof price === 'string') {
      const numPrice = parseInt(price.replace(/[^0-9]/g, ''));
      return numPrice > 0 ? numPrice : null;
    }
    return null;
  }

  normalizeSize(size) {
    if (typeof size === 'number' && size > 0) return size;
    if (typeof size === 'string') {
      const numSize = parseInt(size.replace(/[^0-9]/g, ''));
      return numSize > 0 ? numSize : null;
    }
    return null;
  }

  normalizeDate(date) {
    try {
      return new Date(date).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  async saveRawData(data, filename = null) {
    try {
      await this.ensureDirectories();
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `rentals_raw_${timestamp}.json`;
      const filePath = path.join(this.rawDataPath, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      logger.info('Raw data saved', { filePath, recordCount: data.length });
      
      return filePath;
    } catch (error) {
      logger.error('Error saving raw data', { error: error.message });
      throw error;
    }
  }

  async saveProcessedData(data, filename = null) {
    try {
      await this.ensureDirectories();
      
      const timestamp = new Date().toISOString().split('T')[0];
      const jsonFileName = filename || `rentals_processed_${timestamp}.json`;
      const csvFileName = filename ? filename.replace('.json', '.csv') : `rentals_processed_${timestamp}.csv`;
      
      // Save as JSON
      const jsonPath = path.join(this.processedDataPath, jsonFileName);
      await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
      
      // Save as CSV
      const csvPath = path.join(this.processedDataPath, csvFileName);
      const writer = csvWriter.createObjectCsvWriter({
        path: csvPath,
        header: [
          { id: 'listingId', title: 'Listing ID' },
          { id: 'propertyName', title: 'Property Name' },
          { id: 'area', title: 'Area' },
          { id: 'bedrooms', title: 'Bedrooms' },
          { id: 'rentAmount', title: 'Rent Amount (AED)' },
          { id: 'sizeSqFt', title: 'Size (Sq Ft)' },
          { id: 'transactionDate', title: 'Transaction Date' },
          { id: 'source', title: 'Source' },
          { id: 'processedAt', title: 'Processed At' }
        ]
      });
      
      await writer.writeRecords(data);
      
      logger.info('Processed data saved', { 
        jsonPath, 
        csvPath, 
        recordCount: data.length 
      });
      
      return { jsonPath, csvPath };
    } catch (error) {
      logger.error('Error saving processed data', { error: error.message });
      throw error;
    }
  }

  async processAndSave(rawData) {
    try {
      logger.info('Starting data processing', { recordCount: rawData.length });
      
      // Normalize all records
      const normalizedData = rawData
        .map(record => this.normalizeRecord(record))
        .filter(record => record !== null);
      
      // Remove duplicates based on listingId
      const uniqueData = this.removeDuplicates(normalizedData, 'listingId');
      
      // Save raw data
      await this.saveRawData(rawData);
      
      // Save processed data
      const savedPaths = await this.saveProcessedData(uniqueData);
      
      logger.info('Data processing completed', {
        originalCount: rawData.length,
        normalizedCount: normalizedData.length,
        uniqueCount: uniqueData.length,
        savedPaths
      });
      
      return {
        originalCount: rawData.length,
        processedCount: uniqueData.length,
        data: uniqueData,
        savedPaths
      };
      
    } catch (error) {
      logger.error('Error in data processing', { error: error.message });
      throw error;
    }
  }

  removeDuplicates(data, key) {
    const seen = new Set();
    return data.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  }

  async getLatestProcessedData() {
    try {
      const files = await fs.readdir(this.processedDataPath);
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
      
      if (jsonFiles.length === 0) {
        logger.warn('No processed data files found');
        return [];
      }
      
      const latestFile = path.join(this.processedDataPath, jsonFiles[0]);
      const data = JSON.parse(await fs.readFile(latestFile, 'utf8'));
      
      logger.info('Latest processed data loaded', { 
        file: jsonFiles[0], 
        recordCount: data.length 
      });
      
      return data;
    } catch (error) {
      logger.error('Error loading latest processed data', { error: error.message });
      return [];
    }
  }

  calculateTrends(data, month = null) {
    try {
      let filteredData = data;
      
      if (month) {
        const targetMonth = month.slice(0, 7); // YYYY-MM format
        filteredData = data.filter(record => 
          record.transactionDate.slice(0, 7) === targetMonth
        );
      }
      
      if (filteredData.length === 0) {
        return {
          month: month || 'current',
          totalListings: 0,
          averageRent: 0,
          medianRent: 0,
          areaBreakdown: {},
          bedroomBreakdown: {}
        };
      }
      
      // Calculate basic stats
      const validRents = filteredData
        .map(r => r.rentAmount)
        .filter(r => r !== null && r > 0)
        .sort((a, b) => a - b);
      
      const avgRent = validRents.length > 0 
        ? Math.round(validRents.reduce((a, b) => a + b, 0) / validRents.length)
        : 0;
      
      const medianRent = validRents.length > 0
        ? validRents[Math.floor(validRents.length / 2)]
        : 0;
      
      // Area breakdown
      const areaBreakdown = {};
      filteredData.forEach(record => {
        if (record.area && record.area !== 'N/A') {
          if (!areaBreakdown[record.area]) {
            areaBreakdown[record.area] = { count: 0, totalRent: 0, avgRent: 0 };
          }
          areaBreakdown[record.area].count++;
          if (record.rentAmount) {
            areaBreakdown[record.area].totalRent += record.rentAmount;
          }
        }
      });
      
      // Calculate average rent per area
      Object.keys(areaBreakdown).forEach(area => {
        const data = areaBreakdown[area];
        data.avgRent = data.count > 0 ? Math.round(data.totalRent / data.count) : 0;
      });
      
      // Bedroom breakdown
      const bedroomBreakdown = {};
      filteredData.forEach(record => {
        const key = record.bedrooms !== null ? record.bedrooms.toString() : 'unknown';
        if (!bedroomBreakdown[key]) {
          bedroomBreakdown[key] = { count: 0, totalRent: 0, avgRent: 0 };
        }
        bedroomBreakdown[key].count++;
        if (record.rentAmount) {
          bedroomBreakdown[key].totalRent += record.rentAmount;
        }
      });
      
      // Calculate average rent per bedroom count
      Object.keys(bedroomBreakdown).forEach(bedrooms => {
        const data = bedroomBreakdown[bedrooms];
        data.avgRent = data.count > 0 ? Math.round(data.totalRent / data.count) : 0;
      });
      
      return {
        month: month || 'current',
        totalListings: filteredData.length,
        averageRent: avgRent,
        medianRent: medianRent,
        areaBreakdown,
        bedroomBreakdown,
        dataRange: {
          minRent: validRents.length > 0 ? validRents[0] : 0,
          maxRent: validRents.length > 0 ? validRents[validRents.length - 1] : 0
        }
      };
      
    } catch (error) {
      logger.error('Error calculating trends', { error: error.message });
      throw error;
    }
  }
}

module.exports = RentalDataProcessor; 