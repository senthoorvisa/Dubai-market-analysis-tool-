'use client';

import React from 'react';
import { MapPin, Loader2, AlertCircle, ShoppingBag, Trees, Building, GraduationCap, Heart, Utensils } from 'lucide-react';

interface FacilitiesData {
  malls: number;
  parks: number;
  publicPlaces: number;
  schools: number;
  hospitals: number;
  restaurants: number;
}

interface FacilitiesProps {
  facilities?: FacilitiesData;
  isLoading?: boolean;
  error?: string;
  location?: string;
}

const Facilities: React.FC<FacilitiesProps> = ({
  facilities,
  isLoading = false,
  error,
  location
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE').format(num);
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'malls': return <ShoppingBag className="h-5 w-5 text-blue-600" />;
      case 'parks': return <Trees className="h-5 w-5 text-green-600" />;
      case 'publicPlaces': return <Building className="h-5 w-5 text-purple-600" />;
      case 'schools': return <GraduationCap className="h-5 w-5 text-orange-600" />;
      case 'hospitals': return <Heart className="h-5 w-5 text-red-600" />;
      case 'restaurants': return <Utensils className="h-5 w-5 text-yellow-600" />;
      default: return <MapPin className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFacilityLabel = (type: string) => {
    switch (type) {
      case 'malls': return 'Shopping Malls';
      case 'parks': return 'Parks & Recreation';
      case 'publicPlaces': return 'Public Places';
      case 'schools': return 'Schools';
      case 'hospitals': return 'Hospitals & Clinics';
      case 'restaurants': return 'Restaurants';
      default: return type;
    }
  };

  const getTotalFacilities = (facilities: FacilitiesData) => {
    return Object.values(facilities).reduce((sum, count) => sum + count, 0);
  };

  const getInfrastructureLevel = (total: number) => {
    if (total > 100) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (total > 50) return { level: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (total > 25) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (total > 10) return { level: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Limited', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const totalFacilities = facilities ? getTotalFacilities(facilities) : 0;
  const infrastructureLevel = totalFacilities > 0 ? getInfrastructureLevel(totalFacilities) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-100 rounded-lg">
            <MapPin className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Facilities & Amenities</h3>
            {location && (
              <p className="text-sm text-gray-500">in {location}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="text-gray-600">Loading facilities data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Error loading data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : facilities ? (
          <div className="space-y-4">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {formatNumber(totalFacilities)}
              </div>
              <p className="text-gray-600">Total Facilities</p>
              <p className="text-sm text-gray-500">Infrastructure & Amenities</p>
            </div>

            {infrastructureLevel && (
              <div className={`${infrastructureLevel.bg} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm font-medium text-teal-800">Infrastructure Level</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-700">
                    {infrastructureLevel.level} infrastructure development
                  </span>
                  <span className={`text-sm font-bold ${infrastructureLevel.color}`}>
                    {infrastructureLevel.level}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(facilities).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {getFacilityIcon(type)}
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {getFacilityLabel(type)}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {formatNumber(count)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Lifestyle Quality</span>
              </div>
              <p className="text-sm text-teal-700">
                {totalFacilities > 80 
                  ? "Comprehensive infrastructure with world-class amenities and services" 
                  : totalFacilities > 40 
                  ? "Well-developed area with good access to essential facilities" 
                  : totalFacilities > 20
                  ? "Moderate infrastructure with basic amenities available"
                  : "Developing area with limited but growing infrastructure"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 mb-1 font-medium">Shopping</div>
                <div className="text-sm font-bold text-blue-800">
                  {facilities.malls + Math.floor(facilities.restaurants * 0.1)} venues
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600 mb-1 font-medium">Recreation</div>
                <div className="text-sm font-bold text-green-800">
                  {facilities.parks + facilities.publicPlaces} spaces
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xs text-orange-600 mb-1 font-medium">Services</div>
                <div className="text-sm font-bold text-orange-800">
                  {facilities.schools + facilities.hospitals} facilities
                </div>
              </div>
            </div>

            {facilities.restaurants > 50 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Dining Scene</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Vibrant culinary destination with {formatNumber(facilities.restaurants)} restaurants 
                  offering diverse dining experiences.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No facilities data available</p>
            <p className="text-sm text-gray-400">Search for a location to view data</p>
          </div>
        )}
      </div>

      {facilities && !isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Infrastructure survey</span>
            <span>{new Date().toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facilities; 