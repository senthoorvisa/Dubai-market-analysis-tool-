export interface Developer {
  id: string;
  name: string;
  founded: number;
  description: string;
  headquarters: string;
  website?: string;
  logoUrl?: string;
}

export interface DeveloperProject {
  id: string;
  name: string;
  type: string;
  location: string;
  completionDate: string;
  status: 'completed' | 'ongoing' | 'future';
  totalUnits: number;
  soldUnits?: number;
  averagePrice: number;
  description: string;
  images?: string[];
}

export interface DeveloperAnalysis {
  developer: Developer;
  pastProjects: DeveloperProject[];
  currentProjects: DeveloperProject[];
  futureProjects: DeveloperProject[];
  statistics: {
    totalProjects: number;
    completedProjects: number;
    ongoingProjects: number;
    futureProjects: number;
    averageProjectValue: number;
    averagePriceGrowth: number;
    averageTimeToCompletion: number;
  };
} 