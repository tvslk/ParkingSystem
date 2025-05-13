'use client';
import { useState, useEffect } from 'react';

export default function MainPageButtons() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const mobilePattern = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/;
    setIsMobile(mobilePattern.test(ua));
  }, []);

  const mobilePrefix = isMobile ? '/m' : '';

  return (
    <div className="flex gap-4">
      <button
        id="main-page-button"
        onClick={() => (window.location.href = `/api/auth/login?prompt=login&returnTo=${mobilePrefix}/dashboard`)}
        className="h-10 px-5 py-3 font-medium text-sm text-[#637381] bg-transparent border border-[#b9babb] rounded-[10px] flex justify-center items-center gap-2.5 transition-colors duration-300 transform hover:bg-zinc-200 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75h15m0 0-6-6m6 6-6 6" />
        </svg>
      </button>
      
    </div>
  );
}