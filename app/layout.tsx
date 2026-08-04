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
  metadataBase: new URL("https://shikong-danganju.jiangszzx.chatgpt.site"),
  title: "小小历史旅行团｜跟着真实文物听历史",
  description: "为 5–8 岁孩子设计的语音历史小游戏：看真实文物，听简单故事。",
  openGraph: {
    title: "小小历史旅行团",
    description: "跟着真实文物听历史",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "小小历史旅行团" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "小小历史旅行团",
    description: "跟着真实文物听历史",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
