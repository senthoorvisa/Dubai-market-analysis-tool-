import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  FaBuilding, FaChartBar, FaUsers, FaCoins, 
  FaChartLine, FaThumbsUp, FaInfoCircle,
  FaSortUp, FaSortDown, FaSort, FaStar, FaHammer, FaMapMarkerAlt
} from 'react-icons/fa';
import propertyDataService from '../services/propertyDataService';

interface DeveloperData {
  name: string;
  overview: string;
  pricePerSqFt: number;
  qualityRating: number;
  averageROI: number;
  timelineReliability: string;
  notableProjects: {
    name: string;
    description: string;
    location: string;
  }[];
  reputationScore: number;
  strengths: string[];
  weaknesses: string[];
}

interface Client {
  id: number;
  name: string;
  revenue: number;
  occupation: string;
  avatar: string;
}

interface ProjectRevenue {
  year: number;
  Residential: number;
  Commercial: number;
  'Mixed-Use': number;
}

interface DeveloperAnalysisDashboardProps {
  developerName?: string;
}

export default function DeveloperAnalysisDashboard({
  developerName = 'Emaar Properties'
}: DeveloperAnalysisDashboardProps) {
  // State for loading/error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Developer data
  const [developer, setDeveloper] = useState<DeveloperData>({
    name: developerName,
    overview: 'Loading developer information...',
    pricePerSqFt: 0,
    qualityRating: 0,
    averageROI: 0,
    timelineReliability: '',
    notableProjects: [],
    reputationScore: 0,
    strengths: [],
    weaknesses: []
  });
  
  // Project revenue data (for stacked bar chart)
  const [revenueData, setRevenueData] = useState<ProjectRevenue[]>([
    { year: 2020, Residential: 2100000000, Commercial: 1500000000, 'Mixed-Use': 500000000 },
    { year: 2021, Residential: 2400000000, Commercial: 1700000000, 'Mixed-Use': 600000000 },
    { year: 2022, Residential: 2700000000, Commercial: 1900000000, 'Mixed-Use': 800000000 },
    { year: 2023, Residential: 3100000000, Commercial: 2200000000, 'Mixed-Use': 1100000000 },
    { year: 2024, Residential: 3500000000, Commercial: 2500000000, 'Mixed-Use': 1300000000 }
  ]);
  
  // Top clients data
  const [topClients, setTopClients] = useState<Client[]>([
    { id: 1, name: 'Mohammed Al Futtaim', revenue: 3200000, occupation: 'Investor', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: 'Sarah Al Maktoum', revenue: 2700000, occupation: 'Property Fund Manager', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 3, name: 'Abdul Rahman Holdings', revenue: 2300000, occupation: 'Investment Group', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 4, name: 'Emirates Investment Authority', revenue: 1900000, occupation: 'Government Fund', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 5, name: 'Fatima Al Qassimi', revenue: 1500000, occupation: 'Private Investor', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' }
  ]);
  
  // Selected project type for filtering
  const [selectedProjectType, setSelectedProjectType] = useState('All');
  
  // Sorting state for table
  const [sortField, setSortField] = useState('revenue');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load developer analysis
  useEffect(() => {
    const loadDeveloperData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const data = await propertyDataService.getDeveloperAnalysis(developerName);
        setDeveloper(data);
      } catch (err) {
        console.error('Error loading developer data:', err);
        setError('Failed to load developer data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeveloperData();
  }, [developerName]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format large currency amounts
  const formatLargeCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B AED`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M AED`;
    } else {
      return formatCurrency(value);
    }
  };
  
  // Get filtered revenue data
  const getFilteredRevenueData = () => {
    if (selectedProjectType === 'All') {
      return revenueData;
    } else {
      return revenueData.map(item => {
        const filteredItem: any = { year: item.year };
        filteredItem[selectedProjectType] = item[selectedProjectType as keyof typeof item];
        return filteredItem;
      });
    }
  };
  
  // Get sorted clients data
  const getSortedClients = () => {
    return [...topClients].sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        const numA = Number(aValue);
        const numB = Number(bValue);
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
    });
  };
  
  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-gold-500" /> : <FaSortDown className="text-gold-500" />;
  };
  
  // Handle project type filter click
  const handleProjectTypeClick = (type: string) => {
    setSelectedProjectType(prev => prev === type ? 'All' : type);
  };
  
  // Custom tooltip for the revenue chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gold-300 shadow-lg rounded-md">
          <p className="font-semibold">{`Year: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${formatLargeCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Create developer performance data for radar chart
  const performanceData = [
    { subject: 'Quality', value: developer.qualityRating / 10 },
    { subject: 'ROI', value: developer.averageROI / 10 },
    { subject: 'Reputation', value: developer.reputationScore / 10 },
    { subject: 'Timeline', value: developer.timelineReliability === 'Excellent' ? 0.9 : developer.timelineReliability === 'Good' ? 0.7 : 0.5 },
    { subject: 'Price/Value', value: developer.pricePerSqFt > 2000 ? 0.9 : developer.pricePerSqFt > 1500 ? 0.7 : 0.5 }
  ];

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          {/* Top Section - Developer Overview */}
          <div className="luxury-card mb-6">
            <div className="luxury-card-header flex justify-between items-center">
              <h2 className="text-xl font-bold">Developer Profile</h2>
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <FaStar className="text-gold-500 mr-1" />
                  <span>{developer.reputationScore.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
            <div className="luxury-card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <p className="text-gray-700 mb-6">{developer.overview}</p>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KpiTile 
                      title="Price per Sq Ft" 
                      value={formatCurrency(developer.pricePerSqFt)}
                      icon={FaCoins} 
                    />
                    <KpiTile 
                      title="Quality Rating" 
                      value={`${developer.qualityRating}/10`}
                      icon={FaThumbsUp} 
                    />
                    <KpiTile 
                      title="Average ROI" 
                      value={`${developer.averageROI}%`}
                      icon={FaChartLine} 
                    />
                    <KpiTile 
                      title="Timeline Reliability" 
                      value={developer.timelineReliability}
                      icon={FaHammer} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-dubai-blue-900 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-6 bg-green-500 mr-2 rounded-sm"></span>
                        Strengths
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {developer.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-dubai-blue-900 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-6 bg-red-500 mr-2 rounded-sm"></span>
                        Areas for Improvement
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {developer.weaknesses.map((weakness, idx) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <h3 className="text-sm font-semibold text-dubai-blue-900 mb-3">Performance Metrics</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={performanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#c8a43c"
                          fill="#c8a43c"
                          fillOpacity={0.6}
                        />
                        <Tooltip
                          formatter={(value) => [`${(Number(value) * 10).toFixed(1)}/10`, 'Rating']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notable Projects */}
          <div className="luxury-card mb-6">
            <div className="luxury-card-header">
              <h2 className="text-xl font-bold">Notable Projects</h2>
            </div>
            <div className="luxury-card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {developer.notableProjects.map((project, idx) => (
                  <div key={idx} className="bg-dubai-blue-50 rounded-lg p-4 border border-dubai-blue-100">
                    <h3 className="font-bold text-dubai-blue-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <FaMapMarkerAlt className="mr-1 text-gold-500" /> {project.location}
                    </p>
                    <p className="text-gray-700 text-sm">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Middle Section - Project Revenue Breakdown */}
          <div className="luxury-card mb-6">
            <div className="luxury-card-header flex justify-between items-center">
              <h2 className="text-xl font-bold">Revenue Breakdown by Project Type</h2>
              
              <div className="flex items-center space-x-2 text-sm">
                <div 
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${selectedProjectType === 'Residential' || selectedProjectType === 'All' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleProjectTypeClick('Residential')}
                >
                  Residential
                </div>
                <div 
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${selectedProjectType === 'Commercial' || selectedProjectType === 'All' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleProjectTypeClick('Commercial')}
                >
                  Commercial
                </div>
                <div 
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${selectedProjectType === 'Mixed-Use' || selectedProjectType === 'All' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleProjectTypeClick('Mixed-Use')}
                >
                  Mixed-Use
                </div>
              </div>
            </div>
            
            <div className="luxury-card-body">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredRevenueData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tickFormatter={(value) => {
                        if (value >= 1000000000) {
                          return `${(value / 1000000000).toFixed(1)}B`;
                        } else if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        }
                        return value;
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    {(selectedProjectType === 'All' || selectedProjectType === 'Residential') && (
                      <Bar dataKey="Residential" stackId="a" fill="#3b82f6" />
                    )}
                    {(selectedProjectType === 'All' || selectedProjectType === 'Commercial') && (
                      <Bar dataKey="Commercial" stackId="a" fill="#10b981" />
                    )}
                    {(selectedProjectType === 'All' || selectedProjectType === 'Mixed-Use') && (
                      <Bar dataKey="Mixed-Use" stackId="a" fill="#8b5cf6" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 p-3 bg-dubai-blue-50 rounded-md border border-dubai-blue-100">
                <p className="text-sm text-dubai-blue-800 flex items-start">
                  <FaInfoCircle className="mr-2 mt-0.5 text-gold-500 flex-shrink-0" />
                  Click on the project types above to filter the chart. Revenue shown in billions/millions of AED. The data represents the developer's revenue across different property segments over recent years.
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Section - Top Clients */}
          <div className="luxury-card">
            <div className="luxury-card-header">
              <h2 className="text-xl font-bold">Top Clients</h2>
            </div>
            <div className="luxury-card-body">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 overflow-x-auto">
                  <table className="luxury-table">
                    <thead>
                      <tr>
                        <th className="w-12"></th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => toggleSort('name')}
                        >
                          <div className="flex items-center">
                            Client Name {getSortIcon('name')}
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => toggleSort('revenue')}
                        >
                          <div className="flex items-center">
                            Revenue {getSortIcon('revenue')}
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => toggleSort('occupation')}
                        >
                          <div className="flex items-center">
                            Occupation {getSortIcon('occupation')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedClients().map((client, index) => (
                        <tr 
                          key={client.id} 
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td>
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                              <img 
                                src={client.avatar} 
                                alt={client.name} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40x40?text=User';
                                }}
                              />
                            </div>
                          </td>
                          <td className="font-medium text-dubai-blue-900">{client.name}</td>
                          <td>{formatCurrency(client.revenue)}</td>
                          <td className="text-gray-600">{client.occupation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-dubai-blue-900 mb-3">Revenue Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topClients}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                          nameKey="name"
                          label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {topClients.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e3a8a' : '#c8a43c'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-dubai-blue-50 p-3 rounded-md border border-dubai-blue-100 mt-4">
                    <p className="text-sm text-dubai-blue-800">
                      Distribution shows revenue contribution from top clients. These relationships represent valuable strategic partnerships for future development projects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface KpiTileProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

function KpiTile({ title, value, icon: Icon }: KpiTileProps) {
  return (
    <div className="luxury-kpi-tile">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-lg font-bold text-dubai-blue-900">
            {value}
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-dubai-blue-50 flex items-center justify-center text-gold-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
} 