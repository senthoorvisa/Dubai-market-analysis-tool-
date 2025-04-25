"use client";

import { useState, useCallback } from 'react';
import { PropertyForecast } from '../interfaces/property';
import { forecastService } from '../services/forecastService';
import { demographicService } from '../services/demographicService';
import { InfrastructureProject } from '../interfaces/demographics';

interface UseForecastAnalysisProps {
  initialPropertyId?: string;
  initialLocation?: string;
  initialPrice?: number;
  initialPropertyType?: string;
}

interface UseForecastAnalysisResult {
  propertyId: string;
  location: string;
  currentPrice: number;
  propertyType: string;
  marketSentiment: number;
  isLoading: boolean;
  forecast: PropertyForecast | null;
  comparativeForecasts: Record<string, PropertyForecast> | null;
  infrastructureImpactForecast: PropertyForecast | null;
  nearbyProjects: InfrastructureProject[] | null;
  error: string | null;
  setPropertyId: (id: string) => void;
  setLocation: (location: string) => void;
  setCurrentPrice: (price: number) => void;
  setPropertyType: (type: string) => void;
  setMarketSentiment: (sentiment: number) => void;
  generateForecast: () => Promise<void>;
  generateComparativeForecasts: () => Promise<void>;
  generateInfrastructureImpactForecast: () => Promise<void>;
  fetchNearbyProjects: () => Promise<void>;
}

export const useForecastAnalysis = (props?: UseForecastAnalysisProps): UseForecastAnalysisResult => {
  const [propertyId, setPropertyId] = useState<string>(props?.initialPropertyId || 'property-001');
  const [location, setLocation] = useState<string>(props?.initialLocation || 'Dubai Marina');
  const [currentPrice, setCurrentPrice] = useState<number>(props?.initialPrice || 2500000);
  const [propertyType, setPropertyType] = useState<string>(props?.initialPropertyType || 'Apartment');
  const [marketSentiment, setMarketSentiment] = useState<number>(75); // 0-100 scale
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forecast, setForecast] = useState<PropertyForecast | null>(null);
  const [comparativeForecasts, setComparativeForecasts] = useState<Record<string, PropertyForecast> | null>(null);
  const [infrastructureImpactForecast, setInfrastructureImpactForecast] = useState<PropertyForecast | null>(null);
  const [nearbyProjects, setNearbyProjects] = useState<InfrastructureProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to generate a basic price forecast
  const generateForecast = useCallback(async () => {
    if (!propertyId || !location || !currentPrice || !propertyType) {
      setError('All forecast parameters are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const forecastData = await forecastService.getPriceForecast({
        propertyId,
        location,
        currentPrice,
        propertyType,
        size: 0, // These could be added as additional parameters in the interface
        constructionYear: 0,
        marketSentiment
      });
      
      setForecast(forecastData);
    } catch (err) {
      console.error('Error generating forecast:', err);
      setError('Failed to generate price forecast. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, location, currentPrice, propertyType, marketSentiment]);

  // Function to generate comparative forecasts for different property types
  const generateComparativeForecasts = useCallback(async () => {
    if (!location) {
      setError('Location is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const comparisons = await forecastService.getComparativeForecasts(location);
      setComparativeForecasts(comparisons);
    } catch (err) {
      console.error('Error generating comparative forecasts:', err);
      setError('Failed to generate comparative forecasts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Function to generate forecasts with infrastructure impact
  const generateInfrastructureImpactForecast = useCallback(async () => {
    if (!propertyId || !location || !currentPrice) {
      setError('Property ID, location, and current price are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, fetch nearby infrastructure projects to calculate the impact
      await fetchNearbyProjects();
      
      if (!nearbyProjects || nearbyProjects.length === 0) {
        setError('No nearby infrastructure projects found. Cannot calculate impact.');
        setIsLoading(false);
        return;
      }
      
      // Calculate total infrastructure impact
      const totalImpact = nearbyProjects.reduce((total, project) => {
        return total + project.estimatedImpact;
      }, 0);
      
      // Generate forecast with the calculated infrastructure impact
      const impactForecast = await forecastService.getForecastWithInfrastructureImpact(
        propertyId,
        location,
        currentPrice,
        totalImpact
      );
      
      setInfrastructureImpactForecast(impactForecast);
    } catch (err) {
      console.error('Error generating infrastructure impact forecast:', err);
      setError('Failed to generate infrastructure impact forecast. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, location, currentPrice, nearbyProjects]);

  // Function to fetch nearby infrastructure projects
  const fetchNearbyProjects = useCallback(async () => {
    if (!location) {
      setError('Location is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const infrastructureData = await demographicService.getInfrastructureAnalysis(location);
      setNearbyProjects(infrastructureData.projects);
    } catch (err) {
      console.error('Error fetching nearby projects:', err);
      setError('Failed to fetch nearby infrastructure projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  const analyzeMarket = useCallback(() => {
    generateForecast();
    fetchNearbyProjects();
  }, [generateForecast, fetchNearbyProjects]);

  return {
    propertyId,
    location,
    currentPrice,
    propertyType,
    marketSentiment,
    isLoading,
    forecast,
    comparativeForecasts,
    infrastructureImpactForecast,
    nearbyProjects,
    error,
    setPropertyId,
    setLocation,
    setCurrentPrice,
    setPropertyType,
    setMarketSentiment,
    generateForecast,
    generateComparativeForecasts,
    generateInfrastructureImpactForecast,
    fetchNearbyProjects
  };
}; 