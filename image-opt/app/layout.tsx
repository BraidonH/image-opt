import type { Metadata } from "next";
import { Geist_Mono, Share_Tech } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shareTech = Share_Tech({
  variable: "--font-share-tech",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "FreeWebConvert – WebP Image Converter",
  description: "Convert images to WebP format instantly. Fast, free, and no registration required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden scroll-smooth" suppressHydrationWarning>
      <meta name="google-adsense-account" content="ca-pub-5509282482580720"></meta>
      <body
        className={`${shareTech.variable} ${geistMono.variable} font-[family-name:var(--font-share-tech)] antialiased flex flex-col items-center min-h-screen`}
      >
        {children}
      </body>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5509282482580720"
     crossOrigin="anonymous"></script>
    </html>
  );
}
