import Link from 'next/link';
import RealTimeDateTime from './components/RealTimeDateTime';

export default function Home() {
  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-dubai-blue-900 mb-3">Dubai Real Estate Market Analysis</h1>
        <p className="text-dubai-blue-700 text-xl">Comprehensive tools for property market insights</p>
      </div>
      
      {/* Real-time Date/Time Component */}
      <RealTimeDateTime />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property Lookup */}
        <Link href="/property-lookup" className="block">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-almond h-full flex flex-col">
            <div className="flex items-center mb-4">
              <div className="bg-beige p-3 rounded-full mr-4">
                <span className="text-tuscany text-xl">🔍</span>
              </div>
              <h2 className="text-xl font-bold text-dubai-blue-900">Property Lookup</h2>
            </div>
            <p className="text-dubai-blue-700 mb-auto">Access comprehensive property data, search by name or reference ID, and explore detailed market valuations.</p>
            <div className="mt-4 text-tuscany font-medium flex items-center">
              Lookup Properties <span className="ml-2">→</span>
            </div>
          </div>
        </Link>
        
        {/* Rental Analysis */}
        <Link href="/rental-analysis" className="block">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-almond h-full flex flex-col">
            <div className="flex items-center mb-4">
              <div className="bg-beige p-3 rounded-full mr-4">
                <span className="text-tuscany text-xl">🏠</span>
              </div>
              <h2 className="text-xl font-bold text-dubai-blue-900">Rental Analysis</h2>
            </div>
            <p className="text-dubai-blue-700 mb-auto">Explore current rental market trends and compare properties across Dubai's most popular areas.</p>
            <div className="mt-4 text-tuscany font-medium flex items-center">
              View Rental Analysis <span className="ml-2">→</span>
            </div>
          </div>
        </Link>
        
        {/* Developer Analysis */}
        <Link href="/developer-analysis" className="block">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-almond h-full flex flex-col">
            <div className="flex items-center mb-4">
              <div className="bg-beige p-3 rounded-full mr-4">
                <span className="text-tuscany text-xl">🏢</span>
              </div>
              <h2 className="text-xl font-bold text-dubai-blue-900">Developer Analysis</h2>
            </div>
            <p className="text-dubai-blue-700 mb-auto">Compare and analyze real estate developers, their projects, quality ratings, and market performance.</p>
            <div className="mt-4 text-tuscany font-medium flex items-center">
              View Developer Analysis <span className="ml-2">→</span>
            </div>
          </div>
        </Link>
        
        {/* Settings */}
        <Link href="/settings" className="block">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-almond h-full flex flex-col">
            <div className="flex items-center mb-4">
              <div className="bg-beige p-3 rounded-full mr-4">
                <span className="text-tuscany text-xl">⚙️</span>
              </div>
              <h2 className="text-xl font-bold text-dubai-blue-900">Settings</h2>
            </div>
            <p className="text-dubai-blue-700 mb-auto">Configure your API keys, preferences, and customize your experience with the platform.</p>
            <div className="mt-4 text-tuscany font-medium flex items-center">
              View Settings <span className="ml-2">→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}