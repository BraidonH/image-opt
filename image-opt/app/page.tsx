import FileInput from "./_components/FileInput/page";
import { Share_Tech } from "next/font/google";
import Image from "next/image";

const shareTech = Share_Tech({
  variable: "--font-share-tech",
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <div className="pt-[50px] overflow-hidden">
      <main className="flex flex-col gap-8 lg:gap-[60px] row-start-2 items-center sm:items-start mx-auto max-w-[330px] lg:max-w-screen min-h-screen">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <Image height={100} width={100} alt="" src="./file.svg" />

          <h1 className={`text-white text-[56px] ${shareTech.variable}`}>
            FreeConvert – WebP Tool
          </h1>
        </div>
        <FileInput />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
