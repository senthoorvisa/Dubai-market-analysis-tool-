import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell, Scatter, ScatterChart, ZAxis
} from 'recharts';
import { 
  FaHome, FaBuilding, FaMoneyBillWave, FaChartLine, 
  FaInfoCircle, FaMapMarkerAlt, FaRuler, FaClock,
  FaSortUp, FaSortDown, FaSort
} from 'react-icons/fa';
import propertyDataService from '../services/propertyDataService';

interface Property {
  id: string;
  name: string;
  type: string;
  developerName: string;
  currentPrice: number;
  soldPrice?: number;
  size: number;
  floor?: number;
  buildingAge: number;
  location: string;
  address: string;
  amenities: string[];
  description: string;
  images?: string[];
}

interface NearbyProperty {
  id: number;
  name: string;
  currentPrice: number;
  originalPrice: number;
  change: number;
  type: string;
  lat: number;
  lng: number;
}

interface PropertyDashboardProps {
  propertyId?: string;
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  initialPrice?: number;
}

export default function PropertyDashboard({
  propertyId,
  location = 'Dubai Marina',
  propertyType = 'Apartment',
  bedrooms = 2,
  initialPrice = 1500000
}: PropertyDashboardProps) {
  // State for API key configuration
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Store the property build year
  const [buildYear, setBuildYear] = useState<number>(2010); // Default value
  
  // Property data
  const [property, setProperty] = useState<Property>({
    id: propertyId || '1',
    name: propertyId ? '' : 'Marina Heights',
    type: propertyType,
    developerName: 'Emaar Properties',
    currentPrice: 2350000,
    size: 1250,
    floor: 15,
    buildingAge: new Date().getFullYear() - buildYear,
    location: location,
    address: `${location}, Dubai, UAE`,
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Sea View'],
    description: 'Modern luxury apartment with stunning sea views and premium finishes.'
  });
  
  // Price history data
  const [priceHistory, setPriceHistory] = useState<{ year: number; price: number }[]>([]);
  
  // Nearby properties
  const [nearbyProperties, setNearbyProperties] = useState<NearbyProperty[]>([]);
  
  // Sorting state for nearby properties table
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Load property-specific data if propertyId is provided
  useEffect(() => {
    if (propertyId) {
      const loadPropertyData = async () => {
        setIsLoading(true);
        setError('');
        
        try {
          // In a real application, this would be an API call to get property data
          // For now, simulate with mock data based on propertyId
          setTimeout(() => {
            // Generate a realistic build year for this property
            const mockBuildYear = 2000 + (Number(propertyId) % 21); // Range from 2000-2020
            setBuildYear(mockBuildYear);
            
            // Mock property data
            const mockProperty = {
              id: propertyId,
              name: `Property ${propertyId}`,
              type: propertyType,
              developerName: 'Emaar Properties',
              currentPrice: initialPrice * 1.3, // Simulate current price higher than initial
              size: 1250 + (Number(propertyId) * 100),
              floor: 5 + Number(propertyId),
              buildingAge: new Date().getFullYear() - mockBuildYear,
              location: location,
              address: `${location}, Dubai, UAE`,
              amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Sea View', 'Concierge Service'],
              description: `Premium ${propertyType.toLowerCase()} with luxury finishes and amenities in the heart of ${location}.`
            };
            
            setProperty(mockProperty);
            setIsLoading(false);
            
            // After setting the property, trigger the data load for price history
            loadPropertyHistoryData(mockBuildYear);
          }, 1000);
        } catch (err) {
          console.error('Error loading property data:', err);
          setError('Failed to load property data. Please try again.');
          setIsLoading(false);
        }
      };
      
      loadPropertyData();
    } else {
      // For generic properties (not selected by ID), use detected build year or a default
      loadPropertyHistoryData();
      loadNearbyProperties();
    }
  }, [propertyId, location, propertyType, initialPrice]);
  
  // Load price history and nearby properties
  const loadPropertyHistoryData = async (propertyBuildYear?: number) => {
    setIsLoading(true);
    setError('');
    
    try {
      // If a specific build year was provided (e.g. from property selection), use it
      const year = propertyBuildYear || buildYear;
      
      // Load price history
      const historyData = await propertyDataService.getPropertyValuationHistory(
        location,
        propertyType,
        bedrooms,
        year,
        initialPrice
      );
      setPriceHistory(historyData);
      
      // Update buildYear if we found real data and it's different
      if (historyData.length > 0 && !propertyBuildYear) {
        const firstDataPoint = historyData[0];
        setBuildYear(firstDataPoint.year);
      }
      
      // Set current price from the latest data point
      if (historyData.length > 0) {
        const latestPrice = historyData[historyData.length - 1].price;
        setProperty(prev => ({ 
          ...prev, 
          currentPrice: latestPrice,
          buildingAge: new Date().getFullYear() - year
        }));
      }
    } catch (err) {
      console.error('Error loading property price history:', err);
      setError('Failed to load property price history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load nearby properties
  const loadNearbyProperties = async () => {
    setIsLoading(true);
    
    try {
      // Load nearby properties
      const nearbyData = await propertyDataService.getNearbyProperties(
        location,
        propertyType,
        bedrooms,
        6
      );
      
      const formattedNearbyData = nearbyData.map((item: any) => ({
        id: item.id,
        name: item.address,
        currentPrice: item.currentValuation,
        originalPrice: item.originalPrice,
        change: item.percentageChange,
        type: propertyType,
        lat: 25.2048 + Math.random() * 0.02 - 0.01, // Mock coordinates
        lng: 55.2708 + Math.random() * 0.02 - 0.01  // Mock coordinates
      }));
      
      setNearbyProperties(formattedNearbyData);
    } catch (err) {
      console.error('Error loading nearby properties:', err);
      setError('Failed to load nearby property data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update when search parameters change
  useEffect(() => {
    if (!propertyId) { // Only auto-update if not viewing a specific property
      loadPropertyHistoryData();
      loadNearbyProperties();
    }
  }, [location, propertyType, bedrooms, initialPrice]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate growth percentage
  const calculateGrowth = () => {
    if (priceHistory.length < 2) return 0;
    const initialValue = priceHistory[0].price;
    const currentValue = priceHistory[priceHistory.length - 1].price;
    return ((currentValue - initialValue) / initialValue) * 100;
  };
  
  // Get sorted nearby properties
  const getSortedProperties = () => {
    return [...nearbyProperties].sort((a, b) => {
      const aValue = a[sortField as keyof NearbyProperty];
      const bValue = b[sortField as keyof NearbyProperty];
      
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
      setSortDirection('asc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-gold-500" /> : <FaSortDown className="text-gold-500" />;
  };
  
  // Custom tooltip for the price history chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentPrice = payload[0].value;
      const initialPrice = priceHistory[0]?.price || initialPrice;
      const growth = ((currentPrice - initialPrice) / initialPrice) * 100;
      
      return (
        <div className="bg-white p-3 border border-gold-300 shadow-lg rounded-md">
          <p className="font-semibold">{`Year: ${label}`}</p>
          <p className="text-dubai-blue">{`Price: ${formatCurrency(currentPrice)}`}</p>
          <p className={`${growth >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
            Growth since purchase: {growth >= 0 ? '+' : ''}{growth.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  const growthPercentage = calculateGrowth();

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
          {/* Property Overview Card */}
          <div className="luxury-card mb-6">
            <div className="luxury-card-header flex justify-between items-center">
              <h2 className="text-xl font-bold">Property Overview</h2>
              <div className="text-sm bg-gold-500 px-2 py-1 rounded text-white">
                {property.type}
              </div>
            </div>
            <div className="luxury-card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-dubai-blue-900 mb-2">{property.name}</h3>
                    <p className="text-gray-600 flex items-center mb-2">
                      <FaMapMarkerAlt className="mr-2 text-gold-500" /> {property.address}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-dubai-blue-50 text-dubai-blue-900 px-3 py-1 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700">{property.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="luxury-kpi-tile">
                      <span className="text-gray-600 text-sm">Current Value</span>
                      <span className="text-lg font-bold text-dubai-blue-900 flex items-center">
                        <FaMoneyBillWave className="mr-2 text-gold-500" />
                        {formatCurrency(property.currentPrice)}
                      </span>
                    </div>
                    <div className="luxury-kpi-tile">
                      <span className="text-gray-600 text-sm">Growth</span>
                      <span className={`text-lg font-bold flex items-center ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <FaChartLine className="mr-2 text-gold-500" />
                        {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="luxury-kpi-tile">
                      <span className="text-gray-600 text-sm">Size</span>
                      <span className="text-lg font-bold text-dubai-blue-900 flex items-center">
                        <FaRuler className="mr-2 text-gold-500" />
                        {property.size} sqft
                      </span>
                    </div>
                    <div className="luxury-kpi-tile">
                      <span className="text-gray-600 text-sm">Built</span>
                      <span className="text-lg font-bold text-dubai-blue-900 flex items-center">
                        <FaClock className="mr-2 text-gold-500" />
                        {buildYear} <span className="ml-1 text-sm text-gray-500">(Property Launch)</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 bg-dubai-blue-50 rounded-lg p-4 border border-dubai-blue-100">
                  <h3 className="text-sm font-semibold text-dubai-blue-900 mb-3">Value Distribution</h3>
                  
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Land Value', value: property.currentPrice * 0.6 },
                            { name: 'Building Value', value: property.currentPrice * 0.3 },
                            { name: 'Amenities', value: property.currentPrice * 0.1 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#1e3a8a" />
                          <Cell fill="#c8a43c" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Price History Chart */}
          <div className="luxury-card mb-6">
            <div className="luxury-card-header">
              <h2 className="text-xl font-bold">Price History & Forecast</h2>
            </div>
            <div className="luxury-card-body">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={priceHistory}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="year" 
                      domain={[buildYear, 'dataMax']}
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        }
                        return value;
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#1e3a8a"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-dubai-blue-50 p-3 rounded-lg border border-dubai-blue-100 flex-1">
                  <h4 className="text-sm font-semibold text-dubai-blue-900 mb-1">Initial Purchase</h4>
                  <p className="text-dubai-blue-900">
                    <span className="font-bold">{formatCurrency(priceHistory[0]?.price || initialPrice)}</span>
                    <span className="text-sm text-gray-500 ml-2">in {priceHistory[0]?.year || buildYear} (Launch Price)</span>
                  </p>
                </div>
                
                <div className="bg-dubai-blue-50 p-3 rounded-lg border border-dubai-blue-100 flex-1">
                  <h4 className="text-sm font-semibold text-dubai-blue-900 mb-1">Current Value</h4>
                  <p className="text-dubai-blue-900">
                    <span className="font-bold">{formatCurrency(property.currentPrice)}</span>
                    <span className="text-sm text-gray-500 ml-2">in {new Date().getFullYear()}</span>
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg border flex-1 ${growthPercentage >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <h4 className="text-sm font-semibold text-dubai-blue-900 mb-1">Total Growth</h4>
                  <p className={growthPercentage >= 0 ? 'text-green-700' : 'text-red-700'}>
                    <span className="font-bold">{growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500 ml-2">over {priceHistory.length} years</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Nearby Properties */}
          <div className="luxury-card">
            <div className="luxury-card-header">
              <h2 className="text-xl font-bold">Nearby Properties</h2>
            </div>
            <div className="luxury-card-body">
              <div className="overflow-x-auto">
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th 
                        className="cursor-pointer"
                        onClick={() => toggleSort('name')}
                      >
                        <div className="flex items-center">
                          Property {getSortIcon('name')}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer"
                        onClick={() => toggleSort('currentPrice')}
                      >
                        <div className="flex items-center">
                          Current Value {getSortIcon('currentPrice')}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer"
                        onClick={() => toggleSort('originalPrice')}
                      >
                        <div className="flex items-center">
                          Original Price {getSortIcon('originalPrice')}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer"
                        onClick={() => toggleSort('change')}
                      >
                        <div className="flex items-center">
                          Growth {getSortIcon('change')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedProperties().map((prop) => (
                      <tr key={prop.id}>
                        <td className="font-medium text-dubai-blue-900">{prop.name}</td>
                        <td>{formatCurrency(prop.currentPrice)}</td>
                        <td>{formatCurrency(prop.originalPrice)}</td>
                        <td className={prop.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {prop.change >= 0 ? '+' : ''}{prop.change.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-between items-start">
                <div className="w-full lg:w-1/2">
                  <h3 className="text-sm font-semibold text-dubai-blue-900 mb-3">Comparative Growth</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getSortedProperties()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis 
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 'dataMax + 5']}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Growth']}
                          labelFormatter={(value) => `Property: ${value}`}
                        />
                        <Bar dataKey="change" fill="#c8a43c" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 pl-0 lg:pl-6 mt-6 lg:mt-0">
                  <h3 className="text-sm font-semibold text-dubai-blue-900 mb-3">Value Comparison</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis 
                          type="number" 
                          dataKey="originalPrice" 
                          name="Original Price"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          domain={['dataMin - 500000', 'dataMax + 500000']}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="currentPrice" 
                          name="Current Price"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          domain={['dataMin - 500000', 'dataMax + 500000']}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="change" 
                          range={[60, 400]} 
                          name="Growth" 
                          unit="%" 
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          formatter={(value, name) => [
                            name === 'Growth' ? `${value}%` : formatCurrency(Number(value)),
                            name
                          ]}
                        />
                        <Scatter 
                          name="Properties" 
                          data={getSortedProperties()} 
                          fill="#8884d8"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
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