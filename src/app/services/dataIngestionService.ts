import axios from 'axios';
import openai from './initOpenAi';
import apiKeyService from './apiKeyService';

interface PropertyData {
  id: string;
  source: 'bayut' | 'propertyFinder' | 'dubaiLandDept';
  title: string;
  description: string;
  price: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  originalLanguage?: string;
  propertyType: string;
  [key: string]: any; // For additional attributes
}

interface DataIngestionOptions {
  translateToEnglish?: boolean;
  translateToArabic?: boolean;
  chunkSize?: number;
  removePII?: boolean;
}

/**
 * Service for ingesting and preprocessing Dubai property data
 */
class DataIngestionService {
  private readonly defaultChunkSize = 500;
  private readonly apiEndpoints = {
    bayut: 'https://api.bayut.com/properties',
    propertyFinder: 'https://api.propertyfinder.ae/properties',
    dubaiLandDept: 'https://api.dubai.gov.ae/land/properties'
  };
  private apiKeys: Record<string, string> = {};

  /**
   * Set API key for a specific data source
   */
  setApiKey(source: string, apiKey: string): void {
    this.apiKeys[source] = apiKey;
  }

  /**
   * Fetch property data from specified source
   */
  async fetchData(
    source: 'bayut' | 'propertyFinder' | 'dubaiLandDept',
    params: Record<string, any>
  ): Promise<PropertyData[]> {
    try {
      // Ensure API key is set for the source
      if (!this.apiKeys[source]) {
        throw new Error(`API key not set for ${source}`);
      }

      // Make API request to the appropriate source
      const response = await axios.get(this.apiEndpoints[source], {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKeys[source]}`,
          'Content-Type': 'application/json'
        }
      });

      // Process the response according to the source format
      let properties: PropertyData[] = [];
      
      switch (source) {
        case 'bayut':
          properties = this.processBayutData(response.data);
          break;
        case 'propertyFinder':
          properties = this.processPropertyFinderData(response.data);
          break;
        case 'dubaiLandDept':
          properties = this.processDubaiLandDeptData(response.data);
          break;
      }

      return properties;
    } catch (error) {
      console.error(`Error fetching data from ${source}:`, error);
      throw error;
    }
  }

  /**
   * Process property data from Bayut API
   */
  private processBayutData(data: any): PropertyData[] {
    return data.results.map((item: any) => ({
      id: item.id,
      source: 'bayut',
      title: item.title,
      description: item.description,
      price: parseFloat(item.price),
      size: this._convertToSquareFeet(item.area, item.area_unit),
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      location: item.location.join(', '),
      coordinates: item.geography ? {
        lat: item.geography.lat,
        lng: item.geography.lng
      } : undefined,
      amenities: item.amenities || [],
      images: item.images.map((img: any) => img.url),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      originalLanguage: item.language,
      propertyType: item.category
    }));
  }

  /**
   * Process property data from Property Finder API
   */
  private processPropertyFinderData(data: any): PropertyData[] {
    return data.properties.map((item: any) => ({
      id: item.property_id,
      source: 'propertyFinder',
      title: item.title,
      description: item.description,
      price: parseFloat(item.price.amount),
      size: this._convertToSquareFeet(item.size.value, item.size.unit),
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      location: item.location.name,
      coordinates: item.location.coordinates ? {
        lat: item.location.coordinates.latitude,
        lng: item.location.coordinates.longitude
      } : undefined,
      amenities: item.amenities || [],
      images: item.photos.map((photo: any) => photo.url),
      createdAt: item.listed_at,
      updatedAt: item.updated_at,
      originalLanguage: item.language,
      propertyType: item.property_type
    }));
  }

  /**
   * Process property data from Dubai Land Department API
   */
  private processDubaiLandDeptData(data: any): PropertyData[] {
    return data.data.map((item: any) => ({
      id: item.registration_id,
      source: 'dubaiLandDept',
      title: `${item.property_type} in ${item.community_name}`,
      description: item.description || `${item.property_type} property located in ${item.community_name}`,
      price: parseFloat(item.transaction_value),
      size: this._convertToSquareFeet(item.area_value, item.area_unit),
      bedrooms: item.number_of_bedrooms || 0,
      bathrooms: item.number_of_bathrooms || 0,
      location: `${item.community_name}, ${item.district_name}`,
      coordinates: item.coordinates ? {
        lat: item.coordinates.latitude,
        lng: item.coordinates.longitude
      } : undefined,
      amenities: [],
      images: [],
      createdAt: item.registration_date,
      updatedAt: item.registration_date,
      originalLanguage: 'en',
      propertyType: item.property_type
    }));
  }

  /**
   * Normalize property data and standardize units
   */
  async processPropertyData(
    properties: PropertyData[],
    options: DataIngestionOptions = {}
  ): Promise<PropertyData[]> {
    return Promise.all(properties.map(async (property) => {
      // Normalize and sanitize data
      const normalizedProperty = this.normalizePropertyData(property);
      const sanitizedProperty = this.sanitizePropertyData(normalizedProperty);
      
      // Handle translations if needed
      let processedProperty = sanitizedProperty;
      if (options.translateToEnglish && property.originalLanguage === 'ar') {
        processedProperty = await this.translatePropertyToEnglish(processedProperty);
      } else if (options.translateToArabic && property.originalLanguage === 'en') {
        processedProperty = await this.translatePropertyToArabic(processedProperty);
      }
      
      // Remove PII if requested
      if (options.removePII) {
        processedProperty.description = apiKeyService.anonymizeData(processedProperty.description);
        processedProperty.title = apiKeyService.anonymizeData(processedProperty.title);
      }
      
      return processedProperty;
    }));
  }

  /**
   * Normalize property data (standardize units, formats, etc.)
   */
  private normalizePropertyData(property: PropertyData): PropertyData {
    // Create a deep copy of the property
    const normalizedProperty = JSON.parse(JSON.stringify(property));
    
    // Standardize price to AED
    if (normalizedProperty.price) {
      normalizedProperty.price = this._convertToAED(normalizedProperty.price, property.currency || 'AED');
    }
    
    // Standardize date formats
    if (normalizedProperty.createdAt) {
      normalizedProperty.createdAt = new Date(normalizedProperty.createdAt).toISOString();
    }
    if (normalizedProperty.updatedAt) {
      normalizedProperty.updatedAt = new Date(normalizedProperty.updatedAt).toISOString();
    }
    
    // Standardize property types
    normalizedProperty.propertyType = this.standardizePropertyType(normalizedProperty.propertyType);
    
    return normalizedProperty;
  }

  /**
   * Sanitize property data (remove HTML, special markers, etc.)
   */
  private sanitizePropertyData(property: PropertyData): PropertyData {
    const sanitizedProperty = { ...property };
    
    // Remove HTML tags from description
    if (sanitizedProperty.description) {
      sanitizedProperty.description = sanitizedProperty.description
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace HTML entities
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }
    
    // Remove HTML from title
    if (sanitizedProperty.title) {
      sanitizedProperty.title = sanitizedProperty.title
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
    }
    
    // Remove proprietary markers
    if (sanitizedProperty.description) {
      sanitizedProperty.description = sanitizedProperty.description
        .replace(/\[BAYUT_EXCLUSIVE\]/gi, '')
        .replace(/\[PROPERTY_FINDER_EXCLUSIVE\]/gi, '')
        .replace(/\[AGENT_REF:[^\]]+\]/gi, '')
        .trim();
    }
    
    return sanitizedProperty;
  }

  /**
   * Translate property data to English
   */
  private async translatePropertyToEnglish(property: PropertyData): Promise<PropertyData> {
    const translatedProperty = { ...property };
    
    try {
      // Translate title and description
      if (property.title && property.originalLanguage === 'ar') {
        const titleResponse = await this.translateTextWithOpenAI(property.title, 'Arabic', 'English');
        translatedProperty.title = titleResponse;
      }
      
      if (property.description && property.originalLanguage === 'ar') {
        const descriptionResponse = await this.translateTextWithOpenAI(property.description, 'Arabic', 'English');
        translatedProperty.description = descriptionResponse;
      }
      
      translatedProperty.originalLanguage = 'en';
      
      return translatedProperty;
    } catch (error) {
      console.error('Error translating to English:', error);
      return property; // Return original if translation fails
    }
  }

  /**
   * Translate property data to Arabic
   */
  private async translatePropertyToArabic(property: PropertyData): Promise<PropertyData> {
    const translatedProperty = { ...property };
    
    try {
      // Translate title and description
      if (property.title && property.originalLanguage === 'en') {
        const titleResponse = await this.translateTextWithOpenAI(property.title, 'English', 'Arabic');
        translatedProperty.title = titleResponse;
      }
      
      if (property.description && property.originalLanguage === 'en') {
        const descriptionResponse = await this.translateTextWithOpenAI(property.description, 'English', 'Arabic');
        translatedProperty.description = descriptionResponse;
      }
      
      translatedProperty.originalLanguage = 'ar';
      
      return translatedProperty;
    } catch (error) {
      console.error('Error translating to Arabic:', error);
      return property; // Return original if translation fails
    }
  }

  /**
   * Translate text using OpenAI
   */
  private async translateTextWithOpenAI(text: string, fromLanguage: string, toLanguage: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are a professional translator. Translate the following text from ${fromLanguage} to ${toLanguage}. Maintain the original meaning, tone, and style.` 
          },
          { 
            role: "user", 
            content: text 
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Error in translation:', error);
      return text; // Return original if translation fails
    }
  }

  /**
   * Convert area to square feet (public method)
   */
  convertToSquareFeet(value: number, unit: string): number {
    return this._convertToSquareFeet(value, unit);
  }

  /**
   * Convert price to AED (public method)
   */
  convertToAED(value: number, currency: string): number {
    return this._convertToAED(value, currency);
  }

  /**
   * Convert area to square feet (private implementation)
   */
  private _convertToSquareFeet(value: number, unit: string): number {
    switch (unit.toLowerCase()) {
      case 'sqm':
      case 'sq m':
      case 'square meter':
      case 'square meters':
      case 'm²':
        return value * 10.7639;
      case 'sqft':
      case 'sq ft':
      case 'square foot':
      case 'square feet':
      case 'ft²':
        return value;
      default:
        return value;
    }
  }

  /**
   * Convert price to AED (private implementation)
   */
  private _convertToAED(value: number, currency: string): number {
    // Conversion rates as of current date (these should be updated regularly)
    const conversionRates: Record<string, number> = {
      'AED': 1,
      'USD': 3.6725,
      'EUR': 4.0173,
      'GBP': 4.6723
    };

    const rate = conversionRates[currency.toUpperCase()] || 1;
    return value * rate;
  }

  /**
   * Standardize property type naming
   */
  private standardizePropertyType(type: string): string {
    const typeMapping: Record<string, string> = {
      'apartment': 'Apartment',
      'flat': 'Apartment',
      'villa': 'Villa',
      'house': 'Villa',
      'townhouse': 'Townhouse',
      'duplex': 'Duplex',
      'penthouse': 'Penthouse',
      'commercial': 'Commercial',
      'office': 'Office',
      'retail': 'Retail',
      'land': 'Land',
      'plot': 'Land'
    };

    // Convert to lowercase for matching
    const lowerType = type.toLowerCase();
    
    // Check for exact matches or partial matches
    for (const [key, value] of Object.entries(typeMapping)) {
      if (lowerType === key || lowerType.includes(key)) {
        return value;
      }
    }
    
    // Return the original if no match is found
    return type;
  }

  /**
   * Split large text into chunks of specified token size
   */
  chunkText(text: string, maxTokens: number = this.defaultChunkSize): string[] {
    // Simple approximation: 1 token ≈ 4 characters in English
    const chunkSize = maxTokens * 4;
    const chunks: string[] = [];
    
    // Split by sentences to avoid cutting in the middle of a sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    for (const sentence of sentences) {
      // If adding this sentence would exceed chunk size, start a new chunk
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      currentChunk += sentence;
    }
    
    // Add the last chunk if not empty
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Process description text into chunks and sanitize
   */
  processDescriptionText(description: string, options: DataIngestionOptions = {}): string[] {
    // Sanitize the description
    const sanitizedDescription = description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Chunk the text
    const chunkSize = options.chunkSize || this.defaultChunkSize;
    return this.chunkText(sanitizedDescription, chunkSize);
  }
}

export const dataIngestionService = new DataIngestionService();
export default dataIngestionService; 