"use client";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
        <p className="mt-4 text-gray-600">Loading page...</p>
      </div>
    </div>
  );
}