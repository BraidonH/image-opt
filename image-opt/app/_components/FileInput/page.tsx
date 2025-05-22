"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

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
          0.5
        );
      };
    }
  };

  return (
    <section className=" flex flex-col items-center">
      <div className="flex flex-col items-center gap-4">
        {file ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <label className="text-white">File Size:</label>
              <p className="text-red-200">{`${Math.floor(
                fileSize / 8192
              )} kb`}</p>
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
            {compressedFile ? (
              <div>
                <div className="flex gap-2">
                  <label className="text-white">File Size:</label>
                  <p className="text-green-200">{`${Math.floor(
                    compressedFileSize / 8192
                  )} kb`}</p>
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
            ) : null}
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
