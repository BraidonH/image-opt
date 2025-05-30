import FileInput from "./_components/FileInput/page";
import { Share_Tech } from "next/font/google";
import Image from "next/image";
import type { Metadata } from "next";

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

      <div className="overflow-hidden bg-[#7abcdb47]  min-w-[100vw] flex flex-col items-center min-h-[100vh] justify-between">
        <main className="flex flex-col gap-8 lg:gap-[60px] row-start-2 items-center mx-auto max-w-[100%] lg:max-w-screen py-[20px]">
          <div className="flex flex-row gap-2 lg:gap-4 self-start items-end px-3 lg:pt-4 lg:px-0">
            <Image
              height={30}
              width={30}
              alt=""
              src="./file.svg"
              className="lg:w-[80px] lg:w-[80px] self-start mt-[6px] lg:m-[0px]"
            />

            <h1
              className={`text-white text-[30px] lg:text-[56px] ${shareTech.variable}`}
            >
              FreeWebConvert{" "}
              <span className="text-[20px] font-bold">
                –<br className="lg:hidden" /> WebP Tool
              </span>
            </h1>
          </div>
          <FileInput />
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-end min-h-[50px] bg-black min-w-[100vw] px-10">
          <p className="self-center">Alpha 1.1.2</p>
        </footer>
      </div>
    </>
  );
}
