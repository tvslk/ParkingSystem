'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      console.log("Token received:", data.token);
      localStorage.setItem("token", data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-12 lg:px-8">
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4">
          <div className="flex justify-center mx-auto">
            <img
              className="w-auto h-7 sm:h-8"
              src="/ps-gray.svg"
              alt="Logo"
            />
          </div>

          <h3 className="mt-3 text-xl font-medium text-center text-gray-600">
            Welcome Back
          </h3>

          <p className="mt-1 text-center text-gray-500">
            Login or create account
          </p>

          <form onSubmit={handleSignIn} className="mt-4">
            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg"
                type="email"
                placeholder="Email Address"
                aria-label="Email Address"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg"
                type="password"
                placeholder="Password"
                aria-label="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Forget Password?
              </a>

              <button
                id="signin"
                type="submit"
                className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-zinc-600 rounded-lg hover:bg-zinc-500 focus:outline-none "
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-zinc-500">
            Don't have an account? 
          </span>

          <a
            href="/register"
            className="mx-2 text-sm font-bold text-zinc-600 hover:underline"
          >
            Register
          </a>
        </div>
      </div>
      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
}