/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function FileInput() {
  const inputRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const rangeRef = useRef<any>(null);

  const [file, setFile] = useState<any>(null);
  const [compressedFile, setCompressedFile] = useState<any>(null);
  const [compressedFileSize, setCompressedFileSize] = useState<any>(null);
  const [fileSize, setFileSize] = useState<any>(null);
  const [compression, setCompression] = useState<any>(0.5);
  const [uploading, setUploading] = useState<any>(false);
  useEffect(() => {
    convertImage();
  }, [file]);

  const uploadFile = (file: any) => {
    setUploading(true);
    const fileValue = file;
    const url = URL.createObjectURL(fileValue);
    setFile(url);
    setFileSize(file.size);
    console.log(compression);
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
          compression
        );
      };
    }
  };

  return (
    <section className=" flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 lg:items-start lg:justify-between py-8 px-8 bg-[#508aa547] rounded-lg lg:min-w-100%] lg:min-h-[504px]">
        <div className="flex flex-col items-center lg:min-h-[300px] min-h-[300px]">
          {file && uploading ? (
            <div className="flex flex-col justify-between lg:flex-row gap-3 lg:gap-4">
              <div className="flex flex-col gap-2 border-[1px] border-white p-4 rounded-md">
                <div className="flex gap-2">
                  <p className="font-bold">Original</p>
                  <div className="flex gap-2">
                    <label className="text-white">Size:</label>
                    <p className="text-red-200">{`${Math.floor(
                      fileSize / 8192
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
                  src={file}
                />
              </div>
              {compressedFile ? (
                <div className="flex flex-col gap-2 border-white p-4 rounded-md border-[1px]">
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex gap-2">
                      <p className="font-bold">Compressed</p>
                      <div className="flex gap-2">
                        <label className="text-white">Size:</label>
                        <p className="text-green-200">{`${Math.floor(
                          compressedFileSize / 8192
                        )} kb`}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <label className="font-bold">Quality:</label>
                      <p className="text-green-200">
                        {compression
                          .toString()
                          .replaceAll("0", "")
                          .replaceAll(".", "") + "0%"}
                      </p>
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
                <div></div>
              )}
              <DotLottieReact
                hidden={!compressedFile ? false : true}
                className={`${
                  compressedFile ? "hidden" : "flex"
                } max-w-[300px] object-cover max-h-[200px] lg:self-center`}
                src="https://lottie.host/25f4dd66-5821-4d2b-a4ee-04fdfa7ef3d0/a7MfJlH5m6.lottie"
                loop
                autoplay
                renderConfig={{
                  autoResize: true,
                }}
              />
              <canvas
                className="hidden"
                ref={canvasRef}
                width={file ? file.naturalWidth : 330}
                height={file ? file.naturalHeight : 330}
              ></canvas>
            </div>
          ) : null}
        </div>
        <div className="text-white font-bold rounded-md flex flex-col lg:flex-row gap-6 justify-between lg:min-w-full lg:max-w-full">
          {compressedFile ? (
            <a
              download
              href={compressedFile}
              className="hover:cursor bg-black p-4 rounded-lg lg:hidden text-center"
            >
              Download
            </a>
          ) : null}
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
          {compressedFile ? (
            <button className="bg-black p-0 items-center px-4 rounded-lg hidden lg:flex">
              <a download href={compressedFile}>
                Download
              </a>
            </button>
          ) : null}
          <div className="flex flex-col">
            <label>{`Quality: ${
              !rangeRef.current
                ? (0.5).toString().replaceAll("0", "").replaceAll(".", "") +
                  "0%"
                : compression
                    .toString()
                    .replaceAll("0", "")
                    .replaceAll(".", "") + "0%"
            }`}</label>
            <input
              ref={rangeRef}
              onChange={() => setCompression(rangeRef.current.value)}
              type="range"
              max="0.9"
              min="0.1"
              className="min-w-[200px]"
              step="0.1"
            />
          </div>
        </div>
      </div>
      <style jsx>
        {`
          input[type="range"] {
            accent-color: #5b6e26;
          }
        `}
      </style>
    </section>
  );
}
