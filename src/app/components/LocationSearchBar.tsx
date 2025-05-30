'use client';

import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface LocationSearchBarProps {
  onLocationSubmit: (location: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  onLocationSubmit,
  isLoading = false,
  placeholder = "Enter location (e.g., Dubai Marina, Downtown Dubai, JBR)"
}) => {
  const [location, setLocation] = useState('');
  const [suggestions] = useState([
    'Dubai Marina',
    'Downtown Dubai',
    'JBR (Jumeirah Beach Residence)',
    'Business Bay',
    'DIFC (Dubai International Financial Centre)',
    'Palm Jumeirah',
    'Jumeirah Village Circle (JVC)',
    'Dubai Hills Estate',
    'City Walk',
    'Al Barsha',
    'Jumeirah Lakes Towers (JLT)',
    'Dubai South',
    'Mirdif',
    'Arabian Ranches',
    'The Springs',
    'Emirates Hills',
    'Burj Khalifa Area',
    'Dubai Creek Harbour',
    'Al Furjan',
    'Motor City'
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && !isLoading) {
      onLocationSubmit(location.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    onLocationSubmit(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <MapPin className="h-5 w-5" />
          </div>
          
          <input
            type="text"
            value={location}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => location.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-xl 
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none
                     transition-all duration-200 bg-white shadow-sm
                     disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          
          <button
            type="submit"
            disabled={!location.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2
                     bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
                     text-white p-3 rounded-lg transition-colors duration-200
                     disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 
                      rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                       border-b border-gray-100 last:border-b-0 flex items-center gap-3"
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-blue-50 border border-blue-200 
                      rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-blue-700 font-medium">
            Fetching demographic data for {location}...
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationSearchBar; 