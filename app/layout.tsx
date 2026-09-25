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
  metadataBase: new URL("http://127.0.0.1:4173"),
  title: "小小历史旅行团｜沿着时间河去探险",
  description: "为 4–6 岁孩子设计的语音历史游戏：去洞穴找火种，和唐三彩骆驼逛长安，跟着人物、地点和真文物解开历史谜题。",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/favicon-180.png",
  },
  openGraph: {
    title: "小小历史旅行团",
    description: "沿着时间河，跟着人物、地点和真文物去历史里探险",
    images: [{ url: "/images/history-tour-social-v4.png", width: 1200, height: 630, alt: "小小历史旅行团" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "小小历史旅行团",
    description: "沿着时间河，跟着人物、地点和真文物去历史里探险",
    images: ["/images/history-tour-social-v4.png"],
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
