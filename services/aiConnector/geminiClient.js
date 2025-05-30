const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');
const { getFromCache, setCache } = require('../utils/redis');

class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting helper
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Generate market analysis insights
   */
  async generateMarketInsights(marketData, analysisType = 'comprehensive') {
    try {
      await this.enforceRateLimit();
      
      const cacheKey = `ai:insights:${analysisType}:${this.hashData(marketData)}`;
      const cached = await getFromCache(cacheKey);
      
      if (cached) {
        logger.info('Returning cached market insights');
        return cached;
      }

      const prompt = this.buildMarketAnalysisPrompt(marketData, analysisType);
      
      logger.info(`Generating ${analysisType} market insights using Gemini 1.5 Pro`);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();
      
      const parsedInsights = this.parseMarketInsights(insights);
      
      // Cache for 2 hours
      await setCache(cacheKey, parsedInsights, 7200);
      
      logger.info('Market insights generated successfully');
      return parsedInsights;
      
    } catch (error) {
      logger.error('Error generating market insights:', error);
      throw new Error(`Failed to generate market insights: ${error.message}`);
    }
  }

  /**
   * Generate property investment recommendations
   */
  async generateInvestmentRecommendations(propertyData, userPreferences = {}) {
    try {
      await this.enforceRateLimit();
      
      const cacheKey = `ai:recommendations:${this.hashData({ propertyData, userPreferences })}`;
      const cached = await getFromCache(cacheKey);
      
      if (cached) {
        logger.info('Returning cached investment recommendations');
        return cached;
      }

      const prompt = this.buildInvestmentPrompt(propertyData, userPreferences);
      
      logger.info('Generating investment recommendations using Gemini 1.5 Pro');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const recommendations = response.text();
      
      const parsedRecommendations = this.parseInvestmentRecommendations(recommendations);
      
      // Cache for 1 hour
      await setCache(cacheKey, parsedRecommendations, 3600);
      
      logger.info('Investment recommendations generated successfully');
      return parsedRecommendations;
      
    } catch (error) {
      logger.error('Error generating investment recommendations:', error);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  /**
   * Generate market predictions
   */
  async generateMarketPredictions(historicalData, timeframe = '12m') {
    try {
      await this.enforceRateLimit();
      
      const cacheKey = `ai:predictions:${timeframe}:${this.hashData(historicalData)}`;
      const cached = await getFromCache(cacheKey);
      
      if (cached) {
        logger.info('Returning cached market predictions');
        return cached;
      }

      const prompt = this.buildPredictionPrompt(historicalData, timeframe);
      
      logger.info(`Generating ${timeframe} market predictions using Gemini 1.5 Pro`);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const predictions = response.text();
      
      const parsedPredictions = this.parseMarketPredictions(predictions);
      
      // Cache for 6 hours
      await setCache(cacheKey, parsedPredictions, 21600);
      
      logger.info('Market predictions generated successfully');
      return parsedPredictions;
      
    } catch (error) {
      logger.error('Error generating market predictions:', error);
      throw new Error(`Failed to generate predictions: ${error.message}`);
    }
  }

  /**
   * Analyze developer performance
   */
  async analyzeDeveloperPerformance(developerData) {
    try {
      await this.enforceRateLimit();
      
      const cacheKey = `ai:developer:${this.hashData(developerData)}`;
      const cached = await getFromCache(cacheKey);
      
      if (cached) {
        logger.info('Returning cached developer analysis');
        return cached;
      }

      const prompt = this.buildDeveloperAnalysisPrompt(developerData);
      
      logger.info('Analyzing developer performance using Gemini 1.5 Pro');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      
      const parsedAnalysis = this.parseDeveloperAnalysis(analysis);
      
      // Cache for 4 hours
      await setCache(cacheKey, parsedAnalysis, 14400);
      
      logger.info('Developer analysis completed successfully');
      return parsedAnalysis;
      
    } catch (error) {
      logger.error('Error analyzing developer performance:', error);
      throw new Error(`Failed to analyze developer: ${error.message}`);
    }
  }

  /**
   * Build market analysis prompt
   */
  buildMarketAnalysisPrompt(marketData, analysisType) {
    const basePrompt = `
As a Dubai real estate market expert, analyze the following market data and provide comprehensive insights.

Market Data:
${JSON.stringify(marketData, null, 2)}

Analysis Type: ${analysisType}

Please provide a detailed analysis including:
1. Current market trends and patterns
2. Key drivers affecting the market
3. Price movement analysis
4. Supply and demand dynamics
5. Investment opportunities and risks
6. Comparative analysis across different areas
7. Market outlook and recommendations

Format your response as a structured JSON object with the following structure:
{
  "summary": "Brief market overview",
  "trends": {
    "priceMovement": "analysis of price trends",
    "demandPatterns": "demand analysis",
    "supplyDynamics": "supply analysis"
  },
  "insights": [
    {
      "category": "insight category",
      "description": "detailed insight",
      "impact": "high/medium/low",
      "timeframe": "short/medium/long term"
    }
  ],
  "recommendations": [
    {
      "type": "recommendation type",
      "description": "detailed recommendation",
      "priority": "high/medium/low",
      "rationale": "reasoning behind recommendation"
    }
  ],
  "riskFactors": [
    {
      "risk": "risk description",
      "probability": "high/medium/low",
      "impact": "high/medium/low",
      "mitigation": "suggested mitigation strategy"
    }
  ],
  "marketOutlook": {
    "shortTerm": "3-6 months outlook",
    "mediumTerm": "6-18 months outlook",
    "longTerm": "18+ months outlook"
  }
}
`;
    return basePrompt;
  }

  /**
   * Build investment recommendation prompt
   */
  buildInvestmentPrompt(propertyData, userPreferences) {
    return `
As a Dubai real estate investment advisor, analyze the following property data and user preferences to provide personalized investment recommendations.

Property Data:
${JSON.stringify(propertyData, null, 2)}

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Provide investment recommendations in the following JSON format:
{
  "overallScore": "investment score out of 10",
  "recommendation": "buy/hold/avoid",
  "reasoning": "detailed explanation of recommendation",
  "strengths": ["list of property/investment strengths"],
  "weaknesses": ["list of concerns or weaknesses"],
  "financialProjections": {
    "expectedROI": "projected return on investment",
    "capitalAppreciation": "expected price appreciation",
    "rentalYield": "expected rental yield",
    "paybackPeriod": "estimated payback period"
  },
  "riskAssessment": {
    "riskLevel": "low/medium/high",
    "riskFactors": ["list of risk factors"],
    "mitigationStrategies": ["suggested risk mitigation approaches"]
  },
  "alternatives": [
    {
      "area": "alternative area",
      "reasoning": "why this alternative might be better",
      "advantages": ["list of advantages"]
    }
  ]
}
`;
  }

  /**
   * Build prediction prompt
   */
  buildPredictionPrompt(historicalData, timeframe) {
    return `
As a Dubai real estate market analyst, analyze the following historical data to generate market predictions for the next ${timeframe}.

Historical Data:
${JSON.stringify(historicalData, null, 2)}

Provide predictions in the following JSON format:
{
  "timeframe": "${timeframe}",
  "confidence": "confidence level (high/medium/low)",
  "predictions": {
    "priceMovement": {
      "direction": "up/down/stable",
      "magnitude": "percentage change expected",
      "reasoning": "factors driving price movement"
    },
    "demandTrends": {
      "overall": "increasing/decreasing/stable",
      "byArea": [
        {
          "area": "area name",
          "trend": "trend description",
          "factors": ["driving factors"]
        }
      ]
    },
    "marketEvents": [
      {
        "event": "predicted market event",
        "timeframe": "when it might occur",
        "impact": "expected impact on market"
      }
    ]
  },
  "keyFactors": [
    {
      "factor": "factor name",
      "influence": "positive/negative/neutral",
      "importance": "high/medium/low"
    }
  ],
  "scenarios": {
    "optimistic": "best case scenario",
    "realistic": "most likely scenario",
    "pessimistic": "worst case scenario"
  }
}
`;
  }

  /**
   * Build developer analysis prompt
   */
  buildDeveloperAnalysisPrompt(developerData) {
    return `
As a Dubai real estate expert, analyze the following developer data to provide comprehensive performance insights.

Developer Data:
${JSON.stringify(developerData, null, 2)}

Provide analysis in the following JSON format:
{
  "overallRating": "rating out of 10",
  "strengths": ["list of developer strengths"],
  "weaknesses": ["list of areas for improvement"],
  "performance": {
    "deliveryRecord": "assessment of on-time delivery",
    "qualityStandards": "assessment of build quality",
    "marketPresence": "assessment of market position",
    "financialStability": "assessment of financial health"
  },
  "projectAnalysis": [
    {
      "project": "project name",
      "performance": "performance assessment",
      "highlights": ["key highlights"],
      "concerns": ["any concerns"]
    }
  ],
  "marketPosition": {
    "ranking": "position in Dubai market",
    "competitiveAdvantages": ["unique selling points"],
    "marketShare": "estimated market share"
  },
  "investmentRecommendation": {
    "recommendation": "recommended investment approach",
    "reasoning": "detailed reasoning",
    "riskLevel": "low/medium/high"
  }
}
`;
  }

  /**
   * Parse market insights response
   */
  parseMarketInsights(response) {
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // If no JSON found, return structured response
      return {
        summary: response.substring(0, 500) + '...',
        rawResponse: response,
        parsed: false
      };
    } catch (error) {
      logger.error('Error parsing market insights:', error);
      return {
        summary: 'Analysis completed but parsing failed',
        rawResponse: response,
        parsed: false,
        error: error.message
      };
    }
  }

  /**
   * Parse investment recommendations response
   */
  parseInvestmentRecommendations(response) {
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      return {
        recommendation: 'Analysis completed',
        rawResponse: response,
        parsed: false
      };
    } catch (error) {
      logger.error('Error parsing investment recommendations:', error);
      return {
        recommendation: 'Analysis completed but parsing failed',
        rawResponse: response,
        parsed: false,
        error: error.message
      };
    }
  }

  /**
   * Parse market predictions response
   */
  parseMarketPredictions(response) {
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      return {
        predictions: 'Predictions generated',
        rawResponse: response,
        parsed: false
      };
    } catch (error) {
      logger.error('Error parsing market predictions:', error);
      return {
        predictions: 'Predictions generated but parsing failed',
        rawResponse: response,
        parsed: false,
        error: error.message
      };
    }
  }

  /**
   * Parse developer analysis response
   */
  parseDeveloperAnalysis(response) {
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      return {
        analysis: 'Developer analysis completed',
        rawResponse: response,
        parsed: false
      };
    } catch (error) {
      logger.error('Error parsing developer analysis:', error);
      return {
        analysis: 'Developer analysis completed but parsing failed',
        rawResponse: response,
        parsed: false,
        error: error.message
      };
    }
  }

  /**
   * Generate hash for caching
   */
  hashData(data) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Get client status
   */
  getStatus() {
    return {
      model: 'gemini-1.5-pro',
      apiKeyConfigured: !!this.apiKey,
      rateLimitDelay: this.rateLimitDelay,
      lastRequestTime: this.lastRequestTime
    };
  }
}

module.exports = GeminiClient; 