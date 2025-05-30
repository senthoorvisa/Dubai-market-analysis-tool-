const axios = require('axios');
const { createServiceLogger } = require('../utils/logger');
const DLDAPIClient = require('../propertyLookup/dldClient');

const logger = createServiceLogger('DEVELOPER_DATA_COLLECTOR');

class DeveloperDataCollector {
  constructor() {
    this.dldClient = new DLDAPIClient();
    this.githubToken = process.env.GITHUB_TOKEN; // Optional for higher rate limits
    this.bayutBaseUrl = 'https://www.bayut.com';
  }

  /**
   * Fetch real developer data from DLD API
   */
  async fetchDevelopersFromDLD() {
    try {
      logger.info('Fetching developers from DLD API');

      const data = await this.dldClient.makeRequest('/v1/developers/list', {
        limit: 100,
        status: 'active'
      });

      const developers = (data.developers || []).map(dev => ({
        name: dev.developer_name,
        licenseNumber: dev.license_number,
        registrationDate: dev.registration_date,
        licenseType: dev.license_type,
        status: dev.status,
        website: dev.website,
        phone: dev.phone,
        email: dev.email,
        address: dev.address,
        establishedYear: dev.established_year,
        totalProjects: dev.total_projects || 0,
        activeProjects: dev.active_projects || 0,
        completedProjects: dev.completed_projects || 0,
        source: 'DLD'
      }));

      logger.info(`Fetched ${developers.length} developers from DLD API`);
      return developers;

    } catch (error) {
      logger.error('Error fetching developers from DLD:', error);
      return [];
    }
  }

  /**
   * Fetch projects for a specific developer from DLD API
   */
  async fetchProjectsForDeveloper(developerName) {
    try {
      logger.info(`Fetching projects for developer: ${developerName}`);

      const data = await this.dldClient.getPropertiesByDeveloper(developerName, {
        limit: 100
      });

      const projects = data.properties.map(project => ({
        projectId: project.propertyId,
        projectName: project.projectName,
        propertyName: project.propertyName,
        location: project.location,
        area: project.area,
        propertyType: project.propertyType,
        status: project.status,
        totalUnits: project.totalUnits,
        soldUnits: project.soldUnits,
        availableUnits: project.availableUnits,
        startDate: project.startDate,
        completionDate: project.completionDate,
        averagePrice: project.averagePrice,
        coordinates: project.coordinates,
        source: 'DLD'
      }));

      logger.info(`Fetched ${projects.length} projects for ${developerName}`);
      return projects;

    } catch (error) {
      logger.error(`Error fetching projects for developer ${developerName}:`, error);
      return [];
    }
  }

