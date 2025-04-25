"use client";

import { useState, useCallback } from 'react';
import { PropertyLookupResult, PropertyForecast, NearbyProject } from '../interfaces/property';
import { propertyService } from '../services/propertyService';
import { forecastService } from '../services/forecastService';
import { demographicService } from '../services/demographicService';

interface UsePropertyLookupProps {
  initialLocation?: string;
  initialPropertyName?: string;
}

interface UsePropertyLookupResult {
  location: string;
  propertyName: string;
  isLoading: boolean;
  propertyData: PropertyLookupResult | null;
  forecastData: PropertyForecast | null;
  nearbyProjects: NearbyProject[] | null;
  error: string | null;
  setLocation: (location: string) => void;
  setPropertyName: (name: string) => void;
  searchProperty: () => Promise<void>;
  getForecast: (propertyId: string) => Promise<void>;
  getNearbyProjects: (propertyId: string) => Promise<void>;
  fetchPropertyDetails: (propertyId: string) => void;
}

export const usePropertyLookup = (props?: UsePropertyLookupProps): UsePropertyLookupResult => {
  const [location, setLocation] = useState<string>(props?.initialLocation || '');
  const [propertyName, setPropertyName] = useState<string>(props?.initialPropertyName || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [propertyData, setPropertyData] = useState<PropertyLookupResult | null>(null);
  const [forecastData, setForecastData] = useState<PropertyForecast | null>(null);
  const [nearbyProjects, setNearbyProjects] = useState<NearbyProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to search for properties in a location
  const searchProperty = useCallback(async () => {
    // Validate inputs
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get property data
      const data = await propertyService.getPropertyDetails(location, propertyName);
      setPropertyData(data);

      // If we have a selected property, get the forecast and nearby projects
      if (data.selectedProperty) {
        await getForecast(data.selectedProperty.id);
        await getNearbyProjects(data.selectedProperty.id);
      }
    } catch (err) {
      console.error('Error searching for property:', err);
      setError('Failed to search for property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location, propertyName]);

  // Function to get forecast for a property
  const getForecast = useCallback(async (propertyId: string) => {
    if (!propertyId) return;

    setIsLoading(true);
    
    try {
      const forecast = await propertyService.getPropertyForecast(propertyId);
      setForecastData(forecast);
    } catch (err) {
      console.error('Error getting property forecast:', err);
      setError('Failed to get property forecast data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to get nearby projects for a property
  const getNearbyProjects = useCallback(async (propertyId: string) => {
    if (!propertyId) return;

    setIsLoading(true);
    
    try {
      const projects = await propertyService.getNearbyProjects(propertyId);
      setNearbyProjects(projects);
    } catch (err) {
      console.error('Error getting nearby projects:', err);
      setError('Failed to get nearby projects data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPropertyDetails = useCallback((propertyId: string) => {
    // First set the property ID as propertyName
    setPropertyName(propertyId);
    // Then call searchProperty to get the data
    searchProperty();
    // Get forecast and nearby projects directly
    if (propertyId) {
      getForecast(propertyId);
      getNearbyProjects(propertyId);
    }
  }, [searchProperty, getForecast, getNearbyProjects]);

  return {
    location,
    propertyName,
    isLoading,
    propertyData,
    forecastData,
    nearbyProjects,
    error,
    setLocation,
    setPropertyName,
    searchProperty,
    getForecast,
    getNearbyProjects,
    fetchPropertyDetails
  };
};