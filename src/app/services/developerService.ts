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

// Enhanced developer service
export const developerService = {
  // Function to get developer analysis by name
  getDeveloperAnalysis: async (developerName: string): Promise<DeveloperAnalysis> => {
    try {
      // For a real implementation, we would call an external API:
      // const response = await axios.get(`https://api.dubailandregistry.gov.ae/api/v1/developers/${encodeURIComponent(developerName)}`);
      // return response.data;
      
      // For now, return static data but simulate a real API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        developer: {
          id: 'dev-001',
          name: developerName,
          founded: getDeveloperFoundedYear(developerName),
          description: `${developerName} is a leading real estate developer in Dubai.`,
          headquarters: 'Dubai, UAE',
          website: getDeveloperWebsite(developerName)
        },
        pastProjects: getMockProjects(developerName, 'completed', 5),
        currentProjects: getMockProjects(developerName, 'ongoing', 3),
        futureProjects: getMockProjects(developerName, 'future', 2),
        statistics: getMockStatistics(developerName)
      };
    } catch (error) {
      console.error('Error fetching developer analysis:', error);
      throw error;
    }
  },

  // Function to get all developers
  getAllDevelopers: async (): Promise<Developer[]> => {
    try {
      // In a real implementation, we would call an external API:
      // const response = await axios.get('https://api.dubailandregistry.gov.ae/api/v1/developers');
      // return response.data;
      
      // For now, return static data but simulate a real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return getPopularDevelopers();
    } catch (error) {
      console.error('Error fetching all developers:', error);
      throw error;
    }
  },

  // Function to get projects by developer
  getDeveloperProjects: async (developerId: string): Promise<DeveloperProject[]> => {
    try {
      // In a real implementation, we would call an external API:
      // const response = await axios.get(`https://api.dubailandregistry.gov.ae/api/v1/developers/${developerId}/projects`);
      // return response.data;
      
      // For now, return static data but simulate a real API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const developerName = getDeveloperNameById(developerId);
      return [
        ...getMockProjects(developerName, 'completed', 5),
        ...getMockProjects(developerName, 'ongoing', 3),
        ...getMockProjects(developerName, 'future', 2)
      ];
    } catch (error) {
      console.error('Error fetching developer projects:', error);
      throw error;
    }
  },

  // Function to get real-time developer data for the developer analysis page
  getRealTimeDeveloperData: async (developerName: string): Promise<any> => {
    try {
      // In a real implementation, we would call multiple APIs:
      // const developerInfo = await axios.get(`https://api.dubailandregistry.gov.ae/api/v1/developers/${encodeURIComponent(developerName)}`);
      // const projects = await axios.get(`https://api.dubailandregistry.gov.ae/api/v1/developers/${developerInfo.data.id}/projects`);
      // const marketData = await axios.get(`https://api.dubailandregistry.gov.ae/api/v1/market/developer/${developerInfo.data.id}`);
      
      // For now, return static data but simulate a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return getDeveloperData(developerName);
    } catch (error) {
      console.error('Error fetching real-time developer data:', error);
      throw error;
    }
  }
};

// Helper functions to get static data
const getDeveloperFoundedYear = (developerName: string): number => {
  const foundedYears: Record<string, number> = {
    'Emaar Properties': 1997,
    'Damac Properties': 2002,
    'Nakheel': 2000,
    'Dubai Properties': 2004,
    'Meraas': 2007,
    'Sobha Realty': 1976,
    'Azizi Developments': 2007,
    'Deyaar Development': 2002,
    'Omniyat': 2005,
    'Danube Properties': 2014
  };
  
  return foundedYears[developerName] || 2000;
};

const getDeveloperWebsite = (developerName: string): string => {
  const websites: Record<string, string> = {
    'Emaar Properties': 'https://www.emaar.com',
    'Damac Properties': 'https://www.damacproperties.com',
    'Nakheel': 'https://www.nakheel.com',
    'Dubai Properties': 'https://www.dubaiproperties.ae',
    'Meraas': 'https://www.meraas.com',
    'Sobha Realty': 'https://www.sobharealty.com',
    'Azizi Developments': 'https://www.azizidevelopments.com',
    'Deyaar Development': 'https://www.deyaar.com',
    'Omniyat': 'https://www.omniyat.com',
    'Danube Properties': 'https://www.danubeproperties.ae'
  };
  
  return websites[developerName] || `https://www.${developerName.toLowerCase().replace(/\s+/g, '')}.com`;
};

