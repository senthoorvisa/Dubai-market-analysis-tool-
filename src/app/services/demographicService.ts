import axios from 'axios';
import { DemographicData, InfrastructureProject, InfrastructureAnalysis } from '../interfaces/demographics';

// Mock demographic data for different locations
const mockDemographicData: Record<string, DemographicData> = {
  'Dubai Marina': {
    location: 'Dubai Marina',
    populationStats: {
      total: 120000,
      year: 2023,
      growthRate: 3.5,
      density: 15000
    },
    wealthDistribution: {
      highNetWorth: 8500,
      ultraHighNetWorth: 1200,
      billionaires: 15,
      percentageOfWealthy: 8.1
    },
    ageDistribution: {
      under18: 15,
      age18to35: 45,
      age36to50: 25,
      age51to65: 10,
      above65: 5
    },
    historicalTrend: [
      { year: 2019, population: 105000, highNetWorthCount: 6800, averageIncome: 380000 },
      { year: 2020, population: 108000, highNetWorthCount: 7100, averageIncome: 395000 },
      { year: 2021, population: 112000, highNetWorthCount: 7800, averageIncome: 410000 },
      { year: 2022, population: 116000, highNetWorthCount: 8200, averageIncome: 435000 },
      { year: 2023, population: 120000, highNetWorthCount: 8500, averageIncome: 460000 }
    ]
  },
  'Downtown Dubai': {
    location: 'Downtown Dubai',
    populationStats: {
      total: 100000,
      year: 2023,
      growthRate: 2.8,
      density: 18000
    },
    wealthDistribution: {
      highNetWorth: 9000,
      ultraHighNetWorth: 1500,
      billionaires: 18,
      percentageOfWealthy: 9.5
    },
    ageDistribution: {
      under18: 12,
      age18to35: 40,
      age36to50: 30,
      age51to65: 12,
      above65: 6
    },
    historicalTrend: [
      { year: 2019, population: 90000, highNetWorthCount: 7500, averageIncome: 420000 },
      { year: 2020, population: 92500, highNetWorthCount: 8000, averageIncome: 435000 },
      { year: 2021, population: 95000, highNetWorthCount: 8300, averageIncome: 450000 },
      { year: 2022, population: 97500, highNetWorthCount: 8700, averageIncome: 470000 },
      { year: 2023, population: 100000, highNetWorthCount: 9000, averageIncome: 490000 }
    ]
  },
  'Palm Jumeirah': {
    location: 'Palm Jumeirah',
    populationStats: {
      total: 30000,
      year: 2023,
      growthRate: 1.8,
      density: 8000
    },
    wealthDistribution: {
      highNetWorth: 6000,
      ultraHighNetWorth: 1800,
      billionaires: 22,
      percentageOfWealthy: 20.7
    },
    ageDistribution: {
      under18: 10,
      age18to35: 25,
      age36to50: 35,
      age51to65: 20,
      above65: 10
    },
    historicalTrend: [
      { year: 2019, population: 28000, highNetWorthCount: 5200, averageIncome: 520000 },
      { year: 2020, population: 28500, highNetWorthCount: 5400, averageIncome: 540000 },
      { year: 2021, population: 29000, highNetWorthCount: 5600, averageIncome: 560000 },
      { year: 2022, population: 29500, highNetWorthCount: 5800, averageIncome: 580000 },
      { year: 2023, population: 30000, highNetWorthCount: 6000, averageIncome: 600000 }
    ]
  }
};

