"use client";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-9xl text-zinc-400">401</h1>
        <h5 className="text-4xl font-bold text-gray-700 mb-4">Unauthorized</h5>
        <p className="text-gray-700">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}