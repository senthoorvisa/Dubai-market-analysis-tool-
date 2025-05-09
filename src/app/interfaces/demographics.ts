export interface DemographicData {
  location: string;
  populationStats: {
    total: number;
    year: number;
    growthRate: number;
    density: number;
  };
  wealthDistribution: {
    highNetWorth: number; // Count of high-net-worth individuals
    ultraHighNetWorth: number; // Count of ultra-high-net-worth individuals
    billionaires: number;
    percentageOfWealthy: number;
  };
  ageDistribution: {
    under18: number;
    age18to35: number;
    age36to50: number;
    age51to65: number;
    above65: number;
  };
  nationalities?: {
    [key: string]: number; // Percentage distribution by nationality
  };
  historicalTrend: {
    year: number;
    population: number;
    highNetWorthCount: number;
    averageIncome: number;
  }[];
}

export interface InfrastructureProject {
  id: string;
  name: string;
  type: 'transport' | 'commercial' | 'entertainment' | 'public' | 'residential' | 'other';
  startDate: string;
  completionDate: string;
  estimatedCost: number;
  estimatedImpact: number; // Percentage impact on property values
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface InfrastructureAnalysis {
  location: string;
  totalProjects: number;
  projects: InfrastructureProject[];
  transportation?: {
    metro: boolean;
    bus: boolean;
    tram: boolean;
    waterTaxi: boolean;
    walkScore: number;
  };
  valueImpactAnalysis: {
    shortTerm: number; // Percentage impact in 1 year
    mediumTerm: number; // Percentage impact in 3 years
    longTerm: number; // Percentage impact in 5 years
  };
}