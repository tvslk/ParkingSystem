'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

 const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Registration failed");
      return;
    }
    
    router.push('/signin');
  } catch (err) {
    setError("An error occurred. Please try again.");
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
             Welcome
           </h3>
 
           <p className="mt-1 text-center text-gray-500">
             Please, create an account
           </p>
 
           <form onSubmit={handleRegister} className="mt-4">
           <div className="w-full mt-4">
               <input
                 className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg"
                 type="fullName"
                placeholder="Full Name"
                aria-label="Full Name"
                 required
                 onChange={(e) => setFullName(e.target.value)}
               />
             </div>
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

             <div className="w-full mt-4">
               <input
                 className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg"
                 type="password"
                 placeholder="Confirm password"
                 aria-label="Confirm password"
                 required
                 onChange={(e) => setConfirmPassword(e.target.value)}
               />
             </div>
 
             <div className="flex items-center justify-center mt-4">
               
 
               <button
                 id="register"
                 type="submit"
                 className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-zinc-600 rounded-lg hover:bg-zinc-500 focus:outline-none"
                 >
                 Register
               </button>
             </div>
           </form>
         </div>
 
         <div className="flex items-center justify-center py-4 text-center bg-gray-50">
           <span className="text-sm text-zinc-500">
             Already have an account? 
           </span>
 
           <a
             href="/signin"
             className="mx-2 text-sm font-bold text-zinc-600 hover:underline"
           >
             Sign in
           </a>
         </div>
       </div>
       {error && <p className="mt-4 text-center text-red-500">{error}</p>}
     </div>
   );
 }