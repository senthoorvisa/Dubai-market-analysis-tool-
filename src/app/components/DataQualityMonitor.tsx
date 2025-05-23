"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaSync, 
  FaDatabase, FaGlobe, FaShieldAlt, FaClock, FaChartBar 
} from 'react-icons/fa';
import { validateConfiguration } from '../config/environment';

interface DataQualityMetrics {
  totalListings: number;
  confidence: number;
  sources: string[];
  lastUpdated: string;
  dataSource: 'real-time' | 'cached' | 'fallback';
  validationPassed: number;
  validationFailed: number;
  averageResponseTime: number;
  errorRate: number;
}

interface DataQualityMonitorProps {
  metrics?: DataQualityMetrics;
  className?: string;
}

const DataQualityMonitor: React.FC<DataQualityMonitorProps> = ({ 
  metrics, 
  className = "" 
}) => {
  const [configValidation, setConfigValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const validation = validateConfiguration();
    setConfigValidation(validation);
  }, []);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number): React.ReactNode => {
    if (confidence >= 0.8) return <FaCheckCircle className="text-green-600" />;
    if (confidence >= 0.6) return <FaExclamationTriangle className="text-yellow-600" />;
    return <FaTimes className="text-red-600" />;
  };

  const getDataSourceIcon = (source: string): React.ReactNode => {
    switch (source) {
      case 'real-time':
        return <FaGlobe className="text-green-600" title="Real-time web scraping" />;
      case 'cached':
        return <FaDatabase className="text-blue-600" title="Cached data" />;
      case 'fallback':
        return <FaShieldAlt className="text-orange-600" title="Fallback data" />;
      default:
        return <FaDatabase className="text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg border border-almond shadow-sm ${className}`}>
      {/* Header */}
      <div 
        className="p-3 border-b border-almond cursor-pointer hover:bg-beige/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaChartBar className="text-dubai-blue-600" />
            <span className="font-medium text-dubai-blue-900">Data Quality</span>
            
            {metrics && (
              <div className="flex items-center space-x-2">
                {getConfidenceIcon(metrics.confidence)}
                <span className={`text-sm font-medium ${getConfidenceColor(metrics.confidence)}`}>
                  {Math.round(metrics.confidence * 100)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {metrics && (
              <>
                {getDataSourceIcon(metrics.dataSource)}
                <span className="text-xs text-gray-500">
                  {metrics.totalListings} listings
                </span>
              </>
            )}
            <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          
          {/* Configuration Status */}
          {configValidation && (
            <div className="space-y-2">
              <h4 className="font-medium text-dubai-blue-900 text-sm">Configuration Status</h4>
              
              <div className={`flex items-center space-x-2 text-sm ${
                configValidation.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {configValidation.isValid ? <FaCheckCircle /> : <FaTimes />}
                <span>
                  {configValidation.isValid ? 'Configuration Valid' : 'Configuration Issues Detected'}
                </span>
              </div>

              {configValidation.warnings.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-yellow-600">Warnings:</p>
                  {configValidation.warnings.map((warning, index) => (
                    <p key={index} className="text-xs text-yellow-600 ml-4">
                      • {warning}
                    </p>
                  ))}
                </div>
              )}

              {configValidation.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-600">Errors:</p>
                  {configValidation.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 ml-4">
                      • {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data Metrics */}
          {metrics && (
            <div className="space-y-3">
              <h4 className="font-medium text-dubai-blue-900 text-sm">Data Metrics</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-beige/50 p-2 rounded">
                  <div className="text-xs text-gray-600">Data Source</div>
                  <div className="font-medium capitalize flex items-center space-x-1">
                    {getDataSourceIcon(metrics.dataSource)}
                    <span>{metrics.dataSource}</span>
                  </div>
                </div>
                
                <div className="bg-beige/50 p-2 rounded">
                  <div className="text-xs text-gray-600">Confidence Score</div>
                  <div className={`font-medium ${getConfidenceColor(metrics.confidence)}`}>
                    {Math.round(metrics.confidence * 100)}% 
                    <span className="text-xs text-gray-500 ml-1">
                      ({metrics.confidence >= 0.8 ? 'High' : metrics.confidence >= 0.6 ? 'Medium' : 'Low'})
                    </span>
                  </div>
                </div>
                
                <div className="bg-beige/50 p-2 rounded">
                  <div className="text-xs text-gray-600">Total Listings</div>
                  <div className="font-medium">{metrics.totalListings.toLocaleString()}</div>
                </div>
                
                <div className="bg-beige/50 p-2 rounded">
                  <div className="text-xs text-gray-600">Last Updated</div>
                  <div className="font-medium flex items-center space-x-1">
                    <FaClock className="text-gray-500" />
                    <span>{formatTimestamp(metrics.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              {metrics.sources.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Active Sources</div>
                  <div className="flex flex-wrap gap-1">
                    {metrics.sources.map((source, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-tuscany/10 text-tuscany px-2 py-1 rounded-full"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Statistics */}
              {(metrics.validationPassed > 0 || metrics.validationFailed > 0) && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-xs text-green-600">Validation Passed</div>
                    <div className="font-medium text-green-700">{metrics.validationPassed}</div>
                  </div>
                  
                  <div className="bg-red-50 p-2 rounded">
                    <div className="text-xs text-red-600">Validation Failed</div>
                    <div className="font-medium text-red-700">{metrics.validationFailed}</div>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              {(metrics.averageResponseTime > 0 || metrics.errorRate >= 0) && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-xs text-blue-600">Avg Response Time</div>
                    <div className="font-medium text-blue-700">
                      {metrics.averageResponseTime.toFixed(1)}s
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-2 rounded">
                    <div className="text-xs text-orange-600">Error Rate</div>
                    <div className="font-medium text-orange-700">
                      {(metrics.errorRate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Metrics Available */}
          {!metrics && (
            <div className="text-center py-4 text-gray-500">
              <FaSync className="mx-auto mb-2 text-2xl" />
              <p className="text-sm">No data quality metrics available</p>
              <p className="text-xs">Metrics will appear after data fetching</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataQualityMonitor; 