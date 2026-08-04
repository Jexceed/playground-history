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
  title: "小小历史旅行团｜沿着中华文明时间河出发",
  description: "为 5–8 岁孩子设计的语音历史游戏：沿中国历史主轴，看真实文物，听有前后逻辑的故事。",
  openGraph: {
    title: "小小历史旅行团",
    description: "沿中国历史主轴，看真实文物，听完整故事",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "小小历史旅行团" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "小小历史旅行团",
    description: "沿中国历史主轴，看真实文物，听完整故事",
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
