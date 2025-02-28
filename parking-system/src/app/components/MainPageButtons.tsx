"use client";
import React from "react";
import Link from "next/link";


export default function MainPageButtons() {
    return (
      <div className="flex gap-4">
        <Link
          id="signin"
          className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-zinc-400 rounded-lg hover:bg-zinc-300 focus:outline-none "
          href="/signin"
        >
          Sign in
        </Link>
        <Link
          id="register"
          className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-zinc-600 rounded-lg hover:bg-zinc-500 focus:outline-none "
          href="/register"
        >
          Register
        </Link>
     </div>
    );
  }