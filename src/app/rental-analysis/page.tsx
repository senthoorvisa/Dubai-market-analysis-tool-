"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import RentalDataTable from '../components/RentalDataTable';
import '../styles/dubai-theme.css';

export default function RentalAnalysisPage() {
  return (
    <div className="min-h-screen bg-anti-flash-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-tuscany hover:text-tuscany/70 transition-colors">
              <FaArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-dubai-blue-900">Rental Analysis</h1>
          </div>
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
        <RentalDataTable />
      </div>
    </div>
  );
} 