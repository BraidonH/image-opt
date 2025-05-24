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
        <div className="flex flex-row gap-2 lg:gap-4 self-start items-end">
          <Image height={30} width={30} alt="" src="./file.svg" className="lg:w-[80px] lg:w-[80px]"/>

          <h1 className={`text-white text-[18px] lg:text-[56px] ${shareTech.variable}`}>
            FreeConvert – WebP Tool
          </h1>
        </div>
        <FileInput />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
