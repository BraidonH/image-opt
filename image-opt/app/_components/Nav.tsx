import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <nav className="w-full" aria-label="Main">
      <div className="flex flex-col items-start gap-6 sm:gap-7 w-full pt-4 sm:pt-6 pb-2">
        <div className="flex items-center justify-between w-full">
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
              <h1 className="text-slate-100 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                FreeWebConvert
              </h1>
              <p className="text-slate-400 font-medium text-sm sm:text-base tracking-wide">
                WebP Converter
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-slate-500 text-left text-sm sm:text-base max-w-md leading-relaxed theme-text-muted">
          Convert images to WebP in your browser — paste, batch ZIP, per-image quality. Free, private, no signup.
        </p>
      </div>
    </nav>
  );
}
