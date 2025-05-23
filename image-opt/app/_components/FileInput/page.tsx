"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function FileInput() {
  const inputRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const imageRef = useRef<any>(null);

  const [file, setFile] = useState<any>(null);
  const [compressedFile, setCompressedFile] = useState<any>(null);
  const [compressedFileSize, setCompressedFileSize] = useState<any>(null);
  const [fileSize, setFileSize] = useState<any>(null);
  // const [toggle, setToggle] = useState<any>(null);
  useEffect(() => {
    convertImage();
  }, [file]);

  const uploadFile = (file: any) => {
    const fileValue = file;
    const url = URL.createObjectURL(fileValue);
    setFile(url);
    setFileSize(file.size);
  };

  const convertImage = () => {
    if (canvasRef.current != null && imageRef.current != null) {
      const ctx = canvasRef.current.getContext("2d");
      imageRef.current.onload = () => {
        canvasRef.current.height = imageRef.current.naturalHeight;
        canvasRef.current.width = imageRef.current.naturalWidth;
        ctx.drawImage(imageRef.current, 0, 0);
        canvasRef.current.toBlob(
          (blob: any) => {
            const fr = new FileReader();
            fr.readAsDataURL(blob);
            fr.onloadend = () => {
              const dataURL = fr.result;
              setCompressedFile(dataURL);
              setCompressedFileSize(blob.size);
            };
          },
          "image/webp",
          0.8
        );
      };
    }
  };

  return (
    <section className=" flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 lg:items-start lg:gap-8">
        {file ? (
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <p className="font-bold">Original</p>
                <div className="flex gap-2">
                  <label className="text-white">File Size:</label>
                  <p className="text-red-200">{`${Math.floor(
                    fileSize / 8192
                  )} kb`}</p>
                </div>
              </div>
              {/* <div
              data-index={0}
              className={`${
                toggle == this.dataset.index ? "" : "max-h-2 overflow-hidden"
              }`}
              onClick={() => }
            > */}
              {/* <div className="bg-white h-2"></div> */}
              <Image
                crossOrigin="anonymous"
                ref={imageRef}
                className={`h-[330px] w-[330px] rounded-md object-contain`}
                alt=""
                height={330}
                width={330}
                src={file}
              />
            </div>
            {compressedFile ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <p className="font-bold">Compressed</p>
                  <div className="flex gap-2">
                    <label className="text-white">File Size:</label>
                    <p className="text-green-200">{`${Math.floor(
                      compressedFileSize / 8192
                    )} kb`}</p>
                  </div>
                </div>
                <Image
                  crossOrigin="anonymous"
                  ref={imageRef}
                  className={`h-[330px] w-[330px] rounded-md object-contain`}
                  alt=""
                  height={330}
                  width={330}
                  src={compressedFile}
                />
              </div>
            ) : (
              <DotLottieReact
                className="max-w-[300px] object-cover max-h-[200px]"
                src="https://lottie.host/25f4dd66-5821-4d2b-a4ee-04fdfa7ef3d0/a7MfJlH5m6.lottie"
                loop
                autoplay
              />
            )}
            <canvas
              className="hidden"
              ref={canvasRef}
              width={file.naturalWidth}
              height={file.naturalHeight}
            ></canvas>
          </div>
        ) : null}
        <div className="text-white font-bold rounded-md">
          <input
            ref={inputRef}
            onChange={() =>
              uploadFile(
                inputRef.current != null ? inputRef.current.files[0] : ""
              )
            }
            className=" p-3 rounded-md bg-[#5b6e26] hover:cursor-pointer min-w-[330px]"
            type="file"
            accept="image/*"
          />
        </div>
      </div>
    </section>
  );
}
