"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Image from 'next/image';
import L from 'leaflet';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

// Import Leaflet CSS - this is crucial
import 'leaflet/dist/leaflet.css';

// Create a custom icon for featured properties
const createCustomIcon = (isFeatured) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-pin ${isFeatured ? 'featured' : ''}"></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
};

// Format currency helper function
const formatCurrency = (value) => {
  return `AED ${value.toLocaleString()}`;
};

const Map = ({ 
  properties, 
  center, 
  zoom, 
  selectedProperty, 
  onPropertySelect, 
  onToggleFavorite, 
  favorites 
}) => {
  // Fix for Leaflet default marker icons - moved inside component
  useEffect(() => {
    // This code only runs on the client after the component mounts
    // Fix the marker icon paths which are broken in Leaflet + Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  
  return (
    <div className="relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '600px', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {properties.map((property) => (
          <Marker 
            key={property.id}
            position={[property.lat, property.lng]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="bg-dubai-blue-800 text-white p-2 rounded-full border-2 ${property.isFeatured ? 'border-gold-500' : 'border-white'}">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                        <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                      </svg>
                    </div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            })}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <div className="mb-2">
                  <Image 
                    src={property.image} 
                    alt={property.name}
                    width={200}
                    height={120}
                    className="w-full h-24 object-cover rounded-md"
                  />
                </div>
                <h3 className="font-bold text-sm">{property.name}</h3>
                <div className="text-xs text-gray-600 mb-1">{property.location}</div>
                <div className="font-bold text-md text-dubai-blue-900">{formatCurrency(property.price)}</div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span>{property.bedrooms} Beds</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.size} sqft</span>
                </div>
                <button 
                  className="mt-2 w-full bg-dubai-blue-900 text-white text-xs py-1 rounded-md hover:bg-dubai-blue-800"
                  onClick={() => onPropertySelect(property)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    
      {/* Property List Panel */}
      <div className="absolute top-4 left-4 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-20 max-h-[calc(100%-32px)]">
        <div className="p-3 bg-dubai-blue-900 text-white flex items-center justify-between">
          <h3 className="font-bold flex items-center">
            <FaStar className="mr-2 text-gold-500" /> Featured Properties
          </h3>
          <span className="text-sm">{properties.length} listings</span>
        </div>
        
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(600px - 56px)' }}>
          {properties.map((property) => (
            <div 
              key={property.id}
              className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-300 ${selectedProperty?.id === property.id ? 'bg-blue-50' : ''}`}
              onClick={() => onPropertySelect(property)}
            >
              <div className="relative rounded-lg overflow-hidden mb-2">
                <Image 
                  src={property.image} 
                  alt={property.name}
                  width={400}
                  height={200}
                  className="w-full h-32 object-cover"
                />
                
                {property.isFeatured && (
                  <div className="absolute top-2 left-2 bg-gold-500 text-dubai-blue-900 text-xs font-bold px-2 py-1 rounded-md">
                    FEATURED
                  </div>
                )}
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(property.id);
                  }}
                  className="absolute bottom-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors"
                >
                  {favorites.includes(property.id) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-600" />
                  )}
                </button>
              </div>
              
              <h3 className="font-bold text-dubai-blue-900">{property.name}</h3>
              
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <FaMapMarkerAlt className="mr-1 text-dubai-blue-500" />
                <span>{property.location}</span>
              </div>
              
              <div className="text-lg font-bold text-dubai-blue-900 mb-1">
                {formatCurrency(property.price)}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>{property.bedrooms} Beds</div>
                <div>{property.bathrooms} Baths</div>
                <div>{property.size} sqft</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Property Detail Overlay (when a property is selected) */}
      {selectedProperty && (
        <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-xl p-4 z-20 w-80">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-dubai-blue-900">{selectedProperty.name}</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPropertySelect(null);
              }} 
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center text-gray-600 text-sm">
              <FaMapMarkerAlt className="mr-1 text-dubai-blue-500" />
              <span>{selectedProperty.location}</span>
            </div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden mb-3">
            <Image 
              src={selectedProperty.image} 
              alt={selectedProperty.name}
              width={400}
              height={250}
              className="w-full h-40 object-cover"
            />
            
            {selectedProperty.rating && (
              <div className="absolute top-2 right-2 bg-gold-500 text-dubai-blue-900 px-2 py-1 rounded flex items-center text-sm font-bold">
                <FaStar className="mr-1" /> {selectedProperty.rating}
              </div>
            )}
          </div>
          
          <div className="text-xl font-bold mb-2 text-dubai-blue-900">
            {formatCurrency(selectedProperty.price)}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            {selectedProperty.description}
          </p>
          
          <div className="flex justify-between mb-3 border-t border-b border-gray-200 py-2">
            <div className="text-center">
              <div className="text-dubai-blue-900 font-bold">{selectedProperty.bedrooms}</div>
              <div className="text-xs text-gray-500">Beds</div>
            </div>
            <div className="text-center">
              <div className="text-dubai-blue-900 font-bold">{selectedProperty.bathrooms}</div>
              <div className="text-xs text-gray-500">Baths</div>
            </div>
            <div className="text-center">
              <div className="text-dubai-blue-900 font-bold">{selectedProperty.size}</div>
              <div className="text-xs text-gray-500">Sq. Ft.</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-dubai-blue-900 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center hover:bg-dubai-blue-800 transition-colors">
              Contact Agent
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(selectedProperty.id);
              }}
              className={`p-2 rounded-lg border ${favorites.includes(selectedProperty.id) 
                ? 'bg-red-50 border-red-300 text-red-500' 
                : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}
            >
              {favorites.includes(selectedProperty.id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add CSS for custom markers
const MapStyle = () => {
  return (
    <style jsx global>{`
      .custom-div-icon {
        background: transparent;
        border: none;
      }
      
      .marker-pin {
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #2b6cb0;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -15px 0 0 -15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .marker-pin::after {
        content: '';
        width: 24px;
        height: 24px;
        margin: 3px 0 0 3px;
        background: white;
        position: absolute;
        border-radius: 50%;
      }
      
      .marker-pin.featured {
        background: #f59e0b;
      }
      
      .leaflet-container {
        font-family: inherit;
        border-radius: 0.75rem;
        overflow: hidden;
      }
      
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      
      .custom-popup .leaflet-popup-content {
        margin: 0.5rem;
        min-width: 200px;
      }
      
      .custom-popup .leaflet-popup-tip {
        background: white;
      }
    `}</style>
  );
};

// Combine the Map and Style components
const MapWithStyles = (props) => {
  return (
    <>
      <Map {...props} />
      <MapStyle />
    </>
  );
};

export default MapWithStyles; 