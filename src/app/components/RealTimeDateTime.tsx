"use client";

import { useState, useEffect } from 'react';

export default function RealTimeDateTime() {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Dubai'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Dubai',
      hour12: true
    });
  };

  return (
    <div className="bg-gradient-to-r from-dubai-blue-900 to-tuscany text-white p-4 rounded-lg shadow-lg mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-2 md:mb-0">
          <span className="text-2xl mr-3">🕐</span>
          <div>
            <h3 className="text-lg font-semibold">Live Data Status</h3>
            <p className="text-sm opacity-90">Real-time market data updated continuously</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{formatTime(currentDateTime)}</div>
          <div className="text-sm opacity-90">{formatDate(currentDateTime)}</div>
          <div className="text-xs opacity-75 mt-1">Dubai Time (GMT+4)</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="flex items-center justify-center text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          <span>All property data synchronized with Dubai Land Department</span>
        </div>
      </div>
    </div>
  );
} 