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
  title: "ERS 실험실 — MGU-K·MGU-H 시뮬레이터",
  description: "F1의 2014–2025 하이브리드 에너지 회수 시스템을 한 장으로 배우는 과학 수업용 시뮬레이터입니다.",
  openGraph: {
    title: "ERS 실험실 — MGU-K·MGU-H 시뮬레이터",
    description: "버려질 에너지가 어떻게 다시 가속력이 되는지 한 장으로 알아보세요.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ERS 실험실 — MGU-K·MGU-H 시뮬레이터",
    description: "버려질 에너지가 어떻게 다시 가속력이 되는지 한 장으로 알아보세요.",
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
