"use client";

import Link from 'next/link';
import Image from 'next/image';
import PropertyLookupRefined from '../components/PropertyLookupRefined';

export default function PropertyLookupPage() {
  return (
    <div className="min-h-screen bg-anti-flash-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/naaz-logo.svg"
              alt="NAAZ Logo"
              width={40}
              height={40}
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
        <PropertyLookupRefined />
      </div>
    </div>
  );
} 