"use client";

import { useState, useCallback } from 'react';
import { Developer, DeveloperAnalysis } from '../interfaces/developer';
import { developerService } from '../services/developerService';
import { chatGptService } from '../services/chatGptService';

interface UseDeveloperAnalysisProps {
  initialDeveloperName?: string;
  apiKey?: string;
}

interface UseDeveloperAnalysisResult {
  developerName: string;
  isLoading: boolean;
  developers: Developer[];
  developerAnalysis: DeveloperAnalysis | null;
  developerNews: {
    summary: string[];
    sources: {
      title: string;
      url: string;
      description: string;
    }[];
  } | null;
  error: string | null;
  setDeveloperName: (name: string) => void;
  setApiKey: (key: string) => void;
  fetchAllDevelopers: () => Promise<void>;
  fetchDeveloperAnalysis: () => Promise<void>;
  fetchDeveloperNews: () => Promise<void>;
}

export const useDeveloperAnalysis = (props?: UseDeveloperAnalysisProps): UseDeveloperAnalysisResult => {
  const [developerName, setDeveloperName] = useState<string>(props?.initialDeveloperName || '');
  const [apiKey, setApiKey] = useState<string>(props?.apiKey || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [developerAnalysis, setDeveloperAnalysis] = useState<DeveloperAnalysis | null>(null);
  const [developerNews, setDeveloperNews] = useState<{
    summary: string[];
    sources: {
      title: string;
      url: string;
      description: string;
    }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all developers
  const fetchAllDevelopers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allDevelopers = await developerService.getAllDevelopers();
      setDevelopers(allDevelopers);
    } catch (err) {
      console.error('Error fetching all developers:', err);
      setError('Failed to fetch developers list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch developer analysis
  const fetchDeveloperAnalysis = useCallback(async () => {
    if (!developerName.trim()) {
      setError('Developer name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const foundDeveloper = await developerService.getDeveloperAnalysis(developerName);
      if (!foundDeveloper) {
        setError(`No data found for &quot;${developerName}&quot;. Try searching for Emaar, Damac, or Nakheel.`);
        setDeveloperAnalysis(null);
      } else {
        setDeveloperAnalysis(foundDeveloper);
      }
    } catch (err) {
      console.error('Error fetching developer analysis:', err);
      setError('Failed to fetch developer analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [developerName]);

  // Function to fetch developer news using ChatGPT
  const fetchDeveloperNews = useCallback(async () => {
    if (!developerName.trim()) {
      setError('Developer name is required');
      return;
    }

    if (!apiKey.trim()) {
      setError('API key is required for fetching developer news');
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

      // Fetch developer news
      const news = await chatGptService.getDeveloperNews(developerName, apiKey);
      setDeveloperNews(news);
    } catch (err) {
      console.error('Error fetching developer news:', err);
      setError('Failed to fetch developer news. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [developerName, apiKey]);

  return {
    developerName,
    isLoading,
    developers,
    developerAnalysis,
    developerNews,
    error,
    setDeveloperName,
    setApiKey,
    fetchAllDevelopers,
    fetchDeveloperAnalysis,
    fetchDeveloperNews
  };
}; 