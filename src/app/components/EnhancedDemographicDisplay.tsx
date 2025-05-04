"use client";

import React, { useState } from 'react';
import { 
  FaUsers, FaBuilding, FaMapMarkerAlt, FaChartPie, 
  FaGraduationCap, FaHospital, FaChild, FaMoneyBill, 
  FaCar, FaSchool, FaChartLine, FaCity, FaHome
} from 'react-icons/fa';

interface EnhancedDemographicDisplayProps {
  location: string;
  analysis: string;
}

const EnhancedDemographicDisplay: React.FC<EnhancedDemographicDisplayProps> = ({ location, analysis }) => {
  const [activeTab, setActiveTab] = useState('population');
  
  // Parse the markdown-like analysis into structured data
  const parseAnalysis = (text: string) => {
    const sections: { [key: string]: any } = {
      population: { title: 'Population Statistics', icon: <FaUsers className="text-indigo-500" /> },
      socioeconomic: { title: 'Socioeconomic Profile', icon: <FaMoneyBill className="text-emerald-500" /> },
      infrastructure: { title: 'Infrastructure Analysis', icon: <FaBuilding className="text-amber-500" /> },
      lifestyle: { title: 'Lifestyle & Community', icon: <FaCity className="text-rose-500" /> },
      realestate: { title: 'Real Estate Impact', icon: <FaHome className="text-sky-500" /> },
      future: { title: 'Future Outlook', icon: <FaChartLine className="text-purple-500" /> },
    };

    // Initialize content for each section
    Object.keys(sections).forEach(key => {
      sections[key].content = [];
    });

    let currentSection = '';
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Determine section based on headings
      if (line.startsWith('### Population Statistics')) {
        currentSection = 'population';
      } else if (line.startsWith('### Socioeconomic Profile')) {
        currentSection = 'socioeconomic';
      } else if (line.startsWith('### Infrastructure Analysis')) {
        currentSection = 'infrastructure';
      } else if (line.startsWith('### Lifestyle & Community')) {
        currentSection = 'lifestyle';
      } else if (line.startsWith('### Real Estate Impact')) {
        currentSection = 'realestate';
      } else if (line.startsWith('### Future Outlook')) {
        currentSection = 'future';
      }
      
      // Skip the heading line itself
      if (line.startsWith('###') || line.startsWith('AI-Powered Analysis:')) {
        continue;
      }
      
      // Add content to current section
      if (currentSection && line.trim()) {
        sections[currentSection].content.push(line);
      }
    }
    
    return sections;
  };
  
  // Function to format individual content items
  const formatContent = (content: string[]) => {
    const result = [];
    let currentHeader = '';
    let currentListItems: string[] = [];
    
    for (let i = 0; i < content.length; i++) {
      const line = content[i];
      
      // Bold text with ** is a header - remove the asterisks
      if (line.includes('**')) {
        // Push previous list if exists
        if (currentHeader && currentListItems.length > 0) {
          result.push(
            <div key={currentHeader} className="mb-4">
              <h4 className="demo-header">{currentHeader}</h4>
              <ul className="demo-list">
                {currentListItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          );
          currentListItems = [];
        }
        
        // Process the line to remove asterisks and handle label:value format
        const processedLine = line.replace(/\*\*/g, '');
        
        if (processedLine.includes(':')) {
          // This is a label-value pair
          const [label, value] = processedLine.split(':');
          result.push(
            <div key={`header-${i}`} className="mb-2">
              <span className="font-medium text-dubai-blue-900">{label}:</span>
              <span className="ml-1">{value}</span>
            </div>
          );
        } else {
          // Just a header
          currentHeader = processedLine;
        }
      } 
      // Lines with hyphens are list items
      else if (line.trim().startsWith('-')) {
        const listItem = line.trim().substring(1).trim();
        currentListItems.push(listItem);
      } 
      // Regular paragraph text
      else if (line.trim()) {
        result.push(<p key={`p-${i}`} className="demo-paragraph">{line}</p>);
      }
    }
    
    // Push any remaining list
    if (currentHeader && currentListItems.length > 0) {
      result.push(
        <div key={currentHeader} className="mb-4">
          <h4 className="demo-header">{currentHeader}</h4>
          <ul className="demo-list">
            {currentListItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    
    return result;
  };

  const renderSectionIcon = (section: string) => {
    switch (section) {
      case 'population': return <FaUsers className="h-5 w-5" />;
      case 'socioeconomic': return <FaMoneyBill className="h-5 w-5" />;
      case 'infrastructure': return <FaBuilding className="h-5 w-5" />;
      case 'lifestyle': return <FaCity className="h-5 w-5" />;
      case 'realestate': return <FaHome className="h-5 w-5" />;
      case 'future': return <FaChartLine className="h-5 w-5" />;
      default: return <FaMapMarkerAlt className="h-5 w-5" />;
    }
  };

  const getTabClasses = (tab: string) => {
    return `demo-tab-button ${
      activeTab === tab
        ? 'demo-tab-button-active'
        : 'demo-tab-button-inactive'
    }`;
  };

  const getTabIndicatorColor = (tab: string) => {
    return `w-2 h-2 rounded-full demo-indicator-${tab}`;
  };

  const sections = parseAnalysis(analysis);
  
  return (
    <div className="bg-anti-flash-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-dubai-blue-900 to-tuscany p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaMapMarkerAlt />
          {location}
        </h2>
        <p className="text-white/80 mt-1">Comprehensive demographic analysis and insights</p>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Sidebar navigation */}
        <div className="md:w-72 bg-beige p-4">
          <nav className="space-y-2">
            {Object.keys(sections).map(section => (
              <button
                key={section}
                onClick={() => setActiveTab(section)}
                className={getTabClasses(section)}
              >
                <span className={getTabIndicatorColor(section)}></span>
                {renderSectionIcon(section)}
                <span>{sections[section].title}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content area */}
        <div className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-6">
            {sections[activeTab]?.icon}
            <h3 className="text-xl font-bold text-dubai-blue-900">{sections[activeTab]?.title}</h3>
          </div>
          
          <div className="demo-section-card demo-tab-fade-in">
            <div className="demo-content-section">
              {sections[activeTab]?.content.length > 0 ? (
                formatContent(sections[activeTab].content)
              ) : (
                <p className="text-gray-500">No information available for this section.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDemographicDisplay;