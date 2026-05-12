import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Soap Studio",
  description: "수제비누 레시피 & 재료 관리",
  // manifest는 PWA 설정 시 추가 예정
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

/**
 * @component
 * @description 사용자 앱 루트 레이아웃. 하단 네비게이션 포함
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <main className="flex flex-1 flex-col pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
