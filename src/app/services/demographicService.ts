import axios from 'axios';
import { DemographicData, InfrastructureProject, InfrastructureAnalysis } from '../interfaces/demographics';

// Mock demographic data for different locations
const mockDemographicData: Record<string, DemographicData> = {
  'Dubai Marina': {
    location: 'Dubai Marina',
    populationStats: {
      total: 125000,
      year: 2025,
      growthRate: 4.2,
      density: 16000
    },
    wealthDistribution: {
      highNetWorth: 9200,
      ultraHighNetWorth: 1400,
      billionaires: 18,
      percentageOfWealthy: 9.2
    },
    ageDistribution: {
      under18: 15,
      age18to35: 45,
      age36to50: 25,
      age51to65: 10,
      above65: 5
    },
    historicalTrend: [
      { year: 2021, population: 112000, highNetWorthCount: 7800, averageIncome: 410000 },
      { year: 2022, population: 116000, highNetWorthCount: 8200, averageIncome: 435000 },
      { year: 2023, population: 120000, highNetWorthCount: 8500, averageIncome: 460000 },
      { year: 2024, population: 122500, highNetWorthCount: 8900, averageIncome: 480000 },
      { year: 2025, population: 125000, highNetWorthCount: 9200, averageIncome: 520000 }
    ]
  },
  'Downtown Dubai': {
    location: 'Downtown Dubai',
    populationStats: {
      total: 105000,
      year: 2025,
      growthRate: 3.2,
      density: 19000
    },
    wealthDistribution: {
      highNetWorth: 9800,
      ultraHighNetWorth: 1700,
      billionaires: 22,
      percentageOfWealthy: 10.3
    },
    ageDistribution: {
      under18: 12,
      age18to35: 40,
      age36to50: 30,
      age51to65: 12,
      above65: 6
    },
    historicalTrend: [
      { year: 2021, population: 95000, highNetWorthCount: 8300, averageIncome: 450000 },
      { year: 2022, population: 97500, highNetWorthCount: 8700, averageIncome: 470000 },
      { year: 2023, population: 100000, highNetWorthCount: 9000, averageIncome: 490000 },
      { year: 2024, population: 102500, highNetWorthCount: 9400, averageIncome: 510000 },
      { year: 2025, population: 105000, highNetWorthCount: 9800, averageIncome: 530000 }
    ]
  },
  'Palm Jumeirah': {
    location: 'Palm Jumeirah',
    populationStats: {
      total: 32000,
      year: 2025,
      growthRate: 2.1,
      density: 8500
    },
    wealthDistribution: {
      highNetWorth: 6500,
      ultraHighNetWorth: 2000,
      billionaires: 25,
      percentageOfWealthy: 22.5
    },
    ageDistribution: {
      under18: 10,
      age18to35: 25,
      age36to50: 35,
      age51to65: 20,
      above65: 10
    },
    historicalTrend: [
      { year: 2021, population: 29000, highNetWorthCount: 5600, averageIncome: 560000 },
      { year: 2022, population: 29500, highNetWorthCount: 5800, averageIncome: 580000 },
      { year: 2023, population: 30000, highNetWorthCount: 6000, averageIncome: 600000 },
      { year: 2024, population: 31000, highNetWorthCount: 6300, averageIncome: 620000 },
      { year: 2025, population: 32000, highNetWorthCount: 6500, averageIncome: 640000 }
    ]
  },
  'Emirates Hills': {
    location: 'Emirates Hills',
    populationStats: {
      total: 26500,
      year: 2025,
      growthRate: 1.8,
      density: 5200
    },
    nationalities: {
      'Emirati': 22,
      'European': 24,
      'Indian': 16,
      'Chinese': 14,
      'North American': 12,
      'Others': 12
    },
    wealthDistribution: {
      highNetWorth: 6000,
      ultraHighNetWorth: 1800,
      billionaires: 24,
      percentageOfWealthy: 24.6
    },
    ageDistribution: {
      under18: 18,
      age18to35: 20,
      age36to50: 35,
      age51to65: 22,
      above65: 5
    },
    historicalTrend: [
      { year: 2021, population: 24000, highNetWorthCount: 5200, averageIncome: 620000 },
      { year: 2022, population: 24500, highNetWorthCount: 5300, averageIncome: 640000 },
      { year: 2023, population: 25000, highNetWorthCount: 5500, averageIncome: 680000 },
      { year: 2024, population: 25800, highNetWorthCount: 5800, averageIncome: 700000 },
      { year: 2025, population: 26500, highNetWorthCount: 6000, averageIncome: 720000 }
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
    transportation: [
      {
        id: 'trans-dm-001',
        type: 'Metro',
        name: 'Dubai Marina Metro Station',
        description: 'Access to the Red Line with connections to major Dubai destinations'
      },
      {
        id: 'trans-dm-002',
        type: 'Tram',
        name: 'Dubai Tram',
        description: 'Circular route connecting key areas within Dubai Marina and JBR'
      },
      {
        id: 'trans-dm-003',
        type: 'Road',
        name: 'Sheikh Zayed Road Access',
        description: 'Direct connection to Dubai\'s main highway'
      }
    ],
    urbanFacilities: [
      { type: 'Schools', count: 8 },
      { type: 'Hospitals', count: 4 },
      { type: 'Shopping Centers', count: 6 },
      { type: 'Parks', count: 10 },
      { type: 'Restaurants', count: 120 }
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
  },
  'Emirates Hills': {
    location: 'Emirates Hills',
    totalProjects: 4,
    projects: [
      {
        id: 'inf-006',
        name: 'Emirates Hills Golf Course Upgrade',
        type: 'recreation',
        startDate: '2024-03-01',
        completionDate: '2025-06-30',
        estimatedCost: 80000000,
        estimatedImpact: 4.2,
        description: 'Comprehensive upgrade to the Emirates Hills Golf Course with new amenities and landscaping.',
        status: 'in_progress',
        coordinates: { lat: 25.055, lng: 55.158 }
      },
      {
        id: 'inf-007',
        name: 'Emirates Hills Security Enhancement',
        type: 'infrastructure',
        startDate: '2024-01-15',
        completionDate: '2024-10-15',
        estimatedCost: 35000000,
        estimatedImpact: 3.1,
        description: 'Enhanced security systems and infrastructure throughout the Emirates Hills community.',
        status: 'in_progress',
        coordinates: { lat: 25.054, lng: 55.156 }
      },
      {
        id: 'inf-008',
        name: 'Emirates Hills Community Center',
        type: 'community',
        startDate: '2024-05-10',
        completionDate: '2025-09-10',
        estimatedCost: 120000000,
        estimatedImpact: 5.4,
        description: 'New state-of-the-art community center with recreational facilities, meeting spaces, and amenities.',
        status: 'planned',
        coordinates: { lat: 25.053, lng: 55.157 }
      }
    ],
    transportation: [
      {
        id: 'trans-001',
        type: 'Road',
        name: 'Emirates Hills Boulevard Extension',
        description: 'Extension of the main boulevard to improve traffic flow and access.'
      },
      {
        id: 'trans-002',
        type: 'Bus',
        name: 'Emirates Hills Transit Connection',
        description: 'New bus routes connecting Emirates Hills to major Dubai destinations.'
      }
    ],
    urbanFacilities: [
      { type: 'Schools', count: 5 },
      { type: 'Hospitals', count: 2 },
      { type: 'Shopping Centers', count: 3 },
      { type: 'Parks', count: 6 },
      { type: 'Restaurants', count: 15 }
    ],
    valueImpactAnalysis: {
      shortTerm: 3.8,
      mediumTerm: 7.2,
      longTerm: 11.5
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