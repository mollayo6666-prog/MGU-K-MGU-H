import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERS Lab — MGU-K & MGU-H Simulator",
  description: "An interactive classroom simulator for Formula 1's 2014–2025 hybrid energy recovery system.",
  openGraph: {
    title: "ERS Lab — MGU-K & MGU-H Simulator",
    description: "Turn wasted energy into lap time.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ERS Lab — MGU-K & MGU-H Simulator",
    description: "Turn wasted energy into lap time.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
