'use client'

import React from 'react';

interface ReservationStatusScreenProps {
  success?: string;
  error?: string;
}

export default function ReservationStatusScreen({
  success,
  error
}: ReservationStatusScreenProps) {
  const isError = Boolean(error);
  const message = error || success || 'All good here!';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-100 rounded-2xl p-6 shadow-md">
      {isError ? (
        /*X*/
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-zinc-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      ) : (
        /*Check*/
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-zinc-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}

      <h1 className={`text-2xl font-bold text-zinc-500`}>
        {isError ? 'Oops...' : 'Success!'}
      </h1>
      <p className="text-zinc-500 mt-2 text-center">
        {message}
      </p>
    </div>
  );
}