// Mock infrastructure projects for different locations
const mockInfrastructureAnalysis: Record<string, InfrastructureAnalysis> = {
  'Dubai Marina': {
    location: 'Dubai Marina',
    totalProjects: 6,
    projects: [
      {
        id: 'inf-001',
        name: 'Marina Promenade Extension',
        type: 'public',
        startDate: '2024-05-01',
        completionDate: '2025-06-30',
        estimatedCost: 50000000,
        estimatedImpact: 3.5,
        description: 'Extension of the popular Marina Promenade with additional leisure facilities.',
        status: 'planned',
        coordinates: { lat: 25.075, lng: 55.138 }
      },
      {
        id: 'inf-002',
        name: 'Dubai Marina Metro Upgrade',
        type: 'transport',
        startDate: '2023-12-15',
        completionDate: '2025-12-15',
        estimatedCost: 200000000,
        estimatedImpact: 5.8,
        description: 'Upgrade of Dubai Marina Metro Station with improved connectivity.',
        status: 'in_progress',
        coordinates: { lat: 25.076, lng: 55.140 }
      },
      {
        id: 'inf-003',
        name: 'Marina Mall Expansion',
        type: 'commercial',
        startDate: '2024-02-10',
        completionDate: '2026-02-10',
        estimatedCost: 350000000,
        estimatedImpact: 6.2,
        description: 'Major expansion of Dubai Marina Mall with additional retail and entertainment options.',
        status: 'planned',
        coordinates: { lat: 25.077, lng: 55.139 }
      }
    ],
    valueImpactAnalysis: {
      shortTerm: 4.2,
      mediumTerm: 8.5,
      longTerm: 12.8
    }
  },
  'Downtown Dubai': {
    location: 'Downtown Dubai',
    totalProjects: 5,
    projects: [
      {
        id: 'inf-004',
        name: 'Dubai Square',
        type: 'commercial',
        startDate: '2023-09-01',
        completionDate: '2027-09-01',
        estimatedCost: 2500000000,
        estimatedImpact: 8.5,
        description: 'A new retail and entertainment destination with over 8 million sq. ft. of gross floor retail space.',
        status: 'in_progress',
        coordinates: { lat: 25.197, lng: 55.272 }
      },
      {
        id: 'inf-005',
        name: 'Downtown Cultural District',
        type: 'entertainment',
        startDate: '2024-06-15',
        completionDate: '2026-12-15',
        estimatedCost: 800000000,
        estimatedImpact: 6.8,
        description: 'A new cultural district with museums, art galleries, and performance venues.',
        status: 'planned',
        coordinates: { lat: 25.198, lng: 55.273 }
      }
    ],
    valueImpactAnalysis: {
      shortTerm: 5.1,
      mediumTerm: 9.8,
      longTerm: 14.5
    }
  }
};

export const demographicService = {
  // Function to get demographic data for a location
  getDemographicData: async (location: string): Promise<DemographicData> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Check if we have mock data for the requested location
      if (mockDemographicData[location]) {
        return mockDemographicData[location];
      } else {
        // Return Dubai Marina data as default
        return mockDemographicData['Dubai Marina'];
      }
    } catch (error) {
      console.error('Error fetching demographic data:', error);
      throw error;
    }
  },

  // Function to get infrastructure projects for a location
  getInfrastructureAnalysis: async (location: string): Promise<InfrastructureAnalysis> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Check if we have mock data for the requested location
      if (mockInfrastructureAnalysis[location]) {
        return mockInfrastructureAnalysis[location];
      } else {
        // Return Dubai Marina data as default
        return mockInfrastructureAnalysis['Dubai Marina'];
      }
    } catch (error) {
      console.error('Error fetching infrastructure analysis:', error);
      throw error;
    }
  },

  // Function to get all infrastructure projects across all locations
  getAllInfrastructureProjects: async (): Promise<InfrastructureProject[]> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Combine all projects from all locations
      const allProjects: InfrastructureProject[] = [];
      
      for (const location in mockInfrastructureAnalysis) {
        allProjects.push(...mockInfrastructureAnalysis[location].projects);
      }
      
      return allProjects;
    } catch (error) {
      console.error('Error fetching all infrastructure projects:', error);
      throw error;
    }
  },

  // Function to get wealth distribution comparison across locations
  getWealthDistributionComparison: async (): Promise<Record<string, any>> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 550));
      
      // Extract wealth distribution data for each location
      const comparison: Record<string, any> = {};
      
      for (const location in mockDemographicData) {
        comparison[location] = mockDemographicData[location].wealthDistribution;
      }
      
      return comparison;
    } catch (error) {
      console.error('Error fetching wealth distribution comparison:', error);
      throw error;
    }
  }
}; 