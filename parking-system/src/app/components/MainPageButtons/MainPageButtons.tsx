"use client";
import React from "react";
import Link from "next/link";


export default function MainPageButtons() {
    return (
      <div className="flex gap-4">
        <Link
          id="signin"
          className="bg-gray-300 text-black px-6 py-2 rounded-md hover:bg-gray-400"
          href="/signin"
        >
          Sign in
        </Link>
        <Link
          id="register"
          className="bg-gray-500 text-black px-6 py-2 rounded-md hover:bg-gray-600"
          href="/register"
        >
          Register
        </Link>
     </div>
    );
  }