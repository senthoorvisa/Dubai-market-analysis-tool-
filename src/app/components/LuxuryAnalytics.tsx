"use client";

import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaChartLine, FaChartPie, FaChartBar, FaGlobe } from 'react-icons/fa';

// Market data for charts
const MARKET_DATA = {
  priceHistory: [
    { year: 2018, price: 1000 },
    { year: 2019, price: 950 },
    { year: 2020, price: 900 },
    { year: 2021, price: 1050 },
    { year: 2022, price: 1200 },
    { year: 2023, price: 1350 },
    { year: 2024, price: 1450 }
  ],
  propertyTypes: [
    { name: 'Apartment', value: 45 },
    { name: 'Villa', value: 25 },
    { name: 'Townhouse', value: 15 },
    { name: 'Penthouse', value: 10 },
    { name: 'Other', value: 5 }
  ],
  locationDemand: [
    { name: 'Dubai Marina', demand: 90 },
    { name: 'Downtown Dubai', demand: 85 },
    { name: 'Palm Jumeirah', demand: 80 },
    { name: 'Business Bay', demand: 75 },
    { name: 'Dubai Hills', demand: 70 }
  ],
  investmentReturns: [
    { name: 'Dubai Marina', return2020: 3.5, return2021: 4.2, return2022: 5.1, return2023: 5.8, return2024: 6.0 },
    { name: 'Downtown Dubai', return2020: 3.8, return2021: 4.5, return2022: 5.3, return2023: 6.0, return2024: 6.2 },
    { name: 'Palm Jumeirah', return2020: 4.0, return2021: 4.8, return2022: 5.5, return2023: 6.2, return2024: 6.5 },
    { name: 'Business Bay', return2020: 3.2, return2021: 3.9, return2022: 4.7, return2023: 5.4, return2024: 5.8 },
    { name: 'Dubai Hills', return2020: 3.0, return2021: 3.7, return2022: 4.5, return2023: 5.2, return2024: 5.6 }
  ]
};

// Colors for charts
const COLORS = ['#c8a43c', '#5b82f6', '#36648b', '#304878', '#1e293b'];

export default function LuxuryAnalytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price Trends Chart */}
      <div className="bg-dubai-blue-800/70 backdrop-blur-sm rounded-xl border border-dubai-blue-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-dubai-blue-800">
          <h2 className="text-xl font-bold flex items-center">
            <FaChartLine className="mr-2 text-gold-500" /> Price Trends (AED per sq ft)
          </h2>
        </div>
        <div className="p-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MARKET_DATA.priceHistory}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8a43c" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#c8a43c" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#304878" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#fff' }}
                axisLine={{ stroke: '#304878' }}
              />
              <YAxis 
                tick={{ fill: '#fff' }}
                axisLine={{ stroke: '#304878' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderColor: '#304878',
                  color: '#fff',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#c8a43c" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Property Type Distribution Chart */}
      <div className="bg-dubai-blue-800/70 backdrop-blur-sm rounded-xl border border-dubai-blue-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-dubai-blue-800">
          <h2 className="text-xl font-bold flex items-center">
            <FaChartPie className="mr-2 text-gold-500" /> Property Type Distribution
          </h2>
        </div>
        <div className="p-4 h-72 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MARKET_DATA.propertyTypes}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#304878' }}
              >
                {MARKET_DATA.propertyTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderColor: '#304878',
                  color: '#fff',
                  borderRadius: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Demand Chart */}
      <div className="bg-dubai-blue-800/70 backdrop-blur-sm rounded-xl border border-dubai-blue-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-dubai-blue-800">
          <h2 className="text-xl font-bold flex items-center">
            <FaChartBar className="mr-2 text-gold-500" /> Location Demand Index
          </h2>
        </div>
        <div className="p-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MARKET_DATA.locationDemand}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#304878" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#fff' }}
                axisLine={{ stroke: '#304878' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#fff' }}
                axisLine={{ stroke: '#304878' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderColor: '#304878',
                  color: '#fff',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar 
                dataKey="demand" 
                fillOpacity={0.8}
                barSize={30}
              >
                {MARKET_DATA.locationDemand.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Investment Returns Chart */}
      <div className="bg-dubai-blue-800/70 backdrop-blur-sm rounded-xl border border-dubai-blue-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-dubai-blue-800">
          <h2 className="text-xl font-bold flex items-center">
            <FaGlobe className="mr-2 text-gold-500" /> Investment Returns by Location
          </h2>
        </div>
        <div className="p-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={MARKET_DATA.investmentReturns}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#304878" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#fff' }}
                axisLine={{ stroke: '#304878' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#fff' }}
                axisLine={{ stroke: '#304878' }}
                label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: '#fff' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderColor: '#304878',
                  color: '#fff',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="return2024" 
                stroke={COLORS[0]} 
                strokeWidth={2}
                name="2024"
                dot={{ fill: COLORS[0], strokeWidth: 1, r: 4 }}
                activeDot={{ fill: COLORS[0], strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="return2023" 
                stroke={COLORS[1]} 
                strokeWidth={2}
                name="2023"
                dot={{ fill: COLORS[1], strokeWidth: 1, r: 4 }}
                activeDot={{ fill: COLORS[1], strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="return2022" 
                stroke={COLORS[2]} 
                strokeWidth={2}
                name="2022"
                dot={{ fill: COLORS[2], strokeWidth: 1, r: 4 }}
                activeDot={{ fill: COLORS[2], strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 