const getDeveloperNameById = (developerId: string): string => {
  const idToName: Record<string, string> = {
    'dev-001': 'Dubai Properties',
    'dev-002': 'Emaar Properties',
    'dev-003': 'Nakheel',
    'dev-004': 'Damac Properties'
  };
  
  return idToName[developerId] || 'Emaar Properties';
};

const getMockProjects = (developerName: string, status: 'completed' | 'ongoing' | 'future', count: number): DeveloperProject[] => {
  const projects: DeveloperProject[] = [];
  
  const projectTypes = ['Residential', 'Commercial', 'Mixed-Use', 'Villa', 'Apartment'];
  const locations = ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Palm Jumeirah', 'Jumeirah Village Circle', 'Dubai Hills Estate'];
  
  for (let i = 1; i <= count; i++) {
    const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Generate completion date based on status
    let completionDate = '';
    const currentYear = new Date().getFullYear();
    
    if (status === 'completed') {
      // Completed projects are in the past
      completionDate = `${currentYear - Math.floor(Math.random() * 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`;
    } else if (status === 'ongoing') {
      // Ongoing projects are in the near future
      completionDate = `${currentYear + Math.floor(Math.random() * 2) + 1}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`;
    } else {
      // Future projects are further in the future
      completionDate = `${currentYear + Math.floor(Math.random() * 5) + 3}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`;
    }
    
    projects.push({
      id: `${developerName.toLowerCase().replace(/\s+/g, '-')}-proj-${i}-${status}`,
      name: `${developerName} ${location} ${projectType} ${i}`,
      type: projectType,
      location: location,
      completionDate: completionDate,
      status: status,
      totalUnits: Math.floor(Math.random() * 500) + 100,
      soldUnits: status === 'completed' ? Math.floor(Math.random() * 500) + 100 : undefined,
      averagePrice: Math.floor(Math.random() * 5000000) + 1000000,
      description: `A luxury ${projectType.toLowerCase()} project by ${developerName} located in ${location}`,
      images: []
    });
  }
  
  return projects;
};

const getMockStatistics = (developerName: string): DeveloperAnalysis['statistics'] => {
  return {
    totalProjects: Math.floor(Math.random() * 50) + 20,
    completedProjects: Math.floor(Math.random() * 20) + 5,
    ongoingProjects: Math.floor(Math.random() * 10) + 3,
    futureProjects: Math.floor(Math.random() * 5) + 2,
    averageProjectValue: Math.floor(Math.random() * 1000000000) + 500000000,
    averagePriceGrowth: Math.floor(Math.random() * 5) + 5,
    averageTimeToCompletion: Math.floor(Math.random() * 2) + 2
  };
};

const getPopularDevelopers = (): Developer[] => {
  return [
    {
      id: 'dev-002',
      name: 'Emaar Properties',
      founded: 1997,
      description: 'Emaar Properties is one of the largest real estate developers in the UAE.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.emaar.com'
    },
    {
      id: 'dev-003',
      name: 'Nakheel',
      founded: 2000,
      description: 'Nakheel is a leading developer known for iconic projects like Palm Jumeirah.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.nakheel.com'
    },
    {
      id: 'dev-004',
      name: 'Damac Properties',
      founded: 2002,
      description: 'Damac Properties is a luxury real estate developer in Dubai.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.damacproperties.com'
    },
    {
      id: 'dev-001',
      name: 'Dubai Properties',
      founded: 2004,
      description: 'Dubai Properties is a leading developer of iconic residential, commercial, and mixed-use developments across Dubai.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.dubaiproperties.ae'
    },
    {
      id: 'dev-005',
      name: 'Meraas',
      founded: 2007,
      description: 'Meraas is a Dubai-based conglomerate with operations and assets across multiple sectors.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.meraas.com'
    },
    {
      id: 'dev-006',
      name: 'Sobha Realty',
      founded: 1976,
      description: 'Sobha Realty is an international luxury developer committed to redefining the art of living.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.sobharealty.com'
    },
    {
      id: 'dev-007',
      name: 'Azizi Developments',
      founded: 2007,
      description: 'Azizi Developments is one of the leading private developers in Dubai.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.azizidevelopments.com'
    },
    {
      id: 'dev-008',
      name: 'Deyaar Development',
      founded: 2002,
      description: 'Deyaar Development is a leading real estate developer and real estate services company.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.deyaar.com'
    },
    {
      id: 'dev-009',
      name: 'Omniyat',
      founded: 2005,
      description: 'Omniyat creates living canvas of luxury, exclusivity and high-design.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.omniyat.com'
    },
    {
      id: 'dev-010',
      name: 'Danube Properties',
      founded: 2014,
      description: 'Danube Properties is the fastest growing private real estate developer in Dubai.',
      headquarters: 'Dubai, UAE',
      website: 'https://www.danubeproperties.ae'
    }
  ];
};

const getDeveloperData = (developerName: string): any => {
  // This is the comprehensive data for the developer analysis page
  const developerData: Record<string, any> = {
    "Emaar Properties": {
      id: 'emaar001',
      name: 'Emaar Properties',
      foundedYear: 1997,
      website: 'https://www.emaar.com',
      contact: {
        phone: '+971 4 366 1688',
        email: 'customercare@emaar.ae'
      },
      headquarters: 'Dubai, UAE',
      description: 'Emaar Properties is one of the world\'s most valuable and admired real estate development companies. With proven competencies in properties, shopping malls & retail and hospitality & leisure, Emaar shapes new lifestyles with a focus on design excellence, build quality and timely delivery.',
      revenueBreakdown: [
        { year: 1997, residential: 2, commercial: 1, mixedUse: 0 },
        { year: 2000, residential: 5, commercial: 3, mixedUse: 1 },
        { year: 2005, residential: 12, commercial: 8, mixedUse: 4 },
        { year: 2010, residential: 18, commercial: 12, mixedUse: 7 },
        { year: 2015, residential: 25, commercial: 16, mixedUse: 10 },
        { year: 2020, residential: 32, commercial: 21, mixedUse: 15 },
        { year: 2021, residential: 38, commercial: 19, mixedUse: 17 },
        { year: 2022, residential: 45, commercial: 23, mixedUse: 20 },
        { year: 2023, residential: 52, commercial: 28, mixedUse: 24 }
      ],
      topClients: [
        { name: "Sheikh Mohammed bin Rashid", occupation: "Ruler of Dubai", revenue: 1200000000 },
        { name: "Abdullah Al Ghurair", occupation: "Banking & Real Estate", revenue: 850000000 },
        { name: "Hussain Sajwani", occupation: "DAMAC Owner", revenue: 720000000 },
        { name: "Khalaf Al Habtoor", occupation: "Al Habtoor Group", revenue: 650000000 },
        { name: "Majid Al Futtaim", occupation: "Retail Magnate", revenue: 580000000 }
      ],
      totalProjects: 87,
      totalValue: 250000000000,
      avgROI: 9.7,
      clientSatisfaction: 4.8,
      topProperties: [
        { name: "Burj Khalifa", type: "Mixed-Use", location: "Downtown Dubai", value: 15000000000, completionYear: 2010, units: 900 },
        { name: "Dubai Creek Tower", type: "Mixed-Use", location: "Dubai Creek Harbour", value: 8000000000, completionYear: 2022, units: 500 },
        { name: "Dubai Hills Estate", type: "Residential", location: "Dubai Hills", value: 7500000000, completionYear: 2018, units: 2000 },
        { name: "Downtown Dubai", type: "Mixed-Use", location: "Downtown", value: 12000000000, completionYear: 2008, units: 4000 },
        { name: "Dubai Marina", type: "Residential", location: "Dubai Marina", value: 9000000000, completionYear: 2003, units: 6000 },
        { name: "Arabian Ranches", type: "Residential", location: "Dubailand", value: 6000000000, completionYear: 2004, units: 4000 },
        { name: "The Greens", type: "Residential", location: "Emirates Hills", value: 4000000000, completionYear: 2002, units: 3000 },
        { name: "Dubai Creek Harbour", type: "Mixed-Use", location: "Ras Al Khor", value: 11000000000, completionYear: 2019, units: 5000 },
        { name: "The Springs", type: "Residential", location: "Emirates Hills", value: 5000000000, completionYear: 2002, units: 4000 },
        { name: "The Meadows", type: "Residential", location: "Emirates Hills", value: 5500000000, completionYear: 2002, units: 1800 }
      ]
    },
    "Damac Properties": {
      id: 'damac001',
      name: 'Damac Properties',
      foundedYear: 2002,
      website: 'https://www.damacproperties.com',
      contact: {
        phone: '+971 4 301 9999',
        email: 'info@damacgroup.com'
      },
      headquarters: 'Dubai, UAE',
      description: 'DAMAC Properties has been at the forefront of the Middle East\'s luxury real estate market since 2002, delivering award-winning residential, commercial and leisure properties across the region, including the UAE, Saudi Arabia, Qatar, Jordan, Lebanon, and the United Kingdom.',
      revenueBreakdown: [
        { year: 2002, residential: 3, commercial: 1, mixedUse: 0 },
        { year: 2005, residential: 8, commercial: 4, mixedUse: 2 },
        { year: 2010, residential: 15, commercial: 9, mixedUse: 5 },
        { year: 2015, residential: 20, commercial: 14, mixedUse: 9 },
        { year: 2020, residential: 25, commercial: 18, mixedUse: 12 },
        { year: 2021, residential: 30, commercial: 15, mixedUse: 14 },
        { year: 2022, residential: 34, commercial: 19, mixedUse: 16 },
        { year: 2023, residential: 40, commercial: 22, mixedUse: 18 }
      ],
      topClients: [
        { name: "Mohammed Al Abbar", occupation: "Emaar Chairman", revenue: 950000000 },
        { name: "Ravi Pillai", occupation: "RP Group", revenue: 680000000 },
        { name: "Yusuff Ali M.A.", occupation: "LuLu Group", revenue: 520000000 },
        { name: "B.R. Shetty", occupation: "NMC Healthcare", revenue: 480000000 },
        { name: "Sunny Varkey", occupation: "GEMS Education", revenue: 410000000 }
      ],
      totalProjects: 65,
      totalValue: 180000000000,
      avgROI: 8.5,
      clientSatisfaction: 4.2,
      topProperties: [
        { name: "DAMAC Hills", type: "Mixed-Use", location: "Dubailand", value: 7000000000, completionYear: 2013, units: 4000 },
        { name: "DAMAC Towers by Paramount", type: "Residential", location: "Business Bay", value: 5000000000, completionYear: 2016, units: 1800 },
        { name: "AYKON City", type: "Mixed-Use", location: "Sheikh Zayed Road", value: 6500000000, completionYear: 2021, units: 2200 },
        { name: "DAMAC Heights", type: "Residential", location: "Dubai Marina", value: 4200000000, completionYear: 2018, units: 600 },
        { name: "AKOYA Oxygen", type: "Residential", location: "Dubailand", value: 5800000000, completionYear: 2018, units: 5000 },
        { name: "DAMAC Residenze", type: "Residential", location: "Dubai Marina", value: 3500000000, completionYear: 2017, units: 200 },
        { name: "The Trump Estates", type: "Residential", location: "DAMAC Hills", value: 4000000000, completionYear: 2019, units: 100 },
        { name: "AYKON London One", type: "Residential", location: "London, UK", value: 6000000000, completionYear: 2020, units: 450 },
        { name: "DAMAC Maison", type: "Hospitality", location: "Business Bay", value: 3000000000, completionYear: 2013, units: 500 },
        { name: "DAMAC Hills 2", type: "Residential", location: "Dubailand", value: 5500000000, completionYear: 2021, units: 4000 }
      ]
    },
    "Nakheel": {
      id: 'nakheel001',
      name: 'Nakheel',
      foundedYear: 2000,
      website: 'https://www.nakheel.com',
      contact: {
        phone: '+971 4 390 3333',
        email: 'info@nakheel.com'
      },
      headquarters: 'Dubai, UAE',
      description: 'Nakheel is a world-leading master developer whose innovative, landmark projects form an iconic portfolio of master communities and residential, retail, hospitality and leisure developments that are pivotal to realizing Dubai\'s vision.',
      revenueBreakdown: [
        { year: 2000, residential: 2, commercial: 1, mixedUse: 0 },
        { year: 2005, residential: 10, commercial: 5, mixedUse: 2 },
        { year: 2010, residential: 18, commercial: 9, mixedUse: 6 },
        { year: 2015, residential: 23, commercial: 12, mixedUse: 8 },
        { year: 2020, residential: 28, commercial: 15, mixedUse: 12 },
        { year: 2021, residential: 31, commercial: 16, mixedUse: 13 },
        { year: 2022, residential: 37, commercial: 18, mixedUse: 15 },
        { year: 2023, residential: 42, commercial: 20, mixedUse: 18 }
      ],
      topClients: [
        { name: "Sultan Ahmed bin Sulayem", occupation: "DP World", revenue: 880000000 },
        { name: "Abdul Aziz Al Ghurair", occupation: "Mashreq Bank", revenue: 740000000 },
        { name: "Saif Al Ghurair", occupation: "Al Ghurair Group", revenue: 610000000 },
        { name: "Micky Jagtiani", occupation: "Landmark Group", revenue: 550000000 },
        { name: "Raghuvinder Kataria", occupation: "Investor", revenue: 490000000 }
      ],
      totalProjects: 55,
      totalValue: 210000000000,
      avgROI: 8.9,
      clientSatisfaction: 4.5,
      topProperties: [
        { name: "Palm Jumeirah", type: "Mixed-Use", location: "Palm Jumeirah", value: 15000000000, completionYear: 2006, units: 4000 },
        { name: "The World Islands", type: "Mixed-Use", location: "Offshore Dubai", value: 12000000000, completionYear: 2008, units: 300 },
        { name: "Deira Islands", type: "Mixed-Use", location: "Deira", value: 7500000000, completionYear: 2020, units: 3000 },
        { name: "Palm Jebel Ali", type: "Mixed-Use", location: "Jebel Ali", value: 10000000000, completionYear: 2023, units: 3500 },
        { name: "Jumeirah Islands", type: "Residential", location: "Jumeirah", value: 5000000000, completionYear: 2006, units: 736 },
        { name: "The Gardens", type: "Residential", location: "Jebel Ali", value: 2000000000, completionYear: 2003, units: 2500 },
        { name: "Discovery Gardens", type: "Residential", location: "Jebel Ali", value: 4000000000, completionYear: 2008, units: 26000 },
        { name: "Al Furjan", type: "Residential", location: "Furjan", value: 3500000000, completionYear: 2010, units: 4000 },
        { name: "Dragon City", type: "Commercial", location: "International City", value: 5000000000, completionYear: 2007, units: 5000 },
        { name: "Palm Tower", type: "Mixed-Use", location: "Palm Jumeirah", value: 2000000000, completionYear: 2021, units: 432 }
      ]
    },
    "Deyaar Development": {
      id: 'deyaar001',
      name: 'Deyaar Development',
      foundedYear: 2002,
      website: 'https://www.deyaar.com',
      contact: {
        phone: '+971 4 819 8888',
        email: 'info@deyaar.com'
      },
      headquarters: 'Dubai, UAE',
      description: 'Deyaar Development PJSC is a leading real estate developer and real estate services company, headquartered in Dubai. Since its establishment in 2002, Deyaar has emerged as one of the leading developers in the region with an extensive portfolio of quality projects.',
      revenueBreakdown: [
        { year: 2002, residential: 1, commercial: 2, mixedUse: 0 },
        { year: 2005, residential: 4, commercial: 6, mixedUse: 1 },
        { year: 2010, residential: 8, commercial: 11, mixedUse: 3 },
        { year: 2015, residential: 12, commercial: 14, mixedUse: 5 },
        { year: 2020, residential: 16, commercial: 18, mixedUse: 8 },
        { year: 2021, residential: 18, commercial: 19, mixedUse: 9 },
        { year: 2022, residential: 21, commercial: 20, mixedUse: 11 },
        { year: 2023, residential: 24, commercial: 23, mixedUse: 13 }
      ],
      topClients: [
        { name: "Ahmed Bin Saeed Al Maktoum", occupation: "Emirates Group", revenue: 620000000 },
        { name: "Mohammed Ibrahim Al Shaibani", occupation: "Investment Corp of Dubai", revenue: 580000000 },
        { name: "Abdulla Al Futtaim", occupation: "Al-Futtaim Group", revenue: 490000000 },
        { name: "P.N.C. Menon", occupation: "Sobha Group", revenue: 420000000 },
        { name: "Rizwan Sajan", occupation: "Danube Group", revenue: 350000000 }
      ],
      totalProjects: 42,
      totalValue: 85000000000,
      avgROI: 7.8,
      clientSatisfaction: 4.2,
      topProperties: [
        { name: "Midtown", type: "Mixed-Use", location: "International City", value: 3500000000, completionYear: 2021, units: 2000 },
        { name: "Atria", type: "Residential", location: "Business Bay", value: 1800000000, completionYear: 2018, units: 350 },
        { name: "Montrose", type: "Residential", location: "Dubai Science Park", value: 2200000000, completionYear: 2019, units: 450 },
        { name: "Millennium Executive Apartments", type: "Hospitality", location: "Al Barsha", value: 1500000000, completionYear: 2017, units: 300 },
        { name: "Deyaar Park", type: "Residential", location: "Dubai Silicon Oasis", value: 2000000000, completionYear: 2010, units: 1200 },
        { name: "The Citadel", type: "Commercial", location: "Business Bay", value: 1700000000, completionYear: 2013, units: 180 },
        { name: "Mayfair Tower", type: "Residential", location: "Business Bay", value: 1200000000, completionYear: 2012, units: 260 },
        { name: "Burlington Tower", type: "Commercial", location: "Business Bay", value: 1300000000, completionYear: 2011, units: 150 },
        { name: "Oakwood Residency", type: "Residential", location: "International City", value: 900000000, completionYear: 2009, units: 800 },
        { name: "Ruby Residence", type: "Residential", location: "Dubai Silicon Oasis", value: 1100000000, completionYear: 2011, units: 500 }
      ]
    },
    "Dubai Properties": {
      id: 'dubaiproperties001',
      name: 'Dubai Properties',
      foundedYear: 2004,
      website: 'https://www.dubaiproperties.ae',
      contact: {
        phone: '+971 4 873 3333',
        email: 'customercare@dp.ae'
      },
      headquarters: 'Dubai, UAE',
      description: 'Dubai Properties is a leading master developer known for its iconic destinations and communities across Dubai. The company creates inspiring lifestyle experiences through the development of destinations that feature well-designed residential communities.',
      revenueBreakdown: [
        { year: 2004, residential: 2, commercial: 1, mixedUse: 0 },
        { year: 2005, residential: 3, commercial: 2, mixedUse: 1 },
        { year: 2010, residential: 9, commercial: 6, mixedUse: 3 },
        { year: 2015, residential: 15, commercial: 10, mixedUse: 6 },
        { year: 2020, residential: 20, commercial: 14, mixedUse: 9 },
        { year: 2021, residential: 22, commercial: 15, mixedUse: 10 },
        { year: 2022, residential: 26, commercial: 17, mixedUse: 12 },
        { year: 2023, residential: 30, commercial: 20, mixedUse: 15 }
      ],
      totalProjects: 46,
      totalValue: 105000000000,
      avgROI: 8.3,
      clientSatisfaction: 4.4,
      topProperties: [
        { name: "Jumeirah Beach Residence", type: "Mixed-Use", location: "Dubai Marina", value: 8000000000, completionYear: 2008, units: 6000 },
        { name: "Business Bay", type: "Mixed-Use", location: "Business Bay", value: 6500000000, completionYear: 2010, units: 4000 },
        { name: "Culture Village", type: "Mixed-Use", location: "Al Jaddaf", value: 5000000000, completionYear: 2017, units: 3000 },
        { name: "Dubailand", type: "Mixed-Use", location: "Dubailand", value: 7000000000, completionYear: 2015, units: 5000 },
        { name: "The Villa", type: "Residential", location: "Dubailand", value: 3500000000, completionYear: 2013, units: 1200 }
      ]
    },
    "Meraas": {
      id: 'meraas001',
      name: 'Meraas',
      foundedYear: 2007,
      website: 'https://www.meraas.com',
      contact: {
        phone: '+971 4 317 3999',
        email: 'info@meraas.com'
      },
      headquarters: 'Dubai, UAE',
      description: 'Meraas is dedicated to making Dubai and the UAE better for people to live, work and play in. We design for a diverse mix of people to create a fusion of residential, commercial, retail, hospitality and entertainment destinations.',
      revenueBreakdown: [
        { year: 2007, residential: 1, commercial: 1, mixedUse: 0 },
        { year: 2010, residential: 3, commercial: 4, mixedUse: 1 },
        { year: 2015, residential: 8, commercial: 10, mixedUse: 5 },
        { year: 2020, residential: 15, commercial: 17, mixedUse: 9 },
        { year: 2021, residential: 17, commercial: 18, mixedUse: 10 },
        { year: 2022, residential: 19, commercial: 20, mixedUse: 12 },
        { year: 2023, residential: 22, commercial: 23, mixedUse: 15 }
      ],
      totalProjects: 38,
      totalValue: 95000000000,
      avgROI: 8.0,
      clientSatisfaction: 4.6,
      topProperties: [
        { name: "Bluewaters Island", type: "Mixed-Use", location: "Jumeirah Beach", value: 6000000000, completionYear: 2018, units: 700 },
        { name: "City Walk", type: "Mixed-Use", location: "Al Safa", value: 4500000000, completionYear: 2016, units: 600 },
        { name: "La Mer", type: "Mixed-Use", location: "Jumeirah", value: 5000000000, completionYear: 2017, units: 300 },
        { name: "The Beach", type: "Mixed-Use", location: "JBR", value: 3000000000, completionYear: 2014, units: 200 },
        { name: "Port de La Mer", type: "Residential", location: "Jumeirah", value: 4000000000, completionYear: 2020, units: 1200 }
      ]
    },
    "Sobha Realty": {
      id: 'sobha001',
      name: 'Sobha Realty',
      foundedYear: 1976,
      website: 'https://www.sobharealty.com',
      contact: {
        phone: '+971 4 403 7777',
        email: 'info@sobha.com'
      },
      headquarters: 'Dubai, UAE',
      description: 'Sobha Realty is an international luxury developer committed to redefining the art of living through sustainable communities. We have expanded our footprint to the Middle East with developments in Dubai.',
      revenueBreakdown: [
        { year: 2005, residential: 2, commercial: 1, mixedUse: 0 },
        { year: 2010, residential: 5, commercial: 3, mixedUse: 1 },
        { year: 2015, residential: 9, commercial: 5, mixedUse: 3 },
        { year: 2020, residential: 14, commercial: 8, mixedUse: 5 },
        { year: 2021, residential: 16, commercial: 9, mixedUse: 6 },
        { year: 2022, residential: 19, commercial: 10, mixedUse: 7 },
        { year: 2023, residential: 22, commercial: 12, mixedUse: 9 }
      ],
      totalProjects: 30,
      totalValue: 75000000000,
      avgROI: 9.2,
      clientSatisfaction: 4.7,
      topProperties: [
        { name: "Sobha Hartland", type: "Mixed-Use", location: "Mohammed Bin Rashid City", value: 4000000000, completionYear: 2019, units: 5000 },
        { name: "Sobha Creek Vistas", type: "Residential", location: "Sobha Hartland", value: 2500000000, completionYear: 2021, units: 900 },
        { name: "District One", type: "Residential", location: "Mohammed Bin Rashid City", value: 3500000000, completionYear: 2018, units: 1500 },
        { name: "Sobha Sapphire", type: "Residential", location: "Business Bay", value: 1500000000, completionYear: 2015, units: 300 },
        { name: "Sobha Sea Haven", type: "Residential", location: "Palm Jumeirah", value: 2800000000, completionYear: 2022, units: 200 }
      ]
    },
    "Azizi Developments": {
      id: 'azizi001',
      name: 'Azizi Developments',
      foundedYear: 2007,
      website: 'https://www.azizidevelopments.com',
      contact: {
        phone: '+971 4 596 3444',
        email: 'customerservice@azizidevelopments.com'
      },
      headquarters: 'Dubai, UAE',
      description: 'Azizi Developments is a leading private developer in Dubai that has established itself as a key player in the city\'s real estate market through the construction of landmark residential and commercial projects.',
      revenueBreakdown: [
        { year: 2007, residential: 1, commercial: 0, mixedUse: 0 },
        { year: 2010, residential: 4, commercial: 1, mixedUse: 1 },
        { year: 2015, residential: 10, commercial: 4, mixedUse: 3 },
        { year: 2020, residential: 18, commercial: 7, mixedUse: 5 },
        { year: 2021, residential: 21, commercial: 8, mixedUse: 6 },
        { year: 2022, residential: 25, commercial: 10, mixedUse: 8 },
        { year: 2023, residential: 30, commercial: 12, mixedUse: 10 }
      ],
      totalProjects: 35,
      totalValue: 70000000000,
      avgROI: 8.6,
      clientSatisfaction: 4.3,
      topProperties: [
        { name: "Azizi Riviera", type: "Residential", location: "Meydan", value: 5000000000, completionYear: 2021, units: 16000 },
        { name: "Azizi Victoria", type: "Mixed-Use", location: "Mohammed Bin Rashid City", value: 3500000000, completionYear: 2022, units: 8000 },
        { name: "Azizi Mina", type: "Residential", location: "Palm Jumeirah", value: 1200000000, completionYear: 2018, units: 178 },
        { name: "Azizi Royal Bay", type: "Residential", location: "Palm Jumeirah", value: 1500000000, completionYear: 2017, units: 90 },
        { name: "Azizi Star", type: "Residential", location: "Al Furjan", value: 900000000, completionYear: 2019, units: 458 }
      ]
    },
    "Omniyat": {
      id: 'omniyat001',
      name: 'Omniyat',
      foundedYear: 2005,
      website: 'https://www.omniyat.com',
      contact: {
        phone: '+971 4 511 5000',
        email: 'info@omniyat.com'
      },
      headquarters: 'Dubai, UAE',
      description: 'Omniyat creates living canvases of luxury, exclusivity and high-design for the discerning few. Each Omniyat development is unique and designed to create bespoke experiences that nurture the soul and elevate the spirit.',
      revenueBreakdown: [
        { year: 2005, residential: 1, commercial: 1, mixedUse: 0 },
        { year: 2010, residential: 3, commercial: 2, mixedUse: 1 },
        { year: 2015, residential: 5, commercial: 4, mixedUse: 2 },
        { year: 2020, residential: 8, commercial: 6, mixedUse: 3 },
        { year: 2021, residential: 9, commercial: 7, mixedUse: 3 },
        { year: 2022, residential: 10, commercial: 8, mixedUse: 4 },
        { year: 2023, residential: 12, commercial: 9, mixedUse: 5 }
      ],
      totalProjects: 18,
      totalValue: 45000000000,
      avgROI: 9.5,
      clientSatisfaction: 4.9,
      topProperties: [
        { name: "One Palm", type: "Residential", location: "Palm Jumeirah", value: 3000000000, completionYear: 2019, units: 90 },
        { name: "The Opus", type: "Mixed-Use", location: "Business Bay", value: 2500000000, completionYear: 2020, units: 200 },
        { name: "The Sterling", type: "Residential", location: "Business Bay", value: 1800000000, completionYear: 2017, units: 150 },
        { name: "Langham Place", type: "Hospitality", location: "Downtown Dubai", value: 2200000000, completionYear: 2021, units: 160 },
        { name: "The Pad", type: "Residential", location: "Business Bay", value: 1500000000, completionYear: 2018, units: 230 }
      ]
    },
    "Danube Properties": {
      id: 'danube001',
      name: 'Danube Properties',
      foundedYear: 2014,
      website: 'https://www.danubeproperties.ae',
      contact: {
        phone: '+971 4 304 1111',
        email: 'contact@danubeproperties.ae'
      },
      headquarters: 'Dubai, UAE',
      description: 'Danube Properties is the fastest growing private real estate developer in Dubai with a focus on affordable luxury. The company has delivered numerous residential projects and has become known for its 1% payment plan.',
      revenueBreakdown: [
        { year: 2014, residential: 1, commercial: 0, mixedUse: 0 },
        { year: 2015, residential: 2, commercial: 1, mixedUse: 0 },
        { year: 2016, residential: 3, commercial: 1, mixedUse: 0 },
        { year: 2017, residential: 5, commercial: 2, mixedUse: 1 },
        { year: 2018, residential: 7, commercial: 3, mixedUse: 1 },
        { year: 2019, residential: 9, commercial: 4, mixedUse: 2 },
        { year: 2020, residential: 11, commercial: 5, mixedUse: 2 },
        { year: 2021, residential: 13, commercial: 6, mixedUse: 3 },
        { year: 2022, residential: 15, commercial: 7, mixedUse: 3 },
        { year: 2023, residential: 18, commercial: 8, mixedUse: 4 }
      ],
      totalProjects: 22,
      totalValue: 35000000000,
      avgROI: 7.5,
      clientSatisfaction: 4.1,
      topProperties: [
        { name: "Dreamz", type: "Residential", location: "Al Furjan", value: 1000000000, completionYear: 2017, units: 700 },
        { name: "Glamz", type: "Residential", location: "Al Furjan", value: 1200000000, completionYear: 2018, units: 500 },
        { name: "Miraclz", type: "Residential", location: "Arjan", value: 1500000000, completionYear: 2019, units: 600 },
        { name: "Resortz", type: "Residential", location: "Arjan", value: 1300000000, completionYear: 2020, units: 450 },
        { name: "Bayz", type: "Residential", location: "Business Bay", value: 1800000000, completionYear: 2021, units: 350 }
      ]
    }
  };

  return developerData[developerName] || developerData["Emaar Properties"];
}; 