import type { Metadata } from "next";
import { Albert_Sans, Hanken_Grotesk } from "next/font/google";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { AuthProvider } from './contexts/AuthContext';
import "./globals.css";

const geistSans = Hanken_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parking System",
  description: "A parking system website built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <UserProvider>
        <AuthProvider>
          {children}
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}