import type { Metadata } from "next";
import { Geist, Geist_Mono, Bungee_Hairline } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bungeeHairline = Bungee_Hairline({
    weight: '400',
    variable: "--font-bungee",
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Almighty Doug",
  description: "A shrine to Almighty Doug",
    icons: {
      icon: "/icon.png",
    }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
            className={`${bungeeHairline.variable} ${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
        >
            <main className="flex-100">
                {children}
            </main>
            <Footer />
        </body>

    </html>
  );
}
