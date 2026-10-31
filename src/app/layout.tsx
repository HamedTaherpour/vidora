import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import "@/lib/env/server";
import "./globals.css";

const vazirmatn = localFont({
  src: "../assets/fonts/Vazirmatn[wght].woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ویدورا | بازار فوتیج حرفه‌ای",
  description: "فوتیج‌های حرفه‌ای و آماده استفاده برای پروژه‌های ویدیویی شما.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl" className={cn("font-sans", vazirmatn.variable)}>
      <body>{children}</body>
    </html>
  );
}
