'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PropertyDataPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the property-lookup page
    router.replace('/property-lookup');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-anti-flash-white">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-t-4 border-tuscany rounded-full mx-auto mb-4"></div>
        <p className="text-dubai-blue-900">Redirecting to Property Lookup...</p>
      </div>
    </div>
  );
} 