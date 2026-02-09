

import dynamic from "next/dynamic";
import { Share_Tech } from "next/font/google";
import Image from "next/image";
import type { Metadata } from "next";

const FileInput = dynamic(() => import("./_components/FileInput/page"), {
  ssr: true,
  loading: () => (
    <div className="w-full p-10 sm:p-12 rounded-2xl border-2 border-dashed border-slate-600/60 bg-slate-900/90 min-h-[320px] sm:min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="animate-spin h-10 w-10 border-2 border-slate-600 border-t-slate-400 rounded-full" />
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

const siteUrl = "https://freewebconvert.com";

export const metadata: Metadata = {
  title: "Free Online Image to WebP Converter | Batch ZIP, Paste & Per-Image Quality",
  description:
    "Convert images to WebP instantly in your browser. Drag & drop, paste from clipboard, or choose files. Per-image quality (10–90%), apply to all, download one or all as ZIP. Copy to clipboard, re-convert anytime. Max 50 images, 25 MB each. Free, private, no signup.",
  openGraph: {
    title: "Free WebP Converter | Batch ZIP, Paste, Per-Image Quality",
    description:
      "Convert JPG, PNG, GIF to WebP in-browser. Paste from clipboard, download all as ZIP, per-image or apply quality to all. Free, private, no signup.",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free WebP Converter | Batch ZIP & Paste",
    description: "Convert images to WebP in-browser. Paste, per-image quality, download all as ZIP. Free, private, no signup.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FreeWebConvert",
  description: "Free online image to WebP converter. Convert JPG, PNG, GIF to WebP in your browser. Drag & drop, paste from clipboard, or choose files. Per-image quality (10–90%), apply quality to all, download single files or all as ZIP. Copy to clipboard, re-convert with one click. Up to 50 images, 25 MB each. No upload to server—privacy-first.",
  url: siteUrl,
  applicationCategory: "MultimediaApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Convert images to WebP in the browser—no server upload",
    "Drag & drop, file picker, or paste from clipboard",
    "Per-image quality (10–90%) or apply one quality to all",
    "Download each WebP or download all as ZIP",
    "Copy WebP to clipboard",
    "Re-convert any image with one click",
    "Output filename: original name or name with quality suffix",
    "Savings summary and conversion progress",
    "Up to 50 images, 25 MB per file",
  ],
};

export default function Home() {
  return (
    <>
      <link rel="icon" href="./favicon.ico" sizes="any" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative min-h-screen w-full flex flex-col items-center bg-[#0a0e14] overflow-hidden">
        <main className="flex flex-col gap-12 sm:gap-16 lg:gap-20 items-center w-full max-w-6xl px-6 sm:px-10 lg:px-12 py-10 sm:py-14 lg:py-16 flex-1">
          <header className="flex flex-col items-start gap-6 sm:gap-7 w-full pt-4 sm:pt-6 pb-2">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-800/90 border border-slate-600/60 shadow-md">
                <Image
                  height={28}
                  width={28}
                  alt=""
                  src="./file.svg"
                  className="w-7 h-7 sm:w-8 sm:h-8 opacity-90"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <h1
                  className={`text-slate-100 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight ${shareTech.variable}`}
                >
                  FreeWebConvert
                </h1>
                <p className="text-slate-400 font-medium text-sm sm:text-base tracking-wide">
                  WebP Converter
                </p>
              </div>
            </div>
            <p className="text-slate-500 text-left text-sm sm:text-base max-w-md leading-relaxed">
              Convert images to WebP in your browser — paste, batch ZIP, per-image quality. Free, private, no signup.
            </p>
          </header>

          <FileInput />

          {/* How it works & Why WebP */}
          <section className="w-full flex flex-col gap-12 sm:gap-14 text-slate-400">
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-200">
                How to use
              </h2>
              <ol className="list-decimal list-inside space-y-4 text-sm sm:text-base leading-relaxed">
                <li className="pl-2">
                  <strong className="text-slate-200">Add images</strong> — Drag & drop, click &quot;Choose images&quot;, or paste from clipboard (Ctrl+V / Cmd+V). Up to 50 images, 25 MB each.
                </li>
                <li className="pl-2">
                  <strong className="text-slate-200">Adjust quality</strong> — Set 10–90% per image, or use &quot;Apply X% to all&quot; to set every image at once. Change quality and use &quot;Re-convert&quot; to regenerate.
                </li>
                <li className="pl-2">
                  <strong className="text-slate-200">Download or copy</strong> — Download each WebP, download all as ZIP, or copy a WebP to the clipboard. Choose output naming: original name or name with quality suffix.
                </li>
              </ol>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-200">
                Why use WebP?
              </h2>
              <ul className="space-y-4 text-sm sm:text-base leading-relaxed">
                <li className="flex gap-4">
                  <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
                  <span>
                    <strong className="text-slate-200">Smaller files</strong> —
                    WebP typically reduces image size by 25–35% compared to JPEG
                    and PNG at similar quality
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
                  <span>
                    <strong className="text-slate-200">Faster websites</strong> —
                    Smaller images mean quicker page loads and better UX
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
                  <span>
                    <strong className="text-slate-200">Privacy-first</strong> —
                    Your images never leave your device; conversion happens
                    entirely in your browser
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
                  <span>
                    <strong className="text-slate-200">Free & no signup</strong> —
                    No accounts, no watermarking. Up to 50 images (25 MB each) per session.
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </main>

        <footer className="w-full min-w-full py-6 px-6 sm:px-10 lg:px-12 bg-black/90 border-t border-slate-800">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <p className="text-slate-500 text-sm">Alpha 1.1.2</p>
          </div>
        </footer>
      </div>
    </>
  );
}
