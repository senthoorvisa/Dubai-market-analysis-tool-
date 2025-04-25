'use client';

import { FaHome, FaBuilding, FaMoneyBillWave, FaChartLine, FaSearch, FaMap, FaRobot, FaChartBar, FaKey, FaCog } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Dubai Property Dashboard</h1>
            <p className="text-gray-500">Comprehensive insights into Dubai&apos;s real estate market</p>
          </div>
          <div className="flex space-x-4 items-center">
            <select className="p-2 border border-gray-300 rounded-md w-[200px]">
              <option value="">Select area</option>
              <option value="downtown">Downtown Dubai</option>
              <option value="marina">Dubai Marina</option>
              <option value="palms">Palm Jumeirah</option>
              <option value="hills">Emirates Hills</option>
            </select>
            <select className="p-2 border border-gray-300 rounded-md w-[200px]">
              <option value="">Property type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="townhouse">Townhouse</option>
              <option value="commercial">Commercial</option>
            </select>
            <Link href="/settings" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" title="Settings">
              <FaCog className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Dubai Market Overview Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Dubai Property Market Overview</h2>
            <p className="text-gray-600 text-sm">Latest market insights</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-neutral-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Transaction Volume</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monthly</p>
                  <p className="text-2xl font-bold text-gray-800">7,528</p>
                  <p className="text-xs text-green-600">+12.4% MoM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year to Date</p>
                  <p className="text-2xl font-bold text-gray-800">64,734</p>
                  <p className="text-xs text-green-600">+18.7% YoY</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Average Price (AED/sqft)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Apartments</p>
                  <p className="text-2xl font-bold text-gray-800">1,450</p>
                  <p className="text-xs text-green-600">+5.8% YoY</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Villas</p>
                  <p className="text-2xl font-bold text-gray-800">1,380</p>
                  <p className="text-xs text-green-600">+8.2% YoY</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Investment Hotspots</h3>
              <ol className="text-sm text-gray-700 space-y-1">
                <li className="flex justify-between items-center">
                  <span>Business Bay</span>
                  <span className="font-medium">18.4% ROI</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Dubai Marina</span>
                  <span className="font-medium">16.7% ROI</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>JVC</span>
                  <span className="font-medium">15.2% ROI</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Dubai Hills</span>
                  <span className="font-medium">14.8% ROI</span>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Market Trends</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>Luxury segment (AED 10M+) seeing 27% growth in transaction volume</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>Off-plan properties account for 62% of recent sales</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>Waterfront properties command 22% premium over comparable inland units</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>Surge in demand for move-in ready properties with smart home features</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Upcoming Developments</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>Emaar launching 5 new master-planned communities in Q3-Q4</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>Dubai South expansion adding 12,000 residential units by 2026</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>Palm Jebel Ali revival with infrastructure work commencing</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2 mt-1.5"></span>
                  <span>New metro lines planned to connect emerging areas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rental Market Overview Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700 flex items-center">
              <FaKey className="mr-2" /> Current Rental Market Highlights
            </h2>
            <Link href="/rental" className="text-sm text-gray-600 hover:text-gray-800">
              View detailed analysis →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Studio Apartment</p>
              <p className="text-lg font-bold text-gray-700">AED 45,000 / year</p>
              <p className="text-xs text-gray-500">+4.2% from last quarter</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">1 Bedroom Apartment</p>
              <p className="text-lg font-bold text-gray-700">AED 75,000 / year</p>
              <p className="text-xs text-gray-500">+5.8% from last quarter</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">2 Bedroom Apartment</p>
              <p className="text-lg font-bold text-gray-700">AED 120,000 / year</p>
              <p className="text-xs text-gray-500">+3.5% from last quarter</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">3+ Bedroom Villa</p>
              <p className="text-lg font-bold text-gray-700">AED 220,000 / year</p>
              <p className="text-xs text-gray-500">+7.2% from last quarter</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Top Areas by Rental Yield</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-24 text-xs text-gray-600">JVC</span>
                  <div className="flex-grow bg-gray-200 h-2 rounded-full">
                    <div className="bg-gray-600 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium">9.2%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-xs text-gray-600">Dubai South</span>
                  <div className="flex-grow bg-gray-200 h-2 rounded-full">
                    <div className="bg-gray-600 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium">8.7%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-xs text-gray-600">Sports City</span>
                  <div className="flex-grow bg-gray-200 h-2 rounded-full">
                    <div className="bg-gray-600 h-2 rounded-full" style={{width: '84%'}}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium">8.4%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Market Insights</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mr-1.5 mt-1"></span>
                  <span>Rental contracts now require landlord deposit insurance</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mr-1.5 mt-1"></span>
                  <span>Short-term rental licenses increasing at 34% annually</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mr-1.5 mt-1"></span>
                  <span>Corporate rentals driving premium segment growth</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Highlight Section */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 bg-neutral-100 p-4 rounded-full shadow-md">
              <FaRobot className="h-12 w-12 text-gray-600" />
            </div>
            <div className="flex-grow">
              <div className="bg-white inline-block px-2 py-1 rounded text-xs font-medium text-gray-700 mb-2 border border-gray-200">REALTOR TOOLS</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">AI-Powered Property Analysis</h2>
              <p className="text-gray-600 mb-4">
                Access comprehensive market analysis, client-ready reports, and competitive insights instantly. 
                Perfect for agents looking to close deals faster with data-backed recommendations.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/property-lookup" className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2 rounded-md inline-flex items-center transition-colors">
                  <FaSearch className="mr-2" /> Property Analysis
                </Link>
                <Link href="/rental" className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-5 py-2 rounded-md inline-flex items-center transition-colors">
                  <FaKey className="mr-2" /> Rental Analysis
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main feature cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <FeatureCard 
            title="Property Lookup"
            description="Generate property reports with valuation, market comparisons, infrastructure details, and investment potential."
            icon={FaSearch}
            status="active"
            href="/property-lookup"
          />
          <FeatureCard 
            title="Rental Analysis"
            description="Analyze rental yields, predict rates, and identify opportunities across the rental market."
            icon={FaKey}
            status="active"
            href="/rental"
          />
          <FeatureCard 
            title="Developer Analysis"
            description="Research developer reputation, quality track record, and current projects to advise clients confidently."
            icon={FaBuilding}
            status="active"
            href="/developer-analysis"
          />
        </div>

        {/* Secondary feature cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FeatureCard 
            title="Price Forecast"
            description="AI-powered property price predictions with investment potential calculation for any Dubai area."
            icon={FaChartLine}
            status="active"
            href="/forecast"
          />
          <FeatureCard 
            title="Demographics"
            description="Understand neighborhood demographics, wealth distribution, and expected value appreciation."
            icon={FaChartBar}
            status="active"
            href="/demographics"
          />
          <FeatureCard 
            title="Settings"
            description="Configure API keys, model preferences, and data integration settings for your business needs."
            icon={FaCog}
            status="active"
            href="/settings"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  period: string;
  colorScheme: 'black' | 'gray';
}

function StatCard({ icon: Icon, title, value, change, period, colorScheme }: StatCardProps) {
  const isPositive = change.startsWith('+');
  
  const colorMap = {
    black: 'bg-gray-100 text-gray-800',
    gray: 'bg-gray-50 text-gray-600'
  };
  
  const bgColor = colorMap[colorScheme].split(' ')[0];
  const textColor = colorMap[colorScheme].split(' ')[1];

  return (
    <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-md font-medium text-gray-700">{title}</p>
            <p className="text-2xl font-bold text-gray-700">{value}</p>
            <p className={`text-sm ${isPositive ? 'text-gray-700' : 'text-gray-600'}`}>
              {change} <span className="text-gray-500">{period}</span>
            </p>
          </div>
          <div className={`${bgColor} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${textColor}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'coming-soon';
  href?: string;
}

function FeatureCard({ title, description, icon: Icon, status, href }: FeatureCardProps) {
  return (
    <div className="border border-gray-200 rounded-md bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start mb-4">
          <div className="bg-gray-100 p-3 rounded-full mr-4">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        
        {status === 'active' && href ? (
          <Link href={href} className="block w-full bg-gray-600 text-white text-center py-2 rounded-md hover:bg-gray-700 transition-colors">
            Access Now
          </Link>
        ) : (
          <div className="block w-full bg-gray-200 text-gray-600 text-center py-2 rounded-md cursor-not-allowed">
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}
