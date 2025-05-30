const fs = require('fs').promises;
const path = require('path');
const { createServiceLogger } = require('../utils/logger');
const DLDAPIClient = require('../propertyLookup/dldClient');

const logger = createServiceLogger('DEVELOPER_COLLECTOR');

class DeveloperDataCollector {
  constructor() {
    this.dldClient = new DLDAPIClient();
    this.dataPath = path.join(process.cwd(), 'data', 'developers');
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.dataPath, { recursive: true });
      logger.info('Developer data directories ensured');
    } catch (error) {
      logger.error('Error creating directories', { error: error.message });
      throw error;
    }
  }

  async fetchDeveloperProjects() {
    try {
      logger.info('Fetching developer projects from DLD API');

      // Mock implementation - replace with actual DLD API call
      const developers = await this.getMockDevelopers();
      const projectsData = [];

      for (const developer of developers) {
        logger.info('Processing developer', { developer: developer.name });
        
        try {
          const projects = await this.fetchProjectsForDeveloper(developer.name);
          projectsData.push({
            developerName: developer.name,
            projects: projects,
            fetchedAt: new Date().toISOString()
          });
        } catch (error) {
          logger.error('Error fetching projects for developer', { 
            developer: developer.name, 
            error: error.message 
          });
        }
      }

      return projectsData;
    } catch (error) {
      logger.error('Error fetching developer projects', { error: error.message });
      throw error;
    }
  }

  async fetchProjectsForDeveloper(developerName) {
    try {
      // Mock project data - replace with actual API calls
      const projectCount = Math.floor(Math.random() * 50) + 10;
      const projects = [];

      for (let i = 0; i < projectCount; i++) {
        const startDate = this.getRandomDate(2015, 2020);
        const endDate = this.getRandomDate(2020, 2024);
        const isCompleted = Math.random() > 0.3; // 70% completion rate

        projects.push({
          projectId: `${developerName.replace(/\s+/g, '_')}_project_${i + 1}`,
          projectName: this.generateProjectName(),
          location: this.getRandomLocation(),
          status: isCompleted ? 'Completed' : this.getRandomStatus(),
          startDate: startDate,
          endDate: isCompleted ? endDate : null,
          plannedEndDate: endDate,
          totalUnits: Math.floor(Math.random() * 500) + 50,
          soldUnits: Math.floor(Math.random() * 400) + 20,
          averagePrice: Math.floor(Math.random() * 2000000) + 500000,
          projectType: this.getRandomProjectType(),
          buildingPermitDate: startDate,
          completionCertificateDate: isCompleted ? endDate : null
        });
      }

      return projects;
    } catch (error) {
      logger.error('Error fetching projects for developer', { 
        developerName, 
        error: error.message 
      });
      return [];
    }
  }

  async fetchBayutDeveloperActivity() {
    try {
      logger.info('Fetching developer activity from Bayut listings');

      // Mock implementation - in reality, you'd scrape Bayut or use their API
      const developers = await this.getMockDevelopers();
      const activityData = [];

      for (const developer of developers) {
        const activity = {
          developerName: developer.name,
          activeListings: Math.floor(Math.random() * 200) + 50,
          averageListingPrice: Math.floor(Math.random() * 1500000) + 600000,
          listingTypes: {
            sale: Math.floor(Math.random() * 150) + 30,
            rent: Math.floor(Math.random() * 100) + 20
          },
          popularAreas: this.getPopularAreasForDeveloper(developer.name),
          recentListings: Math.floor(Math.random() * 50) + 10,
          agentPartners: Math.floor(Math.random() * 20) + 5,
          lastUpdated: new Date().toISOString()
        };

        activityData.push(activity);
      }

      return activityData;
    } catch (error) {
      logger.error('Error fetching Bayut developer activity', { error: error.message });
      return [];
    }
  }

  async getMockDevelopers() {
    return [
      {
        name: 'Emaar Properties',
        established: 1997,
        type: 'Public',
        headquarters: 'Dubai'
      },
      {
        name: 'DAMAC Properties',
        established: 2002,
        type: 'Public',
        headquarters: 'Dubai'
      },
      {
        name: 'Dubai Properties',
        established: 2004,
        type: 'Government',
        headquarters: 'Dubai'
      },
      {
        name: 'Nakheel',
        established: 2000,
        type: 'Government',
        headquarters: 'Dubai'
      },
      {
        name: 'Sobha Realty',
        established: 1976,
        type: 'Private',
        headquarters: 'Dubai'
      },
      {
        name: 'Meraas',
        established: 2007,
        type: 'Private',
        headquarters: 'Dubai'
      },
      {
        name: 'Azizi Developments',
        established: 2007,
        type: 'Private',
        headquarters: 'Dubai'
      },
      {
        name: 'Ellington Properties',
        established: 2014,
        type: 'Private',
        headquarters: 'Dubai'
      },
      {
        name: 'Omniyat',
        established: 2005,
        type: 'Private',
        headquarters: 'Dubai'
      },
      {
        name: 'Deyaar Development',
        established: 2002,
        type: 'Public',
        headquarters: 'Dubai'
      }
    ];
  }

  generateProjectName() {
    const prefixes = ['The', 'Dubai', 'Marina', 'Boulevard', 'Grand', 'Royal', 'Elite', 'Prime'];
    const names = ['Residence', 'Tower', 'Heights', 'Plaza', 'Gardens', 'Square', 'Bay', 'Views'];
    const suffixes = ['I', 'II', 'III', 'East', 'West', 'North', 'South', 'Central'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const suffix = Math.random() > 0.5 ? ` ${suffixes[Math.floor(Math.random() * suffixes.length)]}` : '';
    
    return `${prefix} ${name}${suffix}`;
  }

  getRandomLocation() {
    const locations = [
      'Downtown Dubai', 'Dubai Marina', 'Business Bay', 'JBR', 'DIFC',
      'Dubai Hills Estate', 'Arabian Ranches', 'Jumeirah', 'Dubai South',
      'Dubai Creek Harbour', 'Mohammed Bin Rashid City', 'Jumeirah Lake Towers'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getRandomStatus() {
    const statuses = ['Under Construction', 'Planning', 'Foundation', 'Delayed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getRandomProjectType() {
    const types = ['Residential', 'Commercial', 'Mixed Use', 'Hospitality', 'Retail'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomDate(startYear, endYear) {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  }

  getPopularAreasForDeveloper(developerName) {
    const allAreas = [
      'Downtown Dubai', 'Dubai Marina', 'Business Bay', 'JBR', 'DIFC',
      'Dubai Hills Estate', 'Arabian Ranches', 'Jumeirah'
    ];
    
    const count = Math.floor(Math.random() * 4) + 2; // 2-5 areas
    const shuffled = allAreas.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(area => ({
      area,
      projectCount: Math.floor(Math.random() * 10) + 1
    }));
  }

  async collectAllData() {
    try {
      logger.info('Starting comprehensive developer data collection');

      const [projectsData, activityData] = await Promise.all([
        this.fetchDeveloperProjects(),
        this.fetchBayutDeveloperActivity()
      ]);

      // Combine data by developer
      const combinedData = {};
      
      // Process projects data
      projectsData.forEach(dev => {
        if (!combinedData[dev.developerName]) {
          combinedData[dev.developerName] = {
            developerName: dev.developerName,
            projects: [],
            activity: null
          };
        }
        combinedData[dev.developerName].projects = dev.projects;
      });

      // Process activity data
      activityData.forEach(activity => {
        if (combinedData[activity.developerName]) {
          combinedData[activity.developerName].activity = activity;
        }
      });

      const result = Object.values(combinedData);
      
      logger.info('Data collection completed', { 
        developersProcessed: result.length,
        totalProjects: result.reduce((sum, dev) => sum + dev.projects.length, 0)
      });

      return result;
    } catch (error) {
      logger.error('Error in comprehensive data collection', { error: error.message });
      throw error;
    }
  }

  async saveData(data, filename = null) {
    try {
      await this.ensureDirectories();
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `developers_data_${timestamp}.json`;
      const filePath = path.join(this.dataPath, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      logger.info('Developer data saved successfully', { 
        filePath, 
        developerCount: data.length 
      });
      
      return filePath;
    } catch (error) {
      logger.error('Error saving developer data', { error: error.message });
      throw error;
    }
  }

  async getLatestData() {
    try {
      const files = await fs.readdir(this.dataPath);
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
      
      if (jsonFiles.length === 0) {
        logger.warn('No developer data files found');
        return [];
      }
      
      const latestFile = path.join(this.dataPath, jsonFiles[0]);
      const data = JSON.parse(await fs.readFile(latestFile, 'utf8'));
      
      logger.info('Latest developer data loaded', { 
        file: jsonFiles[0], 
        developerCount: data.length 
      });
      
      return data;
    } catch (error) {
      logger.error('Error loading latest developer data', { error: error.message });
      return [];
    }
  }
}

module.exports = DeveloperDataCollector; 