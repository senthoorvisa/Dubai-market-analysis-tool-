"use client";

import { useState, useCallback } from 'react';
import { DemographicData, InfrastructureAnalysis, InfrastructureProject } from '../interfaces/demographics';
import { demographicService } from '../services/demographicService';
import { chatGptService } from '../services/chatGptService';

interface UseDemographicAnalysisProps {
  initialLocation?: string;
  apiKey?: string;
}

interface UseDemographicAnalysisResult {
  location: string;
  isLoading: boolean;
  demographicData: DemographicData | null;
  infrastructureAnalysis: InfrastructureAnalysis | null;
  wealthComparison: Record<string, any> | null;
  marketNews: string[] | null;
  error: string | null;
  setLocation: (location: string) => void;
  setApiKey: (key: string) => void;
  fetchDemographicData: () => Promise<void>;
  fetchInfrastructureAnalysis: () => Promise<void>;
  fetchWealthComparison: () => Promise<void>;
  fetchMarketNews: () => Promise<void>;
}

export const useDemographicAnalysis = (props?: UseDemographicAnalysisProps): UseDemographicAnalysisResult => {
  const [location, setLocation] = useState<string>(props?.initialLocation || '');
  const [apiKey, setApiKey] = useState<string>(props?.apiKey || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [demographicData, setDemographicData] = useState<DemographicData | null>(null);
  const [infrastructureAnalysis, setInfrastructureAnalysis] = useState<InfrastructureAnalysis | null>(null);
  const [wealthComparison, setWealthComparison] = useState<Record<string, any> | null>(null);
  const [marketNews, setMarketNews] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch demographic data for a location
  const fetchDemographicData = useCallback(async () => {
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await demographicService.getDemographicData(location);
      setDemographicData(data);
    } catch (err) {
      console.error('Error fetching demographic data:', err);
      setError('Failed to fetch demographic data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Function to fetch infrastructure analysis for a location
  const fetchInfrastructureAnalysis = useCallback(async () => {
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analysis = await demographicService.getInfrastructureAnalysis(location);
      setInfrastructureAnalysis(analysis);
    } catch (err) {
      console.error('Error fetching infrastructure analysis:', err);
      setError('Failed to fetch infrastructure analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Function to fetch wealth distribution comparison across locations
  const fetchWealthComparison = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const comparison = await demographicService.getWealthDistributionComparison();
      setWealthComparison(comparison);
    } catch (err) {
      console.error('Error fetching wealth comparison:', err);
      setError('Failed to fetch wealth distribution comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch market news using ChatGPT
  const fetchMarketNews = useCallback(async () => {
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    if (!apiKey.trim()) {
      setError('API key is required for fetching market news');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate API key
      const isValidKey = await chatGptService.validateApiKey(apiKey);
      
      if (!isValidKey) {
        setError('Invalid API key. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // Fetch market news
      const news = await chatGptService.getMarketNewsSummary(location, apiKey);
      setMarketNews(news);
    } catch (err) {
      console.error('Error fetching market news:', err);
      setError('Failed to fetch market news. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location, apiKey]);

  return {
    location,
    isLoading,
    demographicData,
    infrastructureAnalysis,
    wealthComparison,
    marketNews,
    error,
    setLocation,
    setApiKey,
    fetchDemographicData,
    fetchInfrastructureAnalysis,
    fetchWealthComparison,
    fetchMarketNews
  };
}; 