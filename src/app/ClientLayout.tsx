'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import openai from './services/initOpenAi';
import apiKeyService from './services/apiKeyService';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Update current path when component mounts or URL changes
    setCurrentPath(window.location.pathname);

    // Add event listener for route changes
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    
    // Initialize the OpenAI API key
    apiKeyService.initializeWithDefaultKey();
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-anti-flash-white">
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold text-dubai-blue-900 hover:text-tuscany transition-colors">
              JEEVA
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/property-lookup" 
              className={`transition-colors font-medium ${
                currentPath === '/property-lookup' 
                  ? 'text-tuscany border-b-2 border-tuscany pb-1' 
                  : 'text-dubai-blue-700 hover:text-tuscany'
              }`}
            >
              Property Lookup
            </Link>
            <Link 
              href="/rental-analysis" 
              className={`transition-colors font-medium ${
                currentPath === '/rental-analysis' 
                  ? 'text-tuscany border-b-2 border-tuscany pb-1' 
                  : 'text-dubai-blue-700 hover:text-tuscany'
              }`}
            >
              Rental Analysis
            </Link>
            <Link 
              href="/developer-analysis" 
              className={`transition-colors font-medium ${
                currentPath === '/developer-analysis' 
                  ? 'text-tuscany border-b-2 border-tuscany pb-1' 
                  : 'text-dubai-blue-700 hover:text-tuscany'
              }`}
            >
              Developer Analysis
            </Link>
            <Link 
              href="/demographics" 
              className={`transition-colors font-medium ${
                currentPath === '/demographics' 
                  ? 'text-tuscany border-b-2 border-tuscany pb-1' 
                  : 'text-dubai-blue-700 hover:text-tuscany'
              }`}
            >
              Demographics
            </Link>
            <Link 
              href="/settings" 
              className={`transition-colors font-medium ${
                currentPath === '/settings' 
                  ? 'text-tuscany border-b-2 border-tuscany pb-1' 
                  : 'text-dubai-blue-700 hover:text-tuscany'
              }`}
            >
              Settings
            </Link>
          </nav>
          <div className="md:hidden">
            <button 
              className="text-dubai-blue-900 hover:text-tuscany"
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
          <div className="md:hidden bg-white border-b border-gray-200 shadow-md absolute w-full z-50">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3">
                <Link href="/property-lookup" 
                  className={`py-2 transition-colors ${
                    currentPath === '/property-lookup' 
                      ? 'text-tuscany font-medium' 
                      : 'text-dubai-blue-700 hover:text-tuscany'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Property Lookup
                </Link>
                <Link href="/rental-analysis" 
                  className={`py-2 transition-colors ${
                    currentPath === '/rental-analysis' 
                      ? 'text-tuscany font-medium' 
                      : 'text-dubai-blue-700 hover:text-tuscany'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rental Analysis
                </Link>
                <Link href="/developer-analysis" 
                  className={`py-2 transition-colors ${
                    currentPath === '/developer-analysis' 
                      ? 'text-tuscany font-medium' 
                      : 'text-dubai-blue-700 hover:text-tuscany'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Developer Analysis
                </Link>
                <Link href="/demographics" 
                  className={`py-2 transition-colors ${
                    currentPath === '/demographics' 
                      ? 'text-tuscany font-medium' 
                      : 'text-dubai-blue-700 hover:text-tuscany'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Demographics
                </Link>
                <Link href="/settings" 
                  className={`py-2 transition-colors ${
                    currentPath === '/settings' 
                      ? 'text-tuscany font-medium' 
                      : 'text-dubai-blue-700 hover:text-tuscany'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
      </main>
      
      <footer className="bg-white shadow-inner border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-3 text-center text-sm text-dubai-blue-700 max-w-7xl">
          &copy; {new Date().getFullYear()} JEEVA - Dubai Property Market Analysis. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 