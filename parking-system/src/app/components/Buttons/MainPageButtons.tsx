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
      <a
        id="signin"
        className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-zinc-400 rounded-lg hover:bg-zinc-300 focus:outline-none"
        href={`/api/auth/login?prompt=login&returnTo=${mobilePrefix}/dashboard`}
      >
        Sign in
      </a>
      <a
        id="register"
        className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-zinc-600 rounded-lg hover:bg-zinc-500 focus:outline-none"
        href={`/api/auth/signup?prompt=signup&returnTo=/login`}
      >
        Register
      </a>
    </div>
  );
}