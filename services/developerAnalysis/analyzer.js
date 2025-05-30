const { createServiceLogger } = require('../utils/logger');

const logger = createServiceLogger('DEVELOPER_ANALYZER');

class DeveloperAnalyzer {
  constructor() {
    // Weights for reputation score calculation
    this.reputationWeights = {
      completionRate: 0.25,
      onTimeDelivery: 0.20,
      projectScale: 0.15,
      marketActivity: 0.15,
      priceStability: 0.10,
      customerSatisfaction: 0.10,
      financialStability: 0.05
    };
  }

  async analyzeDeveloper(developerData) {
    try {
      const { developerName, projects, activity } = developerData;
      
      logger.info('Analyzing developer', { developerName });

      // Calculate basic metrics
      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === 'Completed').length;
      const ongoingProjects = projects.filter(p => p.status !== 'Completed').length;

      // Calculate completion metrics
      const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
      const avgCompletionTime = this.calculateAverageCompletionTime(projects);
      
      // Calculate financial metrics
      const avgSalesPrice = this.calculateAverageSalesPrice(projects);
      const totalUnits = projects.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
      const totalSoldUnits = projects.reduce((sum, p) => sum + (p.soldUnits || 0), 0);
      const salesRate = totalUnits > 0 ? (totalSoldUnits / totalUnits) * 100 : 0;

      // Calculate delivery performance
      const onTimeDeliveryRate = this.calculateOnTimeDeliveryRate(projects);
      
      // Calculate market presence
      const marketPresence = this.calculateMarketPresence(activity);
      
      // Calculate reputation score
      const reputationScore = this.calculateReputationScore({
        completionRate,
        onTimeDeliveryRate,
        totalProjects,
        salesRate,
        avgSalesPrice,
        marketPresence
      });

      // Analyze project trends
      const projectTrends = this.analyzeProjectTrends(projects);
      
      // Popular areas analysis
      const areaAnalysis = this.analyzePopularAreas(projects);

      const analysis = {
        developerName,
        totalProjects,
        completedProjects,
        ongoingProjects,
        completionRate: Math.round(completionRate * 100) / 100,
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 100) / 100,
        avgSalesPrice: Math.round(avgSalesPrice),
        totalUnits,
        totalSoldUnits,
        salesRate: Math.round(salesRate * 100) / 100,
        reputationScore: Math.round(reputationScore * 100) / 100,
        marketPresence,
        projectTrends,
        areaAnalysis,
        lastUpdated: new Date().toISOString()
      };

      logger.info('Developer analysis completed', { 
        developerName, 
        reputationScore: analysis.reputationScore 
      });

      return analysis;
    } catch (error) {
      logger.error('Error analyzing developer', { 
        developerName: developerData.developerName, 
        error: error.message 
      });
      throw error;
    }
  }

  calculateAverageCompletionTime(projects) {
    const completedProjects = projects.filter(p => 
      p.status === 'Completed' && p.startDate && p.endDate
    );

    if (completedProjects.length === 0) return 0;

    const totalTime = completedProjects.reduce((sum, project) => {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      return sum + months;
    }, 0);

    return totalTime / completedProjects.length;
  }

  calculateAverageSalesPrice(projects) {
    const projectsWithPrice = projects.filter(p => p.averagePrice && p.averagePrice > 0);
    
    if (projectsWithPrice.length === 0) return 0;
    
    const totalPrice = projectsWithPrice.reduce((sum, p) => sum + p.averagePrice, 0);
    return totalPrice / projectsWithPrice.length;
  }

  calculateOnTimeDeliveryRate(projects) {
    const completedProjects = projects.filter(p => 
      p.status === 'Completed' && p.plannedEndDate && p.endDate
    );

    if (completedProjects.length === 0) return 100; // Benefit of doubt for new developers

    const onTimeProjects = completedProjects.filter(p => {
      const planned = new Date(p.plannedEndDate);
      const actual = new Date(p.endDate);
      return actual <= planned;
    });

    return (onTimeProjects.length / completedProjects.length) * 100;
  }

  calculateMarketPresence(activity) {
    if (!activity) return 0;

    // Normalize market presence based on activity metrics
    const listingsScore = Math.min(activity.activeListings / 100, 1) * 100; // Max 100 for 100+ listings
    const priceScore = Math.min(activity.averageListingPrice / 2000000, 1) * 100; // Max 100 for 2M+ average
    const diversityScore = (activity.popularAreas?.length || 0) * 10; // 10 points per area
    
    return Math.min((listingsScore + priceScore + diversityScore) / 3, 100);
  }

  calculateReputationScore(metrics) {
    const {
      completionRate,
      onTimeDeliveryRate,
      totalProjects,
      salesRate,
      avgSalesPrice,
      marketPresence
    } = metrics;

    // Normalize values to 0-100 scale
    const normalizedMetrics = {
      completionRate: Math.min(completionRate, 100),
      onTimeDelivery: Math.min(onTimeDeliveryRate, 100),
      projectScale: Math.min((totalProjects / 50) * 100, 100), // Max 100 for 50+ projects
      marketActivity: Math.min(marketPresence, 100),
      priceStability: Math.min((avgSalesPrice / 2000000) * 100, 100), // Max 100 for 2M+ average
      customerSatisfaction: Math.min(salesRate, 100), // Using sales rate as proxy
      financialStability: Math.min(salesRate, 100) // Using sales rate as proxy
    };

    // Calculate weighted score
    let score = 0;
    score += normalizedMetrics.completionRate * this.reputationWeights.completionRate;
    score += normalizedMetrics.onTimeDelivery * this.reputationWeights.onTimeDelivery;
    score += normalizedMetrics.projectScale * this.reputationWeights.projectScale;
    score += normalizedMetrics.marketActivity * this.reputationWeights.marketActivity;
    score += normalizedMetrics.priceStability * this.reputationWeights.priceStability;
    score += normalizedMetrics.customerSatisfaction * this.reputationWeights.customerSatisfaction;
    score += normalizedMetrics.financialStability * this.reputationWeights.financialStability;

    return Math.min(score, 100);
  }

  analyzeProjectTrends(projects) {
    const trends = {
      yearlyProjects: {},
      statusDistribution: {},
      typeDistribution: {},
      averagePriceByYear: {},
      completionTrend: []
    };

    // Group projects by year
    projects.forEach(project => {
      const year = new Date(project.startDate).getFullYear();
      trends.yearlyProjects[year] = (trends.yearlyProjects[year] || 0) + 1;
      
      // Status distribution
      trends.statusDistribution[project.status] = 
        (trends.statusDistribution[project.status] || 0) + 1;
      
      // Type distribution
      trends.typeDistribution[project.projectType] = 
        (trends.typeDistribution[project.projectType] || 0) + 1;
      
      // Average price by year
      if (project.averagePrice) {
        if (!trends.averagePriceByYear[year]) {
          trends.averagePriceByYear[year] = { total: 0, count: 0 };
        }
        trends.averagePriceByYear[year].total += project.averagePrice;
        trends.averagePriceByYear[year].count += 1;
      }
    });

    // Calculate average prices
    Object.keys(trends.averagePriceByYear).forEach(year => {
      const data = trends.averagePriceByYear[year];
      trends.averagePriceByYear[year] = Math.round(data.total / data.count);
    });

    return trends;
  }

  analyzePopularAreas(projects) {
    const areaStats = {};
    
    projects.forEach(project => {
      const area = project.location;
      if (!areaStats[area]) {
        areaStats[area] = {
          projectCount: 0,
          completedCount: 0,
          totalUnits: 0,
          avgPrice: 0,
          priceSum: 0,
          priceCount: 0
        };
      }
      
      areaStats[area].projectCount++;
      if (project.status === 'Completed') {
        areaStats[area].completedCount++;
      }
      if (project.totalUnits) {
        areaStats[area].totalUnits += project.totalUnits;
      }
      if (project.averagePrice) {
        areaStats[area].priceSum += project.averagePrice;
        areaStats[area].priceCount++;
      }
    });

    // Calculate averages and completion rates
    Object.keys(areaStats).forEach(area => {
      const stats = areaStats[area];
      stats.completionRate = stats.projectCount > 0 ? 
        (stats.completedCount / stats.projectCount) * 100 : 0;
      stats.avgPrice = stats.priceCount > 0 ? 
        Math.round(stats.priceSum / stats.priceCount) : 0;
      
      // Remove working variables
      delete stats.priceSum;
      delete stats.priceCount;
    });

    // Sort by project count
    const sortedAreas = Object.entries(areaStats)
      .sort(([,a], [,b]) => b.projectCount - a.projectCount)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    return sortedAreas;
  }

  async analyzeAllDevelopers(developersData) {
    try {
      logger.info('Starting analysis of all developers', { 
        developerCount: developersData.length 
      });

      const analyses = [];
      
      for (const developerData of developersData) {
        try {
          const analysis = await this.analyzeDeveloper(developerData);
          analyses.push(analysis);
        } catch (error) {
          logger.error('Failed to analyze developer', { 
            developerName: developerData.developerName,
            error: error.message 
          });
        }
      }

      // Sort by reputation score
      analyses.sort((a, b) => b.reputationScore - a.reputationScore);

      logger.info('Analysis completed for all developers', { 
        totalAnalyzed: analyses.length,
        topDeveloper: analyses[0]?.developerName
      });

      return analyses;
    } catch (error) {
      logger.error('Error analyzing all developers', { error: error.message });
      throw error;
    }
  }

  generateMarketInsights(analyses) {
    try {
      const insights = {
        marketLeaders: analyses.slice(0, 5).map(a => ({
          name: a.developerName,
          reputationScore: a.reputationScore,
          totalProjects: a.totalProjects
        })),
        averageMetrics: {
          completionRate: this.calculateAverage(analyses, 'completionRate'),
          avgCompletionTime: this.calculateAverage(analyses, 'avgCompletionTime'),
          onTimeDeliveryRate: this.calculateAverage(analyses, 'onTimeDeliveryRate'),
          avgSalesPrice: this.calculateAverage(analyses, 'avgSalesPrice'),
          reputationScore: this.calculateAverage(analyses, 'reputationScore')
        },
        marketTrends: {
          totalDevelopers: analyses.length,
          totalProjects: analyses.reduce((sum, a) => sum + a.totalProjects, 0),
          completedProjects: analyses.reduce((sum, a) => sum + a.completedProjects, 0),
          ongoingProjects: analyses.reduce((sum, a) => sum + a.ongoingProjects, 0)
        },
        performanceDistribution: this.calculatePerformanceDistribution(analyses)
      };

      return insights;
    } catch (error) {
      logger.error('Error generating market insights', { error: error.message });
      throw error;
    }
  }

  calculateAverage(analyses, field) {
    const values = analyses.map(a => a[field]).filter(v => v !== null && v !== undefined);
    return values.length > 0 ? 
      Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100 : 0;
  }

  calculatePerformanceDistribution(analyses) {
    const distribution = {
      excellent: 0, // 80-100
      good: 0,      // 60-79
      average: 0,   // 40-59
      below: 0      // 0-39
    };

    analyses.forEach(analysis => {
      const score = analysis.reputationScore;
      if (score >= 80) distribution.excellent++;
      else if (score >= 60) distribution.good++;
      else if (score >= 40) distribution.average++;
      else distribution.below++;
    });

    return distribution;
  }
}

module.exports = DeveloperAnalyzer; 