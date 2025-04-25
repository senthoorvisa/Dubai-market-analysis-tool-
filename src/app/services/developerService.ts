import axios from 'axios';
import { Developer, DeveloperProject, DeveloperAnalysis } from '../interfaces/developer';

// Mock data for developer analysis
const mockDeveloperAnalysis: DeveloperAnalysis = {
  developer: {
    id: 'dev-001',
    name: 'Dubai Properties',
    founded: 2004,
    description: 'Dubai Properties is a leading developer of iconic residential, commercial, and mixed-use developments across Dubai.',
    headquarters: 'Dubai, UAE',
    website: 'https://www.dubaiproperties.ae',
    logoUrl: '/images/dubai-properties-logo.png'
  },
  pastProjects: [
    {
      id: 'proj-001',
      name: 'JBR - Jumeirah Beach Residence',
      type: 'Residential',
      location: 'Dubai Marina',
      completionDate: '2008-05-20',
      status: 'completed',
      totalUnits: 6000,
      soldUnits: 5950,
      averagePrice: 1500000,
      description: 'Jumeirah Beach Residence is a 1.7 km long waterfront community located against the Persian Gulf in Dubai Marina.',
      images: ['/images/jbr1.jpg', '/images/jbr2.jpg']
    },
    {
      id: 'proj-002',
      name: 'Business Bay Executive Towers',
      type: 'Mixed-Use',
      location: 'Business Bay',
      completionDate: '2010-11-15',
      status: 'completed',
      totalUnits: 2400,
      soldUnits: 2380,
      averagePrice: 1200000,
      description: 'A cluster of high-rise buildings in Business Bay, Dubai, consisting of residential and commercial spaces.',
      images: ['/images/business-bay1.jpg', '/images/business-bay2.jpg']
    },
    {
      id: 'proj-003',
      name: 'The Villa',
      type: 'Villa',
      location: 'Dubailand',
      completionDate: '2013-03-10',
      status: 'completed',
      totalUnits: 1200,
      soldUnits: 1180,
      averagePrice: 3500000,
      description: 'A gated community offering Spanish-style villas in a serene environment.',
      images: ['/images/the-villa1.jpg', '/images/the-villa2.jpg']
    }
  ],
  currentProjects: [
    {
      id: 'proj-004',
      name: 'Marasi Business Bay',
      type: 'Mixed-Use',
      location: 'Business Bay',
      completionDate: '2025-06-30',
      status: 'ongoing',
      totalUnits: 1500,
      soldUnits: 800,
      averagePrice: 2000000,
      description: 'A waterfront destination featuring floating homes, restaurants, retail outlets, and a marina.',
      images: ['/images/marasi1.jpg', '/images/marasi2.jpg']
    },
    {
      id: 'proj-005',
      name: 'Villanova',
      type: 'Villa',
      location: 'Dubailand',
      completionDate: '2024-09-15',
      status: 'ongoing',
      totalUnits: 800,
      soldUnits: 500,
      averagePrice: 2800000,
      description: 'A Mediterranean-inspired community offering townhouses and villas.',
      images: ['/images/villanova1.jpg', '/images/villanova2.jpg']
    }
  ],
  futureProjects: [
    {
      id: 'proj-006',
      name: 'Dubai Wharf Tower',
      type: 'Residential',
      location: 'Creek Harbour',
      completionDate: '2027-12-01',
      status: 'future',
      totalUnits: 1200,
      averagePrice: 2500000,
      description: 'A luxury residential tower offering panoramic views of the Dubai Creek.',
      images: ['/images/wharf-tower1.jpg', '/images/wharf-tower2.jpg']
    },
    {
      id: 'proj-007',
      name: 'Smart City Dubai',
      type: 'Mixed-Use',
      location: 'Dubai South',
      completionDate: '2028-05-30',
      status: 'future',
      totalUnits: 3000,
      averagePrice: 1800000,
      description: 'A futuristic smart city with integrated technology and sustainable living.',
      images: ['/images/smart-city1.jpg', '/images/smart-city2.jpg']
    }
  ],
  statistics: {
    totalProjects: 12,
    completedProjects: 5,
    ongoingProjects: 2,
    futureProjects: 5,
    averageProjectValue: 2500000000,
    averagePriceGrowth: 8.5,
    averageTimeToCompletion: 3.2
  }
};

export const developerService = {
  // Function to get developer analysis by name
  getDeveloperAnalysis: async (developerName: string): Promise<DeveloperAnalysis> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return the mock developer analysis
      return mockDeveloperAnalysis;
    } catch (error) {
      console.error('Error fetching developer analysis:', error);
      throw error;
    }
  },

  // Function to get all developers
  getAllDevelopers: async (): Promise<Developer[]> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return a mock list of developers
      return [
        mockDeveloperAnalysis.developer,
        {
          id: 'dev-002',
          name: 'Emaar Properties',
          founded: 1997,
          description: 'Emaar Properties is one of the largest real estate developers in the UAE.',
          headquarters: 'Dubai, UAE',
          website: 'https://www.emaar.com',
          logoUrl: '/images/emaar-logo.png'
        },
        {
          id: 'dev-003',
          name: 'Nakheel',
          founded: 2000,
          description: 'Nakheel is a leading developer known for iconic projects like Palm Jumeirah.',
          headquarters: 'Dubai, UAE',
          website: 'https://www.nakheel.com',
          logoUrl: '/images/nakheel-logo.png'
        },
        {
          id: 'dev-004',
          name: 'Damac Properties',
          founded: 2002,
          description: 'Damac Properties is a luxury real estate developer in Dubai.',
          headquarters: 'Dubai, UAE',
          website: 'https://www.damacproperties.com',
          logoUrl: '/images/damac-logo.png'
        }
      ];
    } catch (error) {
      console.error('Error fetching all developers:', error);
      throw error;
    }
  },

  // Function to get projects by developer
  getDeveloperProjects: async (developerId: string): Promise<DeveloperProject[]> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Combine all projects from the mock data
      return [
        ...mockDeveloperAnalysis.pastProjects,
        ...mockDeveloperAnalysis.currentProjects,
        ...mockDeveloperAnalysis.futureProjects
      ];
    } catch (error) {
      console.error('Error fetching developer projects:', error);
      throw error;
    }
  }
}; 