  /**
   * Fetch developer information from GitHub repositories
   */
  async fetchDeveloperDataFromGitHub(developerName) {
    try {
      logger.info(`Searching GitHub for developer data: ${developerName}`);

      const searchQueries = [
        `${developerName} dubai real estate`,
        `${developerName} property development`,
        `${developerName} projects dubai`
      ];

      const repositories = [];
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Dubai-Market-Analysis-Tool'
      };

      if (this.githubToken) {
        headers['Authorization'] = `token ${this.githubToken}`;
      }

      for (const query of searchQueries) {
        try {
          const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
              q: query,
              sort: 'stars',
              order: 'desc',
              per_page: 10
            },
            headers
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
            query: query,
            relevantToDeveloper: this.calculateRelevanceScore(repo, developerName)
          })));

          // Rate limiting for GitHub API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          logger.error(`Error searching GitHub for "${query}":`, error);
        }
      }

      // Filter and sort by relevance
      const relevantRepos = repositories
        .filter(repo => repo.relevantToDeveloper > 0.3)
        .sort((a, b) => b.relevantToDeveloper - a.relevantToDeveloper);

      logger.info(`Found ${relevantRepos.length} relevant GitHub repositories for ${developerName}`);
      return relevantRepos;

    } catch (error) {
      logger.error(`Error fetching GitHub data for ${developerName}:`, error);
      return [];
    }
  }

  /**
   * Calculate relevance score for GitHub repository
   */
  calculateRelevanceScore(repo, developerName) {
    let score = 0;
    const name = repo.name.toLowerCase();
    const description = (repo.description || '').toLowerCase();
    const devName = developerName.toLowerCase();

    // Check if developer name appears in repo name or description
    if (name.includes(devName) || description.includes(devName)) {
      score += 0.8;
    }

    // Check for real estate related keywords
    const realEstateKeywords = ['real estate', 'property', 'dubai', 'development', 'construction'];
    for (const keyword of realEstateKeywords) {
      if (name.includes(keyword) || description.includes(keyword)) {
        score += 0.2;
      }
    }

    // Bonus for stars and recent activity
    if (repo.stargazers_count > 10) score += 0.1;
    if (repo.stargazers_count > 50) score += 0.1;
    
    const lastUpdate = new Date(repo.updated_at);
    const monthsOld = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld < 12) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Fetch developer projects from Bayut
   */
  async fetchDeveloperProjectsFromBayut(developerName) {
    try {
      logger.info(`Searching Bayut for ${developerName} projects`);

      const searchUrl = `${this.bayutBaseUrl}/developers/${developerName.toLowerCase().replace(/\s+/g, '-')}/`;
      
      // This would require web scraping - implementing basic structure
      const projects = await this.scrapeBayutDeveloperPage(searchUrl, developerName);
      
      logger.info(`Found ${projects.length} projects on Bayut for ${developerName}`);
      return projects;

    } catch (error) {
      logger.error(`Error fetching Bayut data for ${developerName}:`, error);
      return [];
    }
  }

  /**
   * Scrape developer page from Bayut (simplified implementation)
   */
  async scrapeBayutDeveloperPage(url, developerName) {
    try {
      // For now, return empty array - would need Playwright for full implementation
      // This is a placeholder for the actual scraping logic
      logger.info(`Bayut scraping for ${developerName} - placeholder implementation`);
      return [];

    } catch (error) {
      logger.error(`Error scraping Bayut for ${developerName}:`, error);
      return [];
    }
  }

  /**
   * Calculate developer reputation score based on real data
   */
  calculateReputationScore(projects, marketData = {}) {
    try {
      if (!projects || projects.length === 0) {
        return {
          overallScore: 0,
          completionRate: 0,
          onTimeDelivery: 0,
          marketPresence: 0,
          qualityScore: 0,
          breakdown: {
            projectCount: 0,
            completedProjects: 0,
            onTimeProjects: 0,
            averageProjectValue: 0,
            marketShare: 0
          }
        };
      }

      const completedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'completed');
      const totalProjects = projects.length;
      const completionRate = totalProjects > 0 ? (completedProjects.length / totalProjects) * 100 : 0;

      // Calculate on-time delivery rate
      const projectsWithDates = projects.filter(p => p.startDate && p.completionDate);
      let onTimeProjects = 0;

      for (const project of projectsWithDates) {
        const startDate = new Date(project.startDate);
        const completionDate = new Date(project.completionDate);
        const plannedDuration = project.plannedDuration || 24; // Default 24 months
        const actualDuration = (completionDate - startDate) / (1000 * 60 * 60 * 24 * 30); // months

        if (actualDuration <= plannedDuration * 1.1) { // 10% tolerance
          onTimeProjects++;
        }
      }

      const onTimeDelivery = projectsWithDates.length > 0 ? (onTimeProjects / projectsWithDates.length) * 100 : 0;

      // Calculate market presence
      const totalUnits = projects.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
      const averageProjectValue = projects.reduce((sum, p) => sum + (p.averagePrice || 0), 0) / totalProjects;
      
      // Market presence based on project count, total units, and value
      const marketPresence = Math.min(
        (totalProjects / 10) * 20 + // Up to 20 points for project count
        (totalUnits / 1000) * 30 + // Up to 30 points for total units
        (averageProjectValue / 1000000) * 50, // Up to 50 points for average value
        100
      );

      // Quality score based on completion rate and on-time delivery
      const qualityScore = (completionRate * 0.6) + (onTimeDelivery * 0.4);

      // Overall score calculation
      const overallScore = (
        completionRate * 0.3 +
        onTimeDelivery * 0.25 +
        marketPresence * 0.25 +
        qualityScore * 0.2
      );

      return {
        overallScore: Math.round(overallScore * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        onTimeDelivery: Math.round(onTimeDelivery * 10) / 10,
        marketPresence: Math.round(marketPresence * 10) / 10,
        qualityScore: Math.round(qualityScore * 10) / 10,
        breakdown: {
          projectCount: totalProjects,
          completedProjects: completedProjects.length,
          onTimeProjects,
          averageProjectValue: Math.round(averageProjectValue),
          totalUnits,
          marketShare: marketData.marketShare || 0
        }
      };

    } catch (error) {
      logger.error('Error calculating reputation score:', error);
      return {
        overallScore: 0,
        completionRate: 0,
        onTimeDelivery: 0,
        marketPresence: 0,
        qualityScore: 0,
        breakdown: {
          projectCount: 0,
          completedProjects: 0,
          onTimeProjects: 0,
          averageProjectValue: 0,
          marketShare: 0
        }
      };
    }
  }

  /**
   * Comprehensive developer analysis
   */
  async analyzeDeveloper(developerName) {
    try {
      logger.info(`Starting comprehensive analysis for developer: ${developerName}`);

      const analysis = {
        developer: developerName,
        analysisDate: new Date().toISOString(),
        dataSources: {
          dld: null,
          github: null,
          bayut: null
        },
        projects: [],
        reputation: null,
        marketPosition: null,
        insights: []
      };

      // Fetch data from multiple sources
      const [projects, githubData, bayutData] = await Promise.all([
        this.fetchProjectsForDeveloper(developerName),
        this.fetchDeveloperDataFromGitHub(developerName),
        this.fetchDeveloperProjectsFromBayut(developerName)
      ]);

      analysis.projects = projects;
      analysis.dataSources.dld = { projectCount: projects.length, source: 'DLD API' };
      analysis.dataSources.github = { repositoryCount: githubData.length, source: 'GitHub API' };
      analysis.dataSources.bayut = { projectCount: bayutData.length, source: 'Bayut Scraping' };

      // Calculate reputation score
      analysis.reputation = this.calculateReputationScore(projects);

      // Generate insights
      analysis.insights = this.generateDeveloperInsights(analysis);

      logger.info(`Analysis completed for ${developerName}`);
      return analysis;

    } catch (error) {
      logger.error(`Error analyzing developer ${developerName}:`, error);
      throw error;
    }
  }

  /**
   * Generate insights based on analysis
   */
  generateDeveloperInsights(analysis) {
    const insights = [];
    const reputation = analysis.reputation;
    const projects = analysis.projects;

    // Completion rate insights
    if (reputation.completionRate >= 90) {
      insights.push({
        type: 'positive',
        category: 'completion',
        message: `Excellent completion rate of ${reputation.completionRate}% demonstrates strong project delivery capability.`
      });
    } else if (reputation.completionRate < 70) {
      insights.push({
        type: 'warning',
        category: 'completion',
        message: `Completion rate of ${reputation.completionRate}% is below market average and may indicate delivery challenges.`
      });
    }

    // On-time delivery insights
    if (reputation.onTimeDelivery >= 80) {
      insights.push({
        type: 'positive',
        category: 'delivery',
        message: `Strong on-time delivery rate of ${reputation.onTimeDelivery}% shows reliable project management.`
      });
    } else if (reputation.onTimeDelivery < 60) {
      insights.push({
        type: 'warning',
        category: 'delivery',
        message: `On-time delivery rate of ${reputation.onTimeDelivery}% suggests potential project timeline issues.`
      });
    }

    // Market presence insights
    if (reputation.breakdown.projectCount >= 20) {
      insights.push({
        type: 'positive',
        category: 'market_presence',
        message: `Extensive portfolio of ${reputation.breakdown.projectCount} projects indicates strong market presence.`
      });
    } else if (reputation.breakdown.projectCount < 5) {
      insights.push({
        type: 'neutral',
        category: 'market_presence',
        message: `Limited portfolio of ${reputation.breakdown.projectCount} projects suggests emerging or specialized developer.`
      });
    }

    // Project value insights
    if (reputation.breakdown.averageProjectValue > 1000000) {
      insights.push({
        type: 'positive',
        category: 'project_value',
        message: `High average project value of AED ${(reputation.breakdown.averageProjectValue / 1000000).toFixed(1)}M indicates premium market positioning.`
      });
    }

    return insights;
  }

  /**
   * Get all developers with analysis
   */
  async getAllDevelopersWithAnalysis() {
    try {
      logger.info('Fetching all developers with analysis');

      const developers = await this.fetchDevelopersFromDLD();
      const analysisResults = [];

      // Analyze top developers (limit to prevent API overload)
      const topDevelopers = developers.slice(0, 20);

      for (const developer of topDevelopers) {
        try {
          const analysis = await this.analyzeDeveloper(developer.name);
          analysisResults.push(analysis);

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          logger.error(`Failed to analyze developer ${developer.name}:`, error);
        }
      }

      logger.info(`Completed analysis for ${analysisResults.length} developers`);
      return analysisResults;

    } catch (error) {
      logger.error('Error getting all developers with analysis:', error);
      throw error;
    }
  }
}

module.exports = DeveloperDataCollector; 