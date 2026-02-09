

import dynamic from "next/dynamic";
import { Share_Tech } from "next/font/google";
import Image from "next/image";
import type { Metadata } from "next";

const FileInput = dynamic(() => import("./_components/FileInput/page"), {
  ssr: true,
  loading: () => (
    <div className="w-full p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-600/50 bg-slate-800/30 min-h-[320px] sm:min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-2 border-slate-600 border-t-sky-400 rounded-full" />
        <span className="text-slate-400 text-sm">Loading...</span>
      </div>
    </div>
  ),
});

const shareTech = Share_Tech({
  variable: "--font-share-tech",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Free Online Image to WebP Converter | Fast & Easy WebP Conversion",
  description:
    "Convert your images to WebP format instantly with our free online tool. Supports JPG, PNG, GIF, and more. No registration required—fast, secure, and easy to use!",
};

export default function Home() {
  return (
    <>
      <link rel="icon" href="./favicon.ico" sizes="any" />

      <div className="relative min-h-screen w-full flex flex-col items-center bg-slate-900 overflow-hidden">
        {/* Subtle gradient mesh background */}
        <div
          className="fixed inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(56, 189, 248, 0.1), transparent)",
          }}
        />

        <main className="flex flex-col gap-8 sm:gap-12 lg:gap-16 items-center w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
          <header className="flex flex-col items-start gap-4 sm:gap-5 w-full pt-4 sm:pt-6 pb-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-lg shadow-slate-900/50">
                <Image
                  height={28}
                  width={28}
                  alt=""
                  src="./file.svg"
                  className="w-7 h-7 sm:w-8 sm:h-8 opacity-90"
                />
              </div>
              <div className="flex flex-col">
                <h1
                  className={`text-slate-100 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight ${shareTech.variable}`}
                >
                  FreeWebConvert
                </h1>
                <p className="text-sky-400 font-medium text-sm sm:text-base tracking-wide">
                  WebP Converter
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-left text-sm sm:text-base max-w-md">
              Convert images to WebP instantly — free, private, no signup
            </p>
          </header>

          <FileInput />

          {/* How it works & Why WebP */}
          <section className="w-full flex flex-col gap-8 sm:gap-10 text-slate-300">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
                How to use
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base">
                <li>
                  <strong className="text-slate-200">Upload</strong> — Drag and
                  drop your image or click &quot;Choose image&quot; to browse
                </li>
                <li>
                  <strong className="text-slate-200">Adjust quality</strong> —
                  Use the slider or enter a percentage (10–90%) to balance file
                  size vs. image quality
                </li>
                <li>
                  <strong className="text-slate-200">Download</strong> — Save
                  your optimized WebP file when conversion completes
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
                Why use WebP?
              </h2>
              <ul className="space-y-3 text-sm sm:text-base">
                <li className="flex gap-3">
                  <span className="text-sky-400 shrink-0">→</span>
                  <span>
                    <strong className="text-slate-200">Smaller files</strong> —
                    WebP typically reduces image size by 25–35% compared to JPEG
                    and PNG at similar quality
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sky-400 shrink-0">→</span>
                  <span>
                    <strong className="text-slate-200">Faster websites</strong> —
                    Smaller images mean quicker page loads and better UX
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sky-400 shrink-0">→</span>
                  <span>
                    <strong className="text-slate-200">Privacy-first</strong> —
                    Your images never leave your device; conversion happens
                    entirely in your browser
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sky-400 shrink-0">→</span>
                  <span>
                    <strong className="text-slate-200">Free & no signup</strong> —
                    No accounts, no limits, no watermarking
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </main>

        <footer className="w-full py-4 px-4 sm:px-6 lg:px-8 border-t border-slate-700/50 bg-slate-900/80">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <p className="text-slate-500 text-sm">Alpha 1.1.2</p>
          </div>
        </footer>
      </div>
    </>
  );
}
