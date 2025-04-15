// src/app/m/debug/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const router = useRouter();

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
    
    alert(`UserAgent: ${userAgent}\nIsMobile: ${isMobile}`);
    router.push(isMobile ? '/m/dashboard' : '/dashboard');
  }, [router]);

  return <div>Redirecting...</div>;
}