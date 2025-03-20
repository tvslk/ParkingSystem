"use client";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}