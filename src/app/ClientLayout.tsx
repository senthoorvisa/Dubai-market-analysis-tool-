'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import openai from './services/initOpenAi';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // OpenAI is already initialized in initOpenAi.ts
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold text-gray-700 hover:text-gray-600">
              NAAZ
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">Dashboard</Link>
            <Link href="/property-lookup" className="text-gray-700 hover:text-gray-900 font-medium">Property Lookup</Link>
            <Link href="/rental" className="text-gray-700 hover:text-gray-900 font-medium">Rental Analysis</Link>
            <Link href="/developer-analysis" className="text-gray-700 hover:text-gray-900 font-medium">Developer Analysis</Link>
            <Link href="/demographics" className="text-gray-700 hover:text-gray-900 font-medium">Demographics</Link>
            <Link href="/forecast" className="text-gray-700 hover:text-gray-900 font-medium">Price Forecast</Link>
            <Link href="/settings" className="text-gray-700 hover:text-gray-900 font-medium">Settings</Link>
          </nav>
          <div className="md:hidden">
            <button 
              className="text-gray-700 hover:text-gray-900"
              aria-label="Mobile Menu"
              onClick={toggleMobileMenu}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-md">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3">
                <Link href="/" 
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link href="/property-lookup" 
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Property Lookup
                </Link>
                <Link href="/rental" 
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rental Analysis
                </Link>
                <Link href="/developer-analysis" 
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Developer Analysis
                </Link>
                <Link href="/demographics" 
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Demographics
                </Link>
                <Link href="/forecast" 
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Price Forecast
                </Link>
                <Link href="/settings" 
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-white shadow-inner mt-8 border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 text-center text-sm text-gray-700">
          &copy; {new Date().getFullYear()} NAAZ. All rights reserved.
        </div>
      </footer>
    </>
  );
} 