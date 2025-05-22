import FileInput from "./_components/FileInput/page";

export default function Home() {
  return (
    <div className="pt-[100px] overflow-hidden">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start mx-auto max-w-[330px]">
        <FileInput />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
