'use client';

import { useState } from 'react';
import dataIngestionService from '../services/dataIngestionService';
import apiKeyService from '../services/apiKeyService';

const mockProperty = {
  id: "123456",
  source: "bayut" as const,
  title: "Luxury 3 Bedroom <b>Apartment</b> in Downtown Dubai",
  description: "<p>This stunning apartment features <b>modern amenities</b> and offers spectacular views of the Burj Khalifa. Located in the heart of Downtown Dubai, this property has easy access to Dubai Mall, restaurants, and public transportation.</p><p>Key Features:<br/>- Large balcony<br/>- Built-in wardrobes<br/>- Modern kitchen with appliances<br/>- Swimming pool access<br/>- Gym access<br/>- 24/7 security</p><p>[BAYUT_EXCLUSIVE] Contact agent John Doe at 971-55-123-4567 to schedule a viewing.</p>",
  price: 2500000,
  currency: "AED",
  size: 1500,
  area_unit: "sqft",
  bedrooms: 3,
  bathrooms: 3.5,
  location: "Downtown Dubai, Dubai",
  coordinates: {
    lat: 25.197197,
    lng: 55.274376
  },
  amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Balcony"],
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  createdAt: "2023-06-15T10:30:00Z",
  updatedAt: "2023-09-28T14:45:00Z",
  originalLanguage: "en",
  propertyType: "apartment"
};

// Arabic mock property for testing translation
const arabicMockProperty = {
  ...mockProperty,
  id: "123457",
  title: "شقة فاخرة من 3 غرف نوم في وسط مدينة دبي",
  description: "<p>تتميز هذه الشقة الرائعة بوسائل راحة حديثة وتوفر إطلالات رائعة على برج خليفة. تقع في قلب وسط مدينة دبي، وتتمتع هذه العقار بسهولة الوصول إلى دبي مول والمطاعم ووسائل النقل العام.</p><p>الميزات الرئيسية:<br/>- شرفة كبيرة<br/>- خزائن مدمجة<br/>- مطبخ حديث مع أجهزة<br/>- الوصول إلى حمام السباحة<br/>- الوصول إلى صالة الألعاب الرياضية<br/>- أمن على مدار 24 ساعة طوال أيام الأسبوع</p>",
  originalLanguage: "ar"
};

export default function DataIngestionTester() {
  const [apiKey, setApiKey] = useState('');
  const [processedProperty, setProcessedProperty] = useState(null);
  const [chunkSize, setChunkSize] = useState(500);
  const [isTranslateToEnglish, setIsTranslateToEnglish] = useState(false);
  const [isTranslateToArabic, setIsTranslateToArabic] = useState(false);
  const [isRemovedPII, setIsRemovedPII] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('english');

  const processMockData = async () => {
    try {
      setIsLoading(true);
      setError('');
      setProcessedProperty(null);

      if (!apiKey) {
        setError('Please enter your OpenAI API key first');
        setIsLoading(false);
        return;
      }

      // Set the API key securely
      if (!apiKeyService.secureSetApiKey(apiKey)) {
        setError('Invalid API key format');
        setIsLoading(false);
        return;
      }

      // Select property based on the active tab
      const propertyToProcess = activeTab === 'english' ? mockProperty : arabicMockProperty;

      // Process the mock property
      const processedData = await dataIngestionService.processPropertyData(
        [propertyToProcess],
        {
          translateToEnglish: isTranslateToEnglish,
          translateToArabic: isTranslateToArabic,
          chunkSize: parseInt(chunkSize.toString()),
          removePII: isRemovedPII
        }
      );

      if (processedData.length > 0) {
        // Process description into chunks
        const property = processedData[0];
        const descriptionChunks = dataIngestionService.processDescriptionText(
          property.description,
          { chunkSize: parseInt(chunkSize.toString()) }
        );

        // Set the processed property with chunks
        setProcessedProperty({
          ...property,
          descriptionChunks
        });
      }
    } catch (error) {
      console.error('Error processing data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Data Ingestion Tester</h2>
      
      {/* API Key Input */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">OpenAI API Key</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Enter your OpenAI API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Required for translation and PII removal</p>
      </div>
      
      {/* Options */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Chunk Size (tokens)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={chunkSize}
            onChange={(e) => setChunkSize(parseInt(e.target.value) || 500)}
            min="100"
            max="2000"
          />
        </div>
        
        <div className="flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="translateToEnglish"
              checked={isTranslateToEnglish}
              onChange={(e) => {
                setIsTranslateToEnglish(e.target.checked);
                if (e.target.checked) setIsTranslateToArabic(false);
              }}
              className="mr-2"
            />
            <label htmlFor="translateToEnglish">Translate to English</label>
          </div>
          
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="translateToArabic"
              checked={isTranslateToArabic}
              onChange={(e) => {
                setIsTranslateToArabic(e.target.checked);
                if (e.target.checked) setIsTranslateToEnglish(false);
              }}
              className="mr-2"
            />
            <label htmlFor="translateToArabic">Translate to Arabic</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="removePII"
              checked={isRemovedPII}
              onChange={(e) => setIsRemovedPII(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="removePII">Remove PII (phone numbers, emails)</label>
          </div>
        </div>
      </div>
      
      {/* Sample Selection Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 ${activeTab === 'english' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('english')}
          >
            English Sample
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'arabic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('arabic')}
          >
            Arabic Sample
          </button>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="mb-6">
        <button
          className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={processMockData}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Process Sample Data'}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Results */}
      {processedProperty && (
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-semibold mb-3">Processed Property</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium">Title</h4>
              <p className="p-2 bg-gray-50 rounded-md">{processedProperty.title}</p>
            </div>
            
            <div>
              <h4 className="font-medium">Language</h4>
              <p className="p-2 bg-gray-50 rounded-md">
                {processedProperty.originalLanguage === 'en' ? 'English' : 'Arabic'}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium">Sanitized Description</h4>
            <p className="p-2 bg-gray-50 rounded-md whitespace-pre-line">
              {processedProperty.description}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Description Chunks ({processedProperty.descriptionChunks?.length || 0})</h4>
            <div className="border border-gray-200 rounded-md divide-y">
              {processedProperty.descriptionChunks?.map((chunk: string, index: number) => (
                <div key={index} className="p-2 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">Chunk {index + 1}</div>
                  <p>{chunk}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            <strong>Note:</strong> In a real application, this processed data would be stored in a vector database for semantic search.
          </div>
        </div>
      )}
    </div>
  );